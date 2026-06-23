# monitoring/

State for the index, ranking & citation monitor — `scripts/monthly-index-check.mjs`
(`npm run monthly-check`; routine prompt in `routines/monthly-index-citation-check.md`).

## Files
- **`index-baseline.json`** — committed. The previous run's indexed URL sets
  (Google, Bing) plus the Perplexity-cited query ids. Each run diffs against it
  and raises a **🚨 Alert** when pages newly index (Bing → Copilot; Google → AI
  Overviews / Gemini) or drop out. The routine commits the updated file (STEP 3)
  so the next run can diff. Schema: `{ updated, google[], bing[], perplexityCited[] }`.
- **`latest-capture.csv`** — gitignored. A pre-filled capture sheet regenerated
  each run: Perplexity auto-filled from its API, Microsoft Copilot carries the
  Bing-rank proxy, and the other four engines left blank for the manual battery.

## What the alerts mean
A "📈 newly indexed" alert — especially in **Google**, which feeds AI Overviews
and Gemini — is the cue to re-run the manual 6-engine battery and, **only with
real verified results**, update `src/_data/citations.json`. The monitor never
edits the citation report itself.

## Activation
Inert until the environment has the credentials + egress in `MONITORING.md`
(GSC + Bing Webmaster for indexing; optional `PERPLEXITY_API_KEY` and
`BING_SEARCH_API_KEY` for the citation/rank probes). Missing creds → that section
is SKIPPED, not a failure.
