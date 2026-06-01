#!/usr/bin/env node
/**
 * citation-check — ASW Hub monthly citation auditor
 *
 * Runs the standard ATM queries (read from src/_data/citations.json) against the
 * AI engines that expose a web-search API, and records whether the canonical hub
 * (aswhub.maxifidigital.com) appears in the sources each engine cites.
 *
 * FOUR engines are automated here (they return source URLs we can inspect):
 *   - Perplexity  (native `citations[]`)
 *   - Claude      (web_search server tool)
 *   - ChatGPT     (Responses API web_search tool, url_citation annotations)
 *   - Gemini      (Google Search grounding metadata)
 *
 * TWO engines have no clean API and stay manual — the script prints a deep-link
 * checklist for them instead:
 *   - Google AI Overviews
 *   - Microsoft Copilot
 *
 * This split intentionally matches the citation-report page's own framing:
 * "four fast-movers first, full six-engine audit once indexing settles".
 *
 * USAGE
 *   node scripts/citation-check.mjs              # dry-run: print the matrix, write nothing
 *   node scripts/citation-check.mjs --write      # also write results into citations.json
 *   node scripts/citation-check.mjs --engine=claude,perplexity   # only run some engines
 *   node scripts/citation-check.mjs --help
 *
 * ENV (only the engines whose keys are present will run; the rest are skipped
 * and their existing citations.json values are preserved):
 *   ANTHROPIC_API_KEY     — Claude
 *   OPENAI_API_KEY        — ChatGPT
 *   PERPLEXITY_API_KEY    — Perplexity
 *   GEMINI_API_KEY        — Gemini  (also accepts GOOGLE_API_KEY)
 *
 * Engine answers are non-deterministic — this is a point-in-time snapshot, which
 * is exactly what "latest audit" means. It detects URL citations of the canonical
 * host, not unlinked verbatim mentions (those remain a manual judgement).
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CITATIONS_PATH = resolve(__dirname, '../src/_data/citations.json');

// ─── Config ──────────────────────────────────────────────────────────────────

/** Hosts that count as "the hub". Match is host-exact (after stripping leading www.). */
const CANONICAL_HOSTS = ['aswhub.maxifidigital.com'];

/** citations.json engine id → adapter. Engines absent here stay manual. */
const AUTOMATED = {
  perplexity: queryPerplexity,
  claude:     queryClaude,
  chatgpt:    queryChatGPT,
  gemini:     queryGemini,
};

/** Model + tool choices, centralised so they are easy to bump as APIs evolve. */
const MODELS = {
  claude:     'claude-sonnet-4-6',
  chatgpt:    'gpt-4.1',
  gemini:     'gemini-2.5-flash',
  perplexity: 'sonar',
};

/** Deep-link builders for the two manual engines (reused from visibility_view). */
const MANUAL_LINKS = {
  'google-ai': (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
  'copilot':   (q) => `https://copilot.microsoft.com/?q=${encodeURIComponent(q)}`,
};

// ─── CLI ─────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}
const WRITE = args.includes('--write');
const engineFilter = (() => {
  const a = args.find((x) => x.startsWith('--engine='));
  if (!a) return null;
  return new Set(a.slice('--engine='.length).split(',').map((s) => s.trim()).filter(Boolean));
})();

// ─── Main ────────────────────────────────────────────────────────────────────

main().catch((err) => {
  console.error('\nFatal:', err?.message || err);
  process.exit(1);
});

async function main() {
  const raw = await readFile(CITATIONS_PATH, 'utf8');
  const data = JSON.parse(raw);
  const queries = data.queries;

  console.log(`\nASW Hub citation check — ${queries.length} queries`);
  console.log(`Canonical host: ${CANONICAL_HOSTS.join(', ')}`);
  console.log(`Mode: ${WRITE ? 'WRITE (citations.json will be updated)' : 'dry-run (no file changes)'}\n`);

  // Decide which automated engines actually run this pass.
  const active = [];
  for (const [id, fn] of Object.entries(AUTOMATED)) {
    if (engineFilter && !engineFilter.has(id)) continue;
    const key = keyFor(id);
    if (!key) {
      console.log(`  • ${id.padEnd(11)} skipped — ${envNameFor(id)} not set (existing values preserved)`);
      continue;
    }
    active.push([id, fn]);
  }
  if (active.length) {
    console.log(`  • running: ${active.map(([id]) => id).join(', ')}\n`);
  } else {
    console.log('  • no automated engines will run (no API keys / all filtered out)\n');
  }

  // Run every active engine against every query.
  const results = {}; // queryId -> engineId -> { cited, url, error? }
  for (const q of queries) {
    results[q.id] = {};
    for (const [id, fn] of active) {
      process.stdout.write(`  [${id}] ${truncate(q.text, 55)} … `);
      try {
        const urls = await fn(q.text);
        const hit = urls.find((u) => isCanonical(u));
        results[q.id][id] = { cited: Boolean(hit), url: hit || '' };
        console.log(hit ? `CITED → ${hit}` : `not cited (${urls.length} sources)`);
      } catch (err) {
        results[q.id][id] = { cited: false, url: '', error: err?.message || String(err) };
        console.log(`error: ${err?.message || err}`);
      }
    }
  }

  renderMatrix(data, results, active.map(([id]) => id));
  renderManualChecklist(data, queries);

  if (WRITE) {
    applyResults(data, results);
    data.summary.lastUpdated = today();
    await writeFile(CITATIONS_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`\nWrote ${CITATIONS_PATH} (lastUpdated = ${data.summary.lastUpdated}).`);
    console.log('Review the diff, then rebuild + commit.\n');
  } else {
    console.log('\nDry-run complete. Re-run with --write to update citations.json.\n');
  }
}

// ─── Engine adapters ─────────────────────────────────────────────────────────
// Each returns a flat array of source URL strings. Deps are imported lazily so
// the script can run --help / the manual checklist without every SDK installed.

async function queryPerplexity(query) {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODELS.perplexity,
      messages: [{ role: 'user', content: query }],
    }),
  });
  if (!res.ok) throw new Error(`Perplexity HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  // Perplexity returns citations either as a top-level array of URL strings or as
  // search_results[].url depending on model — handle both.
  const out = [];
  if (Array.isArray(json.citations)) out.push(...json.citations);
  if (Array.isArray(json.search_results)) out.push(...json.search_results.map((r) => r.url).filter(Boolean));
  return out;
}

async function queryClaude(query) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: MODELS.claude,
    max_tokens: 1024,
    messages: [{ role: 'user', content: query }],
    tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
  });
  const out = [];
  for (const block of msg.content || []) {
    // Sources surfaced by the web_search tool result blocks.
    if (block.type === 'web_search_tool_result' && Array.isArray(block.content)) {
      for (const r of block.content) if (r?.url) out.push(r.url);
    }
    // Inline citations attached to answer text.
    if (block.type === 'text' && Array.isArray(block.citations)) {
      for (const c of block.citations) if (c?.url) out.push(c.url);
    }
  }
  return out;
}

async function queryChatGPT(query) {
  const { default: OpenAI } = await import('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const resp = await client.responses.create({
    model: MODELS.chatgpt,
    tools: [{ type: 'web_search_preview' }],
    input: query,
  });
  const out = [];
  for (const item of resp.output || []) {
    if (item.type !== 'message') continue;
    for (const c of item.content || []) {
      for (const a of c.annotations || []) {
        if (a.type === 'url_citation' && a.url) out.push(a.url);
      }
    }
  }
  return out;
}

async function queryGemini(query) {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY });
  const resp = await ai.models.generateContent({
    model: MODELS.gemini,
    contents: query,
    config: { tools: [{ googleSearch: {} }] },
  });
  const chunks = resp?.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  // Gemini grounding URIs are vertexaisearch redirect links, not the final host —
  // resolve each to its destination so domain matching works.
  const out = [];
  for (const ch of chunks) {
    const uri = ch?.web?.uri;
    if (!uri) continue;
    out.push(await resolveRedirect(uri));
  }
  return out;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function resolveRedirect(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.url || url;
  } catch {
    return url; // best effort — fall back to the redirect URL
  }
}

function isCanonical(url) {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    return CANONICAL_HOSTS.includes(host);
  } catch {
    return false;
  }
}

function applyResults(data, results) {
  for (const q of data.queries) {
    const r = results[q.id];
    if (!r) continue;
    for (const [engineId, val] of Object.entries(r)) {
      if (val.error) continue; // never overwrite on a failed call
      q.engines[engineId] = { cited: val.cited, url: val.url };
    }
  }
}

function renderMatrix(data, results, activeIds) {
  if (!activeIds.length) return;
  console.log('\n─── Results (automated engines) ───');
  const header = ['query'.padEnd(50), ...activeIds.map((id) => id.padEnd(11))].join(' | ');
  console.log(header);
  console.log('-'.repeat(header.length));
  for (const q of data.queries) {
    const cells = activeIds.map((id) => {
      const r = results[q.id]?.[id];
      if (!r) return '·'.padEnd(11);
      if (r.error) return 'ERR'.padEnd(11);
      return (r.cited ? '✓ cited' : '– none').padEnd(11);
    });
    console.log([truncate(q.text, 50).padEnd(50), ...cells].join(' | '));
  }
}

function renderManualChecklist(data, queries) {
  const manualIds = data.engines.map((e) => e.id).filter((id) => MANUAL_LINKS[id]);
  if (!manualIds.length) return;
  console.log('\n─── Manual check needed (no API) ───');
  for (const id of manualIds) {
    const name = data.engines.find((e) => e.id === id)?.name || id;
    console.log(`\n  ${name}:`);
    for (const q of queries) {
      console.log(`    • ${q.text}`);
      console.log(`      ${MANUAL_LINKS[id](q.text)}`);
    }
  }
  console.log('\n  For each: run the query, check if aswhub.maxifidigital.com is cited,');
  console.log('  then set cited/url for that engine in src/_data/citations.json by hand.');
}

function keyFor(id) {
  return process.env[envNameFor(id)] || (id === 'gemini' ? process.env.GOOGLE_API_KEY : undefined);
}
function envNameFor(id) {
  return { claude: 'ANTHROPIC_API_KEY', chatgpt: 'OPENAI_API_KEY', perplexity: 'PERPLEXITY_API_KEY', gemini: 'GEMINI_API_KEY' }[id];
}
function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
function today() {
  return new Date().toISOString().slice(0, 10);
}

function printHelp() {
  console.log(`
citation-check — ASW Hub monthly citation auditor

  node scripts/citation-check.mjs              dry-run: print the matrix, write nothing
  node scripts/citation-check.mjs --write      also write results into citations.json
  node scripts/citation-check.mjs --engine=claude,perplexity   run only some engines
  node scripts/citation-check.mjs --help

Automated engines (need API keys): perplexity, claude, chatgpt, gemini
Manual engines (deep-link checklist printed): google-ai, copilot

Env: ANTHROPIC_API_KEY, OPENAI_API_KEY, PERPLEXITY_API_KEY, GEMINI_API_KEY
Engines whose key is absent are skipped; their existing values are preserved.
`);
}
