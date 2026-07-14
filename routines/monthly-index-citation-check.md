# Routine — Monthly index & citation check (15th of each month)

This is the prompt run by the **Claude Code on the web routine** scheduled for
the **15th of every month** (see `MONITORING.md` → "Scheduling the monthly
routine"). It complements the *daily* indexing & citation monitor with a
deeper, API-backed confirmation that every page is actually indexed, a diff
against last month's baseline, and a pre-filled capture sheet for the manual
6-engine citation battery.

---

## Prompt (paste this as the routine's instructions)

You are the index & citation monitor for the ASW Hub
(https://aswhub.maxifidigital.com), built by Maxifi Digital.

**STEP 0 — Egress preflight.** Run:

    curl -s -o /dev/null -w "%{http_code}" -I https://aswhub.maxifidigital.com/

If it returns 403 with `x-deny-reason: host_not_allowed`, STOP and report that
the egress allowlist has not propagated (required domains in `MONITORING.md`).
Otherwise continue.

**STEP 1 — Run the helper script.** Sitemap health, GSC + Bing index
confirmation, baseline diff, Perplexity citation + Bing rank probes, and a
pre-filled capture sheet, in one pass:

    npm run monthly-check

The script reads these routine secrets (configure them on the environment; any
that are missing degrade that section to **SKIPPED**, which is expected — not a
failure):

| Variable              | Purpose |
|-----------------------|---------|
| `GSC_SA_JSON`         | Google service-account JSON (raw or base64). The account must be added as a user in Search Console. |
| `GSC_SITE_URL`        | `sc-domain:aswhub.maxifidigital.com` or `https://aswhub.maxifidigital.com/`. |
| `BING_API_KEY`        | Bing Webmaster Tools → Settings → API access (index status). |
| `BING_SITE_URL`       | `https://aswhub.maxifidigital.com`. |
| `PERPLEXITY_API_KEY`  | Perplexity API — the one engine with a real citation API. |
| `BING_SEARCH_API_KEY` | Azure Bing Web Search v7 key — Copilot rank proxy (distinct from `BING_API_KEY`). |

Set `SKIP_SCRAPE=1` to skip the best-effort headless scrape (it is usually
BLOCKED and the index/Perplexity sections are the authoritative signals).

**STEP 2 — Relay the report.** The script prints a 🚨 Alerts block at the top —
**lead with it**. Newly-indexed pages (especially in Google, which feeds AI
Overviews + Gemini) are the headline: they are the cue to re-run the manual
6-engine battery using the freshly pre-filled `monitoring/latest-capture.csv`.
Then post the report body and flag any URL still listed as *not indexed*.

**STEP 3 — Persist the baseline.** If `monitoring/index-baseline.json` changed,
commit it so the next run can diff against it:

    git add monitoring/index-baseline.json && \
      git commit -m "monitoring: update index baseline ($(date +%F))" && \
      git push

Do **not** edit `src/_data/citations.json` from this routine — citation cells are
only set from real, human-verified battery runs. (`monitoring/latest-capture.csv`
is git-ignored; it is regenerated each run and is just the scratch sheet for the
manual battery.)

Keep it concise — scannable in under two minutes.
