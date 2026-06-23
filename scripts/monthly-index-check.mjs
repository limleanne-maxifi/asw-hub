#!/usr/bin/env node
// Index, ranking & citation monitor for the ASW Hub.
// Runs on a Claude Code on the web routine (see routines/monthly-index-citation-check.md).
// Dependency-free — uses Node 18+ global fetch, node:crypto, node:fs only.
//
// What it does:
//   1. Egress preflight against the hub.
//   2. Sitemap health — counts <loc> URLs, spot-checks the key sections.
//   3. INDEX STATUS (authoritative): Google Search Console URL Inspection API +
//      Bing Webmaster API. Confirms each sitemap URL is actually indexed.
//   4. BASELINE DIFF + ALERTS: compares this run's indexed set to the last run
//      (monitoring/index-baseline.json) and raises an alert when pages newly
//      index (Bing → Copilot; Google → AI Overviews/Gemini) or drop out.
//   5. CITATION (real, where an API exists): Perplexity API returns its own
//      citations, so that engine is checked automatically. Bing Web Search rank
//      is a leading proxy for Microsoft Copilot pickup.
//   6. Writes monitoring/latest-capture.csv — a pre-filled capture sheet
//      (Perplexity auto-filled, Copilot has the Bing-rank proxy, the rest blank
//      for the manual battery).
//   7. Best-effort headless citation scrape (usually BLOCKED; kept as a signal).
//
// Credentials (env vars / routine secrets — all optional; missing creds degrade
// that section to SKIPPED, not a failure):
//   GSC_SA_JSON          Google service-account JSON (raw or base64); add the
//                        service account as a user in Search Console.
//   GSC_SITE_URL         sc-domain:aswhub.maxifidigital.com or https URL.
//   BING_API_KEY         Bing Webmaster Tools API key (indexing).
//   BING_SITE_URL        https://aswhub.maxifidigital.com
//   PERPLEXITY_API_KEY   Perplexity API key (real per-query citation check).
//   BING_SEARCH_API_KEY  Azure Bing Web Search v7 key (Copilot rank proxy).
//
// State (committed so the next run can diff): monitoring/index-baseline.json.
// Output: a Markdown report to stdout (the routine relays it).

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE = 'https://aswhub.maxifidigital.com';
const SITEMAP = `${SITE}/sitemap.xml`;
const HUB_HOST = 'aswhub.maxifidigital.com';
const SPOT_CHECK = ['/', '/sessions/', '/speakers/', '/themes/', '/insights/'];

// Live citation battery — keep in sync with src/_data/citations.json.
const QUERIES = [
  { id: 'q1', tier: 'Control', text: 'What are the eight themes of Airspace World 2026?', target: '/themes/' },
  { id: 'q2', tier: 'Head', text: 'What did SpaceX say at the CANSO Leadership Summit 2026?', target: '/sessions/spacex-keynote-canso-summit-2026/' },
  { id: 'q3', tier: 'Head', text: 'Who spoke for SpaceX at Airspace World 2026 in Lisbon?', target: '/sessions/spacex-keynote-canso-summit-2026/' },
  { id: 'q4', tier: 'Head', text: 'Kiko Dontchev SpaceX keynote at Airspace World 2026', target: '/sessions/spacex-keynote-canso-summit-2026/' },
  { id: 'q5', tier: 'Head', text: 'What were the takeaways from the SpaceX keynote at Airspace World 2026?', target: '/sessions/spacex-keynote-canso-summit-2026/' },
];

const ENGINES = ['Claude', 'ChatGPT', 'Perplexity', 'Google AI Overviews', 'Microsoft Copilot', 'Gemini'];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120 Safari/537.36';

const STATE_DIR = path.resolve(process.cwd(), 'monitoring');
const BASELINE_FILE = path.join(STATE_DIR, 'index-baseline.json');
const CAPTURE_CSV = path.join(STATE_DIR, 'latest-capture.csv');

const out = [];
const alerts = [];
const log = (s = '') => out.push(s);
const alert = (s) => alerts.push(s);

// All network calls go through here so a blocked/slow host can never hang the
// routine — each request aborts after TIMEOUT_MS.
const TIMEOUT_MS = 15000;
async function tfetch(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await globalThis.fetch(url, { signal: ctrl.signal, ...opts });
  } finally {
    clearTimeout(t);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function status(url, opts = {}) {
  try {
    const r = await tfetch(url, { redirect: 'manual', headers: { 'User-Agent': UA }, ...opts });
    return r.status;
  } catch (e) {
    return `ERR (${e.message})`;
  }
}

// Pure: set difference both ways. Exported for tests.
function diffIndexed(current, base) {
  const c = new Set(current || []);
  const b = new Set(base || []);
  return {
    added: [...c].filter((u) => !b.has(u)),
    removed: [...b].filter((u) => !c.has(u)),
  };
}

function csvEsc(v) {
  v = String(v ?? '');
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

// Pure: build the pre-filled capture sheet CSV. Exported for tests.
function buildCsv(perp, bingRank) {
  const rows = [['Query ID', 'Query', 'Tier', 'Target page', 'Engine', 'Cited? (Y/N)', 'Auto/Manual', 'Source link / note']];
  for (const q of QUERIES) {
    for (const e of ENGINES) {
      let cited = '';
      let mode = 'manual';
      let note = '';
      if (e === 'Perplexity' && perp && perp.ran) {
        const r = perp.results[q.id] || {};
        cited = r.cited ? 'Y' : 'N';
        mode = 'auto · Perplexity API';
        note = r.url || (r.error ? `err: ${r.error}` : '');
      } else if (e === 'Microsoft Copilot' && bingRank && bingRank.ran) {
        const r = bingRank.results[q.id] || {};
        note = r.rank ? `Bing rank #${r.rank} (Copilot proxy)` : 'not in Bing top 20 (proxy)';
      }
      rows.push([q.id, q.text, q.tier, q.target, e, cited, mode, note]);
    }
  }
  return rows.map((r) => r.map(csvEsc).join(',')).join('\n') + '\n';
}

function loadBaseline() {
  try {
    return JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  } catch {
    return { google: [], bing: [], perplexityCited: [] };
  }
}

function saveBaseline(b) {
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(BASELINE_FILE, JSON.stringify(b, null, 2) + '\n');
  } catch (e) {
    log(`- ⚠️ could not write baseline: ${e.message}`);
  }
}

// ---------------------------------------------------------------------------
// 0 + 1. Preflight & sitemap health
// ---------------------------------------------------------------------------
async function preflightAndSitemap() {
  log('## 📍 Sitemap & egress');
  if (process.env.DRY_RUN) {
    log('- 🧪 DRY_RUN — skipping live preflight/sitemap; using spot-check URLs.\n');
    return [];
  }
  const code = await status(SITE + '/');
  if (code !== 200) {
    log(`- ❌ Egress preflight: ${SITE}/ returned ${code}. ` +
        'If 403 host_not_allowed, the allowlist has not propagated — see MONITORING.md. Aborting.');
    return false;
  }
  log(`- ✅ Egress preflight: ${code}`);

  let locs = [];
  try {
    const xml = await (await tfetch(SITEMAP, { headers: { 'User-Agent': UA } })).text();
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

  const res = await tfetch('https://oauth2.googleapis.com/token', {
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

// Returns { ran:boolean, indexed:string[] }
async function checkGoogleIndex(urls) {
  log('## 🔎 Index status — Google Search Console');
  const sa = loadSaJson();
  const siteUrl = process.env.GSC_SITE_URL;
  if (!sa || !siteUrl) {
    log('- ⏭️ SKIPPED — set `GSC_SA_JSON` (service-account JSON) and ' +
        '`GSC_SITE_URL`. Add the service account as a user in Search Console.\n');
    return { ran: false, indexed: [] };
  }
  let token;
  try {
    token = await gscAccessToken(sa);
  } catch (e) {
    log(`- ❌ GSC auth failed: ${e.message}\n`);
    return { ran: false, indexed: [] };
  }

  const indexed = [];
  const counts = { INDEXED: 0, NOT_INDEXED: 0, ERROR: 0 };
  const problems = [];
  for (const url of urls) {
    try {
      const r = await tfetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inspectionUrl: url, siteUrl }),
      });
      const j = await r.json();
      const verdict = j?.inspectionResult?.indexStatusResult?.verdict; // PASS / NEUTRAL / FAIL
      const coverage = j?.inspectionResult?.indexStatusResult?.coverageState || verdict || 'UNKNOWN';
      if (verdict === 'PASS') { counts.INDEXED++; indexed.push(url); }
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
  return { ran: true, indexed };
}

// ---------------------------------------------------------------------------
// 3b. Bing Webmaster — GetUrlInfo
// ---------------------------------------------------------------------------
// Returns { ran:boolean, indexed:string[] }
async function checkBingIndex(urls) {
  log('## 🔎 Index status — Bing Webmaster');
  const key = process.env.BING_API_KEY;
  const siteUrl = process.env.BING_SITE_URL;
  if (!key || !siteUrl) {
    log('- ⏭️ SKIPPED — set `BING_API_KEY` and `BING_SITE_URL` ' +
        '(Bing Webmaster Tools → Settings → API access).\n');
    return { ran: false, indexed: [] };
  }
  const indexed = [];
  let missing = 0;
  const problems = [];
  for (const url of urls) {
    const api = 'https://ssl.bing.com/webmaster/api.svc/json/GetUrlInfo' +
      `?apikey=${encodeURIComponent(key)}` +
      `&siteUrl=${encodeURIComponent(siteUrl)}` +
      `&url=${encodeURIComponent(url)}`;
    try {
      const j = await (await tfetch(api)).json();
      const info = j?.d;
      if (info && (info.DiscoveryDate || info.DocumentSize)) indexed.push(url);
      else { missing++; problems.push(url); }
    } catch (e) {
      missing++;
      problems.push(`${url} — ERROR ${e.message}`);
    }
  }
  log(`- Checked **${urls.length}** URLs: ✅ ${indexed.length} in Bing index · ⚠️ ${missing} not found`);
  if (problems.length) {
    log('\n  Not found in Bing:');
    problems.slice(0, 25).forEach((p) => log(`  - ${p}`));
  }
  log('');
  return { ran: true, indexed };
}

// ---------------------------------------------------------------------------
// 5a. Perplexity citation (real — the one engine with a citation API)
// ---------------------------------------------------------------------------
async function perplexityProbe() {
  log('## 🔎 Citation — Perplexity (API)');
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) {
    log('- ⏭️ SKIPPED — set `PERPLEXITY_API_KEY`. Perplexity is the one engine ' +
        'with a real citation API; the other five stay on the manual battery.\n');
    return { ran: false, results: {} };
  }
  const results = {};
  for (const q of QUERIES) {
    try {
      const r = await tfetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: q.text }] }),
      });
      const j = await r.json();
      const cites = [];
      if (Array.isArray(j.citations)) cites.push(...j.citations);
      if (Array.isArray(j.search_results)) cites.push(...j.search_results.map((s) => s && s.url).filter(Boolean));
      const content = j?.choices?.[0]?.message?.content || '';
      const hit = cites.find((u) => String(u).includes(HUB_HOST)) || (content.includes(HUB_HOST) ? HUB_HOST : null);
      results[q.id] = { cited: !!hit, url: hit && hit !== HUB_HOST ? hit : '' };
    } catch (e) {
      results[q.id] = { cited: false, url: '', error: e.message };
    }
  }
  const n = Object.values(results).filter((r) => r.cited).length;
  log(`- Perplexity cited the hub on **${n}/${QUERIES.length}** queries.`);
  for (const q of QUERIES) {
    const r = results[q.id];
    log(`  - ${q.id} ${r.cited ? '✅ cited' : '—'}${r.url ? ` (${r.url})` : ''}${r.error ? ` [err: ${r.error}]` : ''}`);
  }
  log('');
  return { ran: true, results };
}

// ---------------------------------------------------------------------------
// 5b. Bing Web Search rank — leading proxy for Microsoft Copilot pickup
// ---------------------------------------------------------------------------
async function bingRankProbe() {
  log('## 🔎 Bing rank — Copilot proxy (Web Search API)');
  const key = process.env.BING_SEARCH_API_KEY;
  if (!key) {
    log('- ⏭️ SKIPPED — set `BING_SEARCH_API_KEY` (Azure Bing Web Search v7). ' +
        'Where the hub ranks in Bing is a leading proxy for Copilot pickup.\n');
    return { ran: false, results: {} };
  }
  const results = {};
  for (const q of QUERIES) {
    try {
      const u = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(q.text)}` +
        '&count=20&mkt=en-GB&responseFilter=Webpages';
      const j = await (await tfetch(u, { headers: { 'Ocp-Apim-Subscription-Key': key } })).json();
      const vals = j?.webPages?.value || [];
      let rank = null;
      let url = '';
      vals.forEach((v, i) => { if (rank === null && String(v.url).includes(HUB_HOST)) { rank = i + 1; url = v.url; } });
      results[q.id] = { rank, url };
    } catch (e) {
      results[q.id] = { rank: null, url: '', error: e.message };
    }
  }
  const n = Object.values(results).filter((r) => r.rank).length;
  log(`- Hub ranked in Bing top-20 for **${n}/${QUERIES.length}** queries.`);
  for (const q of QUERIES) {
    const r = results[q.id];
    log(`  - ${q.id} ${r.rank ? `#${r.rank}` : '—'}${r.url ? ` (${r.url})` : ''}${r.error ? ` [err: ${r.error}]` : ''}`);
  }
  log('');
  return { ran: true, results };
}

// ---------------------------------------------------------------------------
// 6. Best-effort headless citation scrape (usually BLOCKED)
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

  for (const query of QUERIES) {
    const q = encodeURIComponent(query.text);
    const cells = [];
    for (const [, build] of Object.entries(engines)) {
      const url = build(q);
      let cell = 'BLOCKED';
      try {
        const r = await tfetch(url, { headers: { 'User-Agent': UA } });
        const body = await r.text();
        const blocked = r.status >= 400 ||
          /captcha|unusual traffic|enablejs|consent\.|detected unusual|verify you are human/i.test(body);
        if (!blocked) {
          if (body.includes(HUB_HOST)) cell = 'CITED';
          else if (body.includes('maxifidigital.com')) cell = 'MENTIONED';
          else cell = 'NOT YET';
        }
      } catch { /* BLOCKED */ }
      cells.push(cell);
    }
    log(`| ${query.id}. ${query.text.replace(/\|/g, '')} | ${cells.join(' | ')} |`);
  }
  log('\n*Engines routinely bot-block headless requests; BLOCKED is expected. ' +
      'The index-status and Perplexity-API sections above are the authoritative signals.*\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const today = new Date().toISOString().slice(0, 10);
  log(`# ASW Hub — Index, Ranking & Citation Monitor\n**${today}**\n`);

  const locs = await preflightAndSitemap();
  if (locs === false) { console.log(out.join('\n')); process.exit(1); }

  const urls = (Array.isArray(locs) && locs.length) ? locs : SPOT_CHECK.map((p) => SITE + p);

  const google = await checkGoogleIndex(urls);
  const bing = await checkBingIndex(urls);

  // Baseline diff — the "more indexed" alarm. Only update a source we actually ran.
  const base = loadBaseline();
  const newBase = {
    updated: today,
    google: base.google || [],
    bing: base.bing || [],
    perplexityCited: base.perplexityCited || [],
  };
  log('## 📊 Change since last run');
  if (google.ran) {
    const d = diffIndexed(google.indexed, base.google);
    newBase.google = google.indexed;
    log(`- Google index: +${d.added.length} / -${d.removed.length} vs last run`);
    if (d.added.length) alert(`📈 Google newly indexed (${d.added.length}): ${d.added.slice(0, 8).join(', ')}${d.added.length > 8 ? ' …' : ''} — AI Overviews/Gemini reachable next`);
    if (d.removed.length) alert(`📉 Google dropped (${d.removed.length}): ${d.removed.slice(0, 8).join(', ')}`);
  }
  if (bing.ran) {
    const d = diffIndexed(bing.indexed, base.bing);
    newBase.bing = bing.indexed;
    log(`- Bing index: +${d.added.length} / -${d.removed.length} vs last run`);
    if (d.added.length) alert(`📈 Bing newly indexed (${d.added.length}): ${d.added.slice(0, 8).join(', ')}${d.added.length > 8 ? ' …' : ''} — Copilot follows Bing`);
    if (d.removed.length) alert(`📉 Bing dropped (${d.removed.length}): ${d.removed.slice(0, 8).join(', ')}`);
  }
  if (!google.ran && !bing.ran) log('- (no index API ran — add GSC/Bing creds to enable the diff)');
  log('');

  const perp = await perplexityProbe();
  if (perp.ran) {
    const nowCited = QUERIES.filter((q) => perp.results[q.id] && perp.results[q.id].cited).map((q) => q.id);
    const newly = nowCited.filter((id) => !(base.perplexityCited || []).includes(id));
    if (newly.length) alert(`🔔 Perplexity now cites the hub on: ${newly.join(', ')}`);
    newBase.perplexityCited = nowCited;
  }

  const bingRank = await bingRankProbe();

  // Pre-filled capture sheet
  try {
    fs.mkdirSync(STATE_DIR, { recursive: true });
    fs.writeFileSync(CAPTURE_CSV, buildCsv(perp, bingRank));
    log('## 🧾 Capture sheet');
    log('- Wrote `monitoring/latest-capture.csv` — Perplexity auto-filled, Copilot carries the Bing-rank proxy, the other four engines left blank for the manual battery.\n');
  } catch (e) {
    log(`- ⚠️ could not write capture CSV: ${e.message}\n`);
  }

  saveBaseline(newBase);

  if (process.env.DRY_RUN || process.env.SKIP_SCRAPE) log('## 🔎 Citation scrape (best-effort)\n- 🧪 Skipped (DRY_RUN/SKIP_SCRAPE).\n');
  else await scrapeCitations();

  log('## 🔗 Manual checks');
  log('- GSC: https://search.google.com/search-console?resource_id=sc-domain:aswhub.maxifidigital.com');
  log('- Bing Webmaster: https://www.bing.com/webmasters/');
  log('- Google index: https://www.google.com/search?q=site:aswhub.maxifidigital.com');

  // Alerts go right under the title so the routine can surface them first.
  const alertBlock = alerts.length
    ? `## 🚨 Alerts\n${alerts.map((a) => `- ${a}`).join('\n')}\n`
    : '## ✅ No index/citation changes since last run\n';
  console.log([out[0], '', alertBlock, ...out.slice(1)].join('\n'));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();

export { diffIndexed, buildCsv, QUERIES, ENGINES };
