# scripts/citation-check.mjs

Monthly citation auditor for the ASW Hub. Runs the standard ATM queries (read
from `src/_data/citations.json`) against the AI engines that expose a web-search
API, detects whether the canonical hub (`aswhub.maxifidigital.com`) appears in
the sources each engine cites, and (optionally) writes the results back into
`citations.json` so the `/citation-report/` page populates itself.

## What it covers

| Engine | How | Automated |
|---|---|---|
| Perplexity | native `citations[]` | ✅ |
| Claude | `web_search` server tool | ✅ |
| ChatGPT | Responses API `web_search` tool (url_citation annotations) | ✅ |
| Gemini | Google Search grounding metadata | ✅ |
| Google AI Overviews | no API — prints a deep-link checklist | ✋ manual |
| Microsoft Copilot | no API — prints a deep-link checklist | ✋ manual |

The 4-automated / 2-manual split matches the citation-report page's own framing.

## Setup

```bash
npm install            # installs @anthropic-ai/sdk, openai, @google/genai
```

Provide API keys as environment variables (only the engines whose key is present
will run; the rest are skipped and their existing `citations.json` values are
preserved):

```bash
export ANTHROPIC_API_KEY=sk-ant-...     # Claude
export OPENAI_API_KEY=sk-...            # ChatGPT
export PERPLEXITY_API_KEY=pplx-...      # Perplexity
export GEMINI_API_KEY=...               # Gemini (GOOGLE_API_KEY also accepted)
```

Keys are read from the environment only — never commit them.

## Usage

```bash
# Dry-run — print the matrix + manual checklist, change nothing (default)
npm run citation-check

# Write the automated results into src/_data/citations.json
npm run citation-check -- --write

# Only run specific engines
node scripts/citation-check.mjs --engine=claude,perplexity

# Help
node scripts/citation-check.mjs --help
```

Recommended monthly flow:

1. `npm run citation-check` — review the dry-run matrix.
2. `npm run citation-check -- --write` — persist the automated engines.
3. Work the printed **manual checklist** for Google AI Overviews + Copilot, and
   hand-edit those two engines' `cited`/`url` in `citations.json`.
4. `git diff src/_data/citations.json` to review, then `npm run build`, commit, push.

## Notes & limitations

- **Non-deterministic.** Engine answers vary run-to-run; this is a point-in-time
  snapshot, which is what "latest audit" means.
- **URL citations only.** Detects when an engine cites a URL on the canonical
  host — not unlinked verbatim mentions (those stay a manual judgement).
- **Failed calls never overwrite.** If an engine errors, its existing value in
  `citations.json` is left untouched.
- **Model/tool IDs** are centralised in the `MODELS` constant near the top of the
  script — bump them there as the engine APIs evolve.
- **Gemini grounding** returns redirect URIs; the script resolves each to its
  final host so domain matching works.
