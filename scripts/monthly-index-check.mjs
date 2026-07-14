#!/usr/bin/env node
// Monthly indexing & citation check for the ASW Hub.
// Runs on the 15th of each month via the Claude Code on the web routine
// (see routines/monthly-index-citation-check.md). Dependency-free — uses
// the Node 18+ global fetch plus node:crypto / node:fs / node:path only.
//
// What it does, in one pass:
//   0. Egress preflight against the hub.
//   1. Sitemap health — counts <loc> URLs, spot-checks the key sections.
//   2. INDEX STATUS (the reliable signal): Google Search Console URL
//      Inspection API + Bing Webmaster API. Confirms each sitemap URL is
//      actually indexed, not just reachable.
//   3. BASELINE DIFF — compares this run's per-URL index verdicts against
//      monitoring/index-baseline.json and reports what newly indexed / dropped
//      since last run, then rewrites the baseline. Newly-indexed Google pages
//      are the headline cue to re-run the manual battery.
//   4. PERPLEXITY citation probe (real API) + BING rank probe (Azure Bing Web
//      Search v7, a Copilot rank proxy) across the live citation battery from
//      src/_data/citations.json.
//   5. CAPTURE SHEET — writes monitoring/latest-capture.csv (6 engines × the
//      battery queries) pre-filled with the Perplexity/Copilot signals, ready
//      for the human 6-engine battery run.
//   6. Best-effort engine scrape (skipped when SKIP_SCRAPE=1) — usually
//      bot-blocked, so index status above is the authoritative signal.
//
// A "🚨 Alerts" block is assembled from all of the above and printed FIRST.
//
// Credentials (environment variables / routine secrets — all optional; a
// missing credential degrades that section to SKIPPED with setup notes):
//   GSC_SA_JSON          Google service-account JSON (raw or base64). The
//                        service account must be added as a user in Search Console.
//   GSC_SITE_URL         Property URL, e.g. https://aswhub.maxifidigital.com/
//                        (or sc-domain:aswhub.maxifidigital.com for a domain prop).
//   BING_API_KEY         Bing Webmaster Tools API key (index status).
//   BING_SITE_URL        Verified site, e.g. https://aswhub.maxifidigital.com.
//   PERPLEXITY_API_KEY   Perplexity API key (the one engine with a real citation API).
//   PERPLEXITY_MODEL     Optional, default "sonar".
//   BING_SEARCH_API_KEY  Azure Bing Web Search v7 key (Copilot rank proxy;
//                        distinct from BING_API_KEY).
//   SKIP_SCRAPE=1        Skip the best-effort headless scrape.
//
// Output: a Markdown report to stdout (the routine relays it) plus two files
// under monitoring/ (index-baseline.json, latest-capture.csv).

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'https://aswhub.maxifidigital.com';
const SITEMAP = `${SITE}/sitemap.xml`;
const SPOT_CHECK = ['/', '/sessions/', '/speakers/', '/themes/', '/insights/'];

const MON_DIR = 'monitoring';
const BASELINE_PATH = path.join(MON_DIR, 'index-baseline.json');
const CAPTURE_PATH = path.join(MON_DIR, 'latest-capture.csv');
const CITATIONS_PATH = path.join('src', '_data', 'citations.json');

// Fallback battery if src/_data/citations.json cannot be read.
const FALLBACK_BATTERY = {
  engines: [
    { id: 'claude', name: 'Claude' },
    { id: 'chatgpt', name: 'ChatGPT' },
    { id: 'perplexity', name: 'Perplexity' },
    { id: 'google-ai', name: 'Google AI Overviews' },
    { id: 'copilot', name: 'Microsoft Copilot' },
    { id: 'gemini', name: 'Gemini' },
  ],
  queries: [
    { id: 'q1', text: 'What are the eight themes of Airspace World 2026?', tier: 'Control', targetUrl: '/themes/' },
  ],
};

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120 Safari/537.36';

// Per-request timeout so a single hung fetch can't stall the unattended routine.
const TIMEOUT_MS = 15000;
const withTimeout = (opts = {}) => ({ signal: AbortSignal.timeout(TIMEOUT_MS), ...opts });

const out = [];
const log = (s = '') => out.push(s);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function status(url, opts = {}) {
  try {
    const r = await fetch(url, withTimeout({ redirect: 'manual', headers: { 'User-Agent': UA }, ...opts }));
    return r.status;
  } catch (e) {
    return `ERR (${e.message})`;
  }
}

function loadBattery() {
  try {
    const j = JSON.parse(fs.readFileSync(CITATIONS_PATH, 'utf8'));
    const engines = (j.engines || []).map((e) => ({ id: e.id, name: e.name }));
    const queries = (j.queries || []).map((q) => ({
      id: q.id, text: q.text, tier: q.tier || '', targetUrl: q.targetUrl || '/', targetLabel: q.targetLabel || '',
    }));
    if (engines.length && queries.length) return { engines, queries };
  } catch { /* fall through */ }
  return FALLBACK_BATTERY;
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
    return { ok: false, locs: [] };
  }
  log(`- ✅ Egress preflight: ${code}`);

  let locs = [];
  try {
    const xml = await (await fetch(SITEMAP, withTimeout({ headers: { 'User-Agent': UA } }))).text();
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
  return { ok: true, locs };
}

// ---------------------------------------------------------------------------
// 2a. Google Search Console — URL Inspection API
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
    return { ran: false, map: {}, total: urls.length };
  }
  let token;
  try {
    token = await gscAccessToken(sa);
  } catch (e) {
    log(`- ❌ GSC auth failed: ${e.message}\n`);
    return { ran: false, map: {}, total: urls.length };
  }

  const map = {};
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
      if (verdict === 'PASS') { counts.INDEXED++; map[url] = 'INDEXED'; }
      else { counts.NOT_INDEXED++; map[url] = coverage; problems.push(`${url} — ${coverage}`); }
    } catch (e) {
      counts.ERROR++;
      map[url] = `ERROR ${e.message}`;
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
  return { ran: true, map, total: urls.length, indexed: counts.INDEXED, notIndexed: counts.NOT_INDEXED, errors: counts.ERROR };
}

// ---------------------------------------------------------------------------
// 2b. Bing Webmaster — GetUrlInfo
// ---------------------------------------------------------------------------
async function checkBingIndex(urls) {
  log('## 🔎 Index status — Bing Webmaster');
  const key = process.env.BING_API_KEY;
  const siteUrl = process.env.BING_SITE_URL;
  if (!key || !siteUrl) {
    log('- ⏭️ SKIPPED — set `BING_API_KEY` and `BING_SITE_URL` ' +
        '(Bing Webmaster Tools → Settings → API access).\n');
    return { ran: false, map: {}, total: urls.length };
  }
  const map = {};
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
      if (info && (info.DiscoveryDate || info.DocumentSize)) { indexed++; map[url] = 'INDEXED'; }
      else { missing++; map[url] = 'NOT_FOUND'; problems.push(url); }
    } catch (e) {
      missing++;
      map[url] = `ERROR ${e.message}`;
      problems.push(`${url} — ERROR ${e.message}`);
    }
  }
  log(`- Checked **${urls.length}** URLs: ✅ ${indexed} in Bing index · ⚠️ ${missing} not found`);
  if (problems.length) {
    log('\n  Not found in Bing:');
    problems.slice(0, 25).forEach((p) => log(`  - ${p}`));
  }
  log('');
  return { ran: true, map, total: urls.length, indexed, missing };
}

// ---------------------------------------------------------------------------
// 3. Baseline diff
// ---------------------------------------------------------------------------
function readBaseline() {
  try { return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8')); } catch { return null; }
}

function diffEngine(prevMap, curMap) {
  const newlyIndexed = [];
  const newlyDropped = [];
  if (!prevMap || !curMap) return { newlyIndexed, newlyDropped, hasPrev: !!prevMap };
  for (const [u, st] of Object.entries(curMap)) {
    const p = prevMap[u];
    if (st === 'INDEXED' && p !== 'INDEXED') newlyIndexed.push(u);
    if (st !== 'INDEXED' && p === 'INDEXED') newlyDropped.push(u);
  }
  return { newlyIndexed, newlyDropped, hasPrev: true };
}

function reportDiff(prev, google, bing) {
  log('## 📈 Index changes since last baseline');
  if (!prev) {
    log('- ℹ️ No prior baseline found — seeding `monitoring/index-baseline.json` this run. ' +
        'Next month diffs against it.\n');
    return { google: diffEngine(null, google.map), bing: diffEngine(null, bing.map), baselineExisted: false };
  }
  log(`- Baseline from **${prev.updated || 'unknown date'}**.`);
  const dg = google.ran ? diffEngine(prev.google, google.map) : { newlyIndexed: [], newlyDropped: [], hasPrev: false };
  const db = bing.ran ? diffEngine(prev.bing, bing.map) : { newlyIndexed: [], newlyDropped: [], hasPrev: false };
  const line = (label, d, ran) => {
    if (!ran) { log(`- ${label}: section did not run this pass (baseline preserved).`); return; }
    log(`- ${label}: 🟢 +${d.newlyIndexed.length} newly indexed · 🔴 −${d.newlyDropped.length} dropped.`);
    d.newlyIndexed.slice(0, 15).forEach((u) => log(`    - 🟢 now indexed: ${u}`));
    d.newlyDropped.slice(0, 15).forEach((u) => log(`    - 🔴 dropped: ${u}`));
  };
  line('Google', dg, google.ran);
  line('Bing', db, bing.ran);
  log('');
  return { google: dg, bing: db, baselineExisted: true };
}

function writeBaseline(prev, google, bing, today, urlCount) {
  const obj = {
    updated: today,
    urlCount,
    google: google.ran ? google.map : (prev?.google || {}),
    bing: bing.ran ? bing.map : (prev?.bing || {}),
  };
  fs.mkdirSync(MON_DIR, { recursive: true });
  fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(obj, null, 2)}\n`);
}

// ---------------------------------------------------------------------------
// 4a. Perplexity citation probe (real API)
// ---------------------------------------------------------------------------
async function probePerplexity(queries) {
  log('## 🤖 Perplexity citation probe (API)');
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) {
    log('- ⏭️ SKIPPED — set `PERPLEXITY_API_KEY` (Perplexity API; egress host `api.perplexity.ai`).\n');
    return { ran: false, results: [] };
  }
  const model = process.env.PERPLEXITY_MODEL || 'sonar';
  const results = [];
  for (const q of queries) {
    const r = { id: q.id, query: q.text, result: 'NOT YET', source: '' };
    try {
      const resp = await fetch('https://api.perplexity.ai/chat/completions', withTimeout({
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: q.text }] }),
      }));
      if (!resp.ok) { r.result = `ERR ${resp.status}`; results.push(r); continue; }
      const j = await resp.json();
      const urls = [];
      if (Array.isArray(j.citations)) urls.push(...j.citations.filter((u) => typeof u === 'string'));
      if (Array.isArray(j.search_results)) urls.push(...j.search_results.map((s) => s && s.url).filter(Boolean));
      const content = j?.choices?.[0]?.message?.content || '';
      const hub = urls.find((u) => u.includes('aswhub.maxifidigital.com'));
      if (hub || /aswhub\.maxifidigital\.com/.test(content)) { r.result = 'CITED'; r.source = hub || ''; }
      else if (urls.some((u) => u.includes('maxifidigital.com'))) {
        r.result = 'MENTIONED'; r.source = urls.find((u) => u.includes('maxifidigital.com')) || '';
      } else r.result = 'NOT YET';
    } catch (e) { r.result = `ERR ${e.message}`; }
    results.push(r);
  }
  log(`- Model \`${model}\` over **${results.length}** battery queries:`);
  log('\n| # | Query | Result | Source |\n|---|---|---|---|');
  results.forEach((r) => log(`| ${r.id} | ${r.query.replace(/\|/g, '')} | ${r.result} | ${r.source || '—'} |`));
  log('');
  return { ran: true, model, results };
}

// ---------------------------------------------------------------------------
// 4b. Bing rank probe — Azure Bing Web Search v7 (Copilot rank proxy)
// ---------------------------------------------------------------------------
async function probeBingRank(queries) {
  log('## 📊 Bing rank — Copilot proxy');
  const key = process.env.BING_SEARCH_API_KEY;
  if (!key) {
    log('- ⏭️ SKIPPED — set `BING_SEARCH_API_KEY` (Azure Bing Web Search v7; ' +
        'egress host `api.bing.microsoft.com`). Distinct from `BING_API_KEY`.\n');
    return { ran: false, results: [] };
  }
  const results = [];
  for (const q of queries) {
    const r = { id: q.id, query: q.text, rank: null, note: '' };
    try {
      const u = 'https://api.bing.microsoft.com/v7.0/search' +
        `?q=${encodeURIComponent(q.text)}&count=30&mkt=en-GB&responseFilter=Webpages`;
      const resp = await fetch(u, withTimeout({ headers: { 'Ocp-Apim-Subscription-Key': key } }));
      if (!resp.ok) { r.note = `ERR ${resp.status}`; results.push(r); continue; }
      const j = await resp.json();
      const items = j?.webPages?.value || [];
      const idx = items.findIndex((it) => typeof it.url === 'string' && it.url.includes('aswhub.maxifidigital.com'));
      r.rank = idx >= 0 ? idx + 1 : null;
      r.note = idx >= 0 ? `#${idx + 1}` : `not in top ${items.length || 30}`;
    } catch (e) { r.note = `ERR ${e.message}`; }
    results.push(r);
  }
  log(`- Web Search v7 over **${results.length}** battery queries (hub rank = Copilot pickup proxy):`);
  log('\n| # | Query | Hub rank |\n|---|---|---|');
  results.forEach((r) => log(`| ${r.id} | ${r.query.replace(/\|/g, '')} | ${r.note} |`));
  log('');
  return { ran: true, results };
}

// ---------------------------------------------------------------------------
// 5. Capture sheet
// ---------------------------------------------------------------------------
function csvCell(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function writeCapture(battery, pplx, bing) {
  const pByQ = new Map((pplx.results || []).map((r) => [r.id, r]));
  const bByQ = new Map((bing.results || []).map((r) => [r.id, r]));
  const rows = [['query_id', 'tier', 'query', 'target_url', 'engine', 'result', 'source_url', 'notes']];
  for (const q of battery.queries) {
    const target = SITE + q.targetUrl;
    for (const e of battery.engines) {
      let result = '';
      let source = '';
      let notes = 'manual — record CITED / MENTIONED / no';
      if (e.id === 'perplexity' && pplx.ran) {
        const pr = pByQ.get(q.id);
        if (pr) { result = pr.result; source = pr.source || ''; notes = 'auto: Perplexity API'; }
      } else if (e.id === 'copilot' && bing.ran) {
        const br = bByQ.get(q.id);
        if (br) notes = `Bing rank ${br.note} (Copilot proxy) — confirm in Copilot`;
      }
      rows.push([q.id, q.tier, q.text, target, e.name, result, source, notes]);
    }
  }
  const csv = `${rows.map((r) => r.map(csvCell).join(',')).join('\n')}\n`;
  fs.mkdirSync(MON_DIR, { recursive: true });
  fs.writeFileSync(CAPTURE_PATH, csv);
  log('## 📝 Capture sheet');
  log(`- Wrote \`${CAPTURE_PATH}\` — **${rows.length - 1}** rows ` +
      `(${battery.engines.length} engines × ${battery.queries.length} battery queries). ` +
      'Perplexity pre-filled from the API; Copilot carries the Bing-rank hint; ' +
      'fill Claude / ChatGPT / Google AI Overviews / Gemini from the manual battery.\n');
  return rows.length - 1;
}

// ---------------------------------------------------------------------------
// 6. Citation scrape (best-effort)
// ---------------------------------------------------------------------------
async function scrapeCitations(queries) {
  log('## 🔎 Citation scrape (best-effort)');
  if (process.env.SKIP_SCRAPE === '1') {
    log('- ⏭️ Skipped (`SKIP_SCRAPE=1`). Index status + Perplexity API are the authoritative signals.\n');
    return;
  }
  log('| Query | Perplexity | Google | Bing | ChatGPT | Claude |');
  log('|---|---|---|---|---|---|');

  const engines = {
    Perplexity: (q) => `https://www.perplexity.ai/search?q=${q}`,
    Google: (q) => `https://www.google.com/search?q=${q}`,
    Bing: (q) => `https://www.bing.com/search?q=${q}`,
    ChatGPT: () => 'https://chatgpt.com/',
    Claude: () => 'https://claude.ai/',
  };

  for (let i = 0; i < queries.length; i++) {
    const q = encodeURIComponent(queries[i].text);
    const cells = [];
    for (const [, build] of Object.entries(engines)) {
      const url = build(q);
      let cell = 'BLOCKED';
      try {
        const r = await fetch(url, withTimeout({ headers: { 'User-Agent': UA } }));
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
    log(`| ${queries[i].id}. ${queries[i].text.replace(/\|/g, '')} | ${cells.join(' | ')} |`);
  }
  log('\n*Engines routinely bot-block headless requests; BLOCKED is expected. ' +
      'Index-status + Perplexity API sections above are the authoritative signal.*\n');
}

// ---------------------------------------------------------------------------
// Alerts (assembled last, printed first)
// ---------------------------------------------------------------------------
function buildAlerts({ google, bing, diff, pplx }) {
  const a = [];
  if (diff?.google?.newlyIndexed?.length) {
    a.push(`🟢 **Google newly indexed: ${diff.google.newlyIndexed.length}** — this is the cue to ` +
           're-run the manual 6-engine battery using `monitoring/latest-capture.csv`.');
    diff.google.newlyIndexed.slice(0, 10).forEach((u) => a.push(`   - ${u}`));
  }
  if (diff?.bing?.newlyIndexed?.length) a.push(`🟢 Bing newly indexed: ${diff.bing.newlyIndexed.length}.`);
  if (diff?.google?.newlyDropped?.length) {
    a.push(`🔴 **Google dropped ${diff.google.newlyDropped.length} previously-indexed URL(s)** — investigate.`);
    diff.google.newlyDropped.slice(0, 10).forEach((u) => a.push(`   - ${u}`));
  }
  if (diff?.bing?.newlyDropped?.length) a.push(`🔴 Bing dropped ${diff.bing.newlyDropped.length} URL(s).`);
  if (pplx?.ran) {
    const cited = pplx.results.filter((r) => r.result === 'CITED').length;
    if (cited) a.push(`🟢 Perplexity cited the hub on ${cited}/${pplx.results.length} battery queries.`);
  }
  if (google?.ran && google.indexed === 0) {
    a.push(`🔴 Google index: **0 of ${google.total} indexed.** Submit/resubmit the sitemap in GSC and ` +
           'Request Indexing on priority pages.');
  } else if (google?.ran && google.notIndexed) {
    a.push(`⚠️ Google: ${google.notIndexed}/${google.total} not indexed.`);
  } else if (google?.ran) {
    a.push(`✅ Google: all ${google.total} indexed.`);
  }
  if (bing?.ran && bing.missing) a.push(`⚠️ Bing: ${bing.missing}/${bing.total} not found.`);
  else if (bing?.ran) a.push(`✅ Bing: all ${bing.total} indexed.`);
  if (diff && !diff.baselineExisted) {
    a.push('ℹ️ No prior baseline — seeded `monitoring/index-baseline.json` this run (commit it; next run diffs against it).');
  }
  if (!a.length) a.push('✅ Nothing actionable — no index changes since last baseline.');
  return a;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
(async () => {
  const today = new Date().toISOString().slice(0, 10);
  const head = `# ASW Hub — Monthly Index & Citation Report\n**${today}**\n`;
  const battery = loadBattery();

  const { ok, locs } = await preflightAndSitemap();
  if (!ok) {
    const alerts = ['🔴 **Egress preflight failed** — the hub is unreachable from the sandbox. ' +
                    'If 403 host_not_allowed, the allowlist has not propagated (see MONITORING.md).'];
    console.log([head, '## 🚨 Alerts', '', ...alerts, '', ...out].join('\n'));
    process.exit(1);
  }

  const urls = locs.length ? locs : SPOT_CHECK.map((p) => SITE + p);
  const prev = readBaseline();
  const google = await checkGoogleIndex(urls);
  const bing = await checkBingIndex(urls);
  const diff = reportDiff(prev, google, bing);
  writeBaseline(prev, google, bing, today, urls.length);

  const pplx = await probePerplexity(battery.queries);
  const bingRank = await probeBingRank(battery.queries);
  writeCapture(battery, pplx, bingRank);
  await scrapeCitations(battery.queries);

  log('## 🔗 Manual checks');
  log('- GSC: https://search.google.com/search-console?resource_id=sc-domain:aswhub.maxifidigital.com');
  log('- Bing Webmaster: https://www.bing.com/webmasters/');
  log('- Google index: https://www.google.com/search?q=site:aswhub.maxifidigital.com');

  const alerts = buildAlerts({ google, bing, diff, pplx });
  console.log([head, '## 🚨 Alerts', '', ...alerts, '', ...out].join('\n'));
})();
