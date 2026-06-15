#!/usr/bin/env node
// Monthly indexing & citation check for the ASW Hub.
// Runs on the 15th of each month via the Claude Code on the web routine
// (see routines/monthly-index-citation-check.md). Dependency-free — uses
// the Node 18+ global fetch and node:crypto only.
//
// What it does:
//   1. Egress preflight against the hub.
//   2. Sitemap health — counts <loc> URLs, spot-checks the key sections.
//   3. INDEX STATUS (the reliable signal): Google Search Console URL
//      Inspection API + Bing Webmaster API. Confirms each sitemap URL is
//      actually indexed, not just reachable.
//   4. Citation scrape (best-effort): the 5 standard queries across five AI
//      answer engines. These usually bot-block the sandbox, so cells are
//      marked BLOCKED unless a real result is readable.
//
// Credentials (set as environment variables / routine secrets — all optional;
// missing creds degrade that section to SKIPPED with setup notes):
//   GSC_SA_JSON       Google service-account JSON (raw or base64). The service
//                     account must be added as a user in Search Console.
//   GSC_SITE_URL      Property URL, e.g. https://aswhub.maxifidigital.com/
//                     (or sc-domain:aswhub.maxifidigital.com for a domain prop)
//   BING_API_KEY      Bing Webmaster Tools API key.
//   BING_SITE_URL     Verified site, e.g. https://aswhub.maxifidigital.com
//
// Output: a Markdown report to stdout (the routine relays it).

import crypto from 'node:crypto';

const SITE = 'https://aswhub.maxifidigital.com';
const SITEMAP = `${SITE}/sitemap.xml`;
const SPOT_CHECK = ['/', '/sessions/', '/speakers/', '/themes/', '/insights/'];

const QUERIES = [
  'What sessions are at Airspace World 2026?',
  'Who are the speakers at ASW 2026?',
  'What is the CANSO ATM agenda for 2026?',
  'What sessions do I need to attend at Airspace World 2026 today?',
  'What are the key ATM themes at Airspace World 2026?',
];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120 Safari/537.36';

const out = [];
const log = (s = '') => out.push(s);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function status(url, opts = {}) {
  try {
    const r = await fetch(url, { redirect: 'manual', headers: { 'User-Agent': UA }, ...opts });
    return r.status;
  } catch (e) {
    return `ERR (${e.message})`;
  }
}

// ---------------------------------------------------------------------------
// 0 + 1. Preflight & sitemap health
// ---------------------------------------------------------------------------
async function preflightAndSitemap() {
  log('## 📍 Sitemap & egress');
  const code = await status(SITE + '/');
  if (code !== 200) {
    log(`- ❌ Egress preflight: ${SITE}/ returned ${code}. ` +
        'If 403 host_not_allowed, the allowlist has not propagated — see MONITORING.md. Aborting.');
    return false;
  }
  log(`- ✅ Egress preflight: ${code}`);

  let locs = [];
  try {
    const xml = await (await fetch(SITEMAP, { headers: { 'User-Agent': UA } })).text();
    locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    log(`- \`/sitemap.xml\`: **${locs.length}** \`<loc>\` URLs`);
  } catch (e) {
    log(`- ❌ Sitemap fetch failed: ${e.message}`);
  }

  log('\n| Section | Status |\n|---|---|');
  for (const p of SPOT_CHECK) {
    const c = await status(SITE + p);
    log(`| \`${p}\` | ${c === 200 ? '🟢 200' : `🔴 ${c}`} |`);
  }
  log('');
  return locs;
}

// ---------------------------------------------------------------------------
// 3a. Google Search Console — URL Inspection API
// ---------------------------------------------------------------------------
function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

function loadSaJson() {
  let raw = process.env.GSC_SA_JSON;
  if (!raw) return null;
  // Accept either raw JSON or base64-encoded JSON.
  if (!raw.trim().startsWith('{')) {
    try { raw = Buffer.from(raw, 'base64').toString('utf8'); } catch { /* fall through */ }
  }
  try { return JSON.parse(raw); } catch { return null; }
}

async function gscAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).end()
    .sign(sa.private_key).toString('base64url');
  const assertion = `${unsigned}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error(j.error_description || j.error || 'token exchange failed');
  return j.access_token;
}

async function checkGoogleIndex(urls) {
  log('## 🔎 Index status — Google Search Console');
  const sa = loadSaJson();
  const siteUrl = process.env.GSC_SITE_URL;
  if (!sa || !siteUrl) {
    log('- ⏭️ SKIPPED — set `GSC_SA_JSON` (service-account JSON) and ' +
        '`GSC_SITE_URL`. Add the service account as a user in Search Console.\n');
    return;
  }
  let token;
  try {
    token = await gscAccessToken(sa);
  } catch (e) {
    log(`- ❌ GSC auth failed: ${e.message}\n`);
    return;
  }

  const counts = { INDEXED: 0, NOT_INDEXED: 0, ERROR: 0 };
  const problems = [];
  for (const url of urls) {
    try {
      const r = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionUrl: url, siteUrl }),
      });
      const j = await r.json();
      const verdict = j?.inspectionResult?.indexStatusResult?.verdict; // PASS / NEUTRAL / FAIL
      const coverage = j?.inspectionResult?.indexStatusResult?.coverageState || verdict || 'UNKNOWN';
      if (verdict === 'PASS') counts.INDEXED++;
      else { counts.NOT_INDEXED++; problems.push(`${url} — ${coverage}`); }
    } catch (e) {
      counts.ERROR++;
      problems.push(`${url} — ERROR ${e.message}`);
    }
  }
  log(`- Inspected **${urls.length}** URLs: ✅ ${counts.INDEXED} indexed · ` +
      `⚠️ ${counts.NOT_INDEXED} not indexed · ❌ ${counts.ERROR} errors`);
  if (problems.length) {
    log('\n  Needs attention:');
    problems.slice(0, 25).forEach((p) => log(`  - ${p}`));
  }
  log('');
}

// ---------------------------------------------------------------------------
// 3b. Bing Webmaster — GetUrlInfo
// ---------------------------------------------------------------------------
async function checkBingIndex(urls) {
  log('## 🔎 Index status — Bing Webmaster');
  const key = process.env.BING_API_KEY;
  const siteUrl = process.env.BING_SITE_URL;
  if (!key || !siteUrl) {
    log('- ⏭️ SKIPPED — set `BING_API_KEY` and `BING_SITE_URL` ' +
        '(Bing Webmaster Tools → Settings → API access).\n');
    return;
  }
  let indexed = 0;
  let missing = 0;
  const problems = [];
  for (const url of urls) {
    const api = 'https://ssl.bing.com/webmaster/api.svc/json/GetUrlInfo' +
      `?apikey=${encodeURIComponent(key)}` +
      `&siteUrl=${encodeURIComponent(siteUrl)}` +
      `&url=${encodeURIComponent(url)}`;
    try {
      const j = await (await fetch(api)).json();
      // A populated UrlInfo (non-null DiscoveryDate / DocumentSize) means Bing
      // has the URL in its index.
      const info = j?.d;
      if (info && (info.DiscoveryDate || info.DocumentSize)) indexed++;
      else { missing++; problems.push(url); }
    } catch (e) {
      missing++;
      problems.push(`${url} — ERROR ${e.message}`);
    }
  }
  log(`- Checked **${urls.length}** URLs: ✅ ${indexed} in Bing index · ⚠️ ${missing} not found`);
  if (problems.length) {
    log('\n  Not found in Bing:');
    problems.slice(0, 25).forEach((p) => log(`  - ${p}`));
  }
  log('');
}

// ---------------------------------------------------------------------------
// 2. Citation scrape (best-effort)
// ---------------------------------------------------------------------------
async function scrapeCitations() {
  log('## 🔎 Citation scrape (best-effort)');
  log('| Query | Perplexity | Google | Bing | ChatGPT | Claude |');
  log('|---|---|---|---|---|---|');

  const engines = {
    Perplexity: (q) => `https://www.perplexity.ai/search?q=${q}`,
    Google: (q) => `https://www.google.com/search?q=${q}`,
    Bing: (q) => `https://www.bing.com/search?q=${q}`,
    ChatGPT: () => 'https://chatgpt.com/',
    Claude: () => 'https://claude.ai/',
  };

  for (let i = 0; i < QUERIES.length; i++) {
    const q = encodeURIComponent(QUERIES[i]);
    const cells = [];
    for (const [name, build] of Object.entries(engines)) {
      const url = build(q);
      let cell = 'BLOCKED';
      try {
        const r = await fetch(url, { headers: { 'User-Agent': UA } });
        const body = await r.text();
        const blocked = r.status >= 400 ||
          /captcha|unusual traffic|enablejs|consent\.|detected unusual|verify you are human/i.test(body);
        if (!blocked) {
          if (body.includes('aswhub.maxifidigital.com')) cell = 'CITED';
          else if (body.includes('maxifidigital.com')) cell = 'MENTIONED';
          else cell = 'NOT YET';
        }
      } catch { /* BLOCKED */ }
      cells.push(cell);
    }
    log(`| ${i + 1}. ${QUERIES[i].replace(/\|/g, '')} | ${cells.join(' | ')} |`);
  }
  log('\n*Engines routinely bot-block headless requests; BLOCKED is expected. ' +
      'Index-status sections above are the authoritative signal.*\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  const today = new Date().toISOString().slice(0, 10);
  log(`# ASW Hub — Monthly Index & Citation Report\n**${today}**\n`);

  const locs = await preflightAndSitemap();
  if (locs === false) { console.log(out.join('\n')); process.exit(1); }

  const urls = Array.isArray(locs) && locs.length ? locs : SPOT_CHECK.map((p) => SITE + p);
  await checkGoogleIndex(urls);
  await checkBingIndex(urls);
  await scrapeCitations();

  log('## 🔗 Manual checks');
  log('- GSC: https://search.google.com/search-console?resource_id=sc-domain:aswhub.maxifidigital.com');
  log('- Bing Webmaster: https://www.bing.com/webmasters/');
  log('- Google index: https://www.google.com/search?q=site:aswhub.maxifidigital.com');

  console.log(out.join('\n'));
})();
