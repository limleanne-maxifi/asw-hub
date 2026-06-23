# Monitoring — indexing & citation tracker

The ASW Hub runs two automated monitors, both Claude Code on the web
[routines](https://code.claude.com/docs/en/routines):

- **Daily monitor** — sitemap health, key-page spot-checks, and a best-effort
  citation sweep across five AI answer engines.
- **Monthly index & citation check (15th of each month)** — a deeper,
  API-backed audit that confirms every sitemap URL is *actually indexed* in
  Google and Bing (not merely reachable), then runs the same citation sweep.
  Prompt: `routines/monthly-index-citation-check.md`. Helper script:
  `scripts/monthly-index-check.mjs` (`npm run monthly-check`).

## Required network egress domains

The monitor runs in an Anthropic-managed cloud sandbox whose outbound
connections are governed by the environment's **Network access** setting.
The default **Trusted** level allows package registries and GitHub only — it
does **not** allow the hub's own domain or the search engines, so every check
fails with `HTTP 403 x-deny-reason: host_not_allowed` until the allowlist is
extended.

Set **Network access** to **Custom** on the environment (keep
"Also include default list of common package managers" ticked) and add:

```text
aswhub.maxifidigital.com
www.perplexity.ai
www.google.com
www.bing.com
chatgpt.com
claude.ai
searchconsole.googleapis.com
oauth2.googleapis.com
ssl.bing.com
api.perplexity.ai
api.bing.microsoft.com
```

The last five are needed only by the monthly index check: `searchconsole.googleapis.com`
+ `oauth2.googleapis.com` (GSC URL Inspection), `ssl.bing.com` (Bing Webmaster
index API), `api.perplexity.ai` (Perplexity citation API), and
`api.bing.microsoft.com` (Azure Bing Web Search v7 — the Copilot rank proxy).

- `aswhub.maxifidigital.com` is **required** for the sitemap and page-health
  checks. Without it the monitor cannot run at all.
- The five search-engine hosts power the citation-tracker table. Each may
  return `403`/`BLOCKED` independently if it rejects automated fetches —
  that is a per-engine result, not a config failure.

## Where to set it

There is no separate Environments page. Open the environment for editing via
the **cloud icon** wherever you start a session or configure the routine
(claude.ai/code), then use the **Network access** selector in the dialog.
See: https://code.claude.com/docs/en/claude-code-on-the-web#network-access

## Important: changes apply to the next session only

The egress policy is fixed when a container starts. Editing the allowlist does
**not** unblock a session that is already running — a fresh session (or the
next scheduled routine run) picks up the new policy. If you change the
allowlist and still see `host_not_allowed`, start a new session to confirm.

## Why the monthly check uses APIs, not scraping

Headless requests to Google, Bing, Perplexity, ChatGPT and Claude are
bot-blocked from the sandbox (consent/JS walls, 403s), so scraping cannot
reliably confirm indexing — it mostly returns `BLOCKED`. The monthly check
therefore reads index status from official APIs and keeps the scrape only as a
best-effort citation signal.

### Scheduling the monthly routine

Create a Claude Code on the web routine, paste the prompt from
`routines/monthly-index-citation-check.md`, and set its schedule to the **15th
of every month** (cron `0 9 15 * *`, or the monthly option in the routine
scheduler). It runs `npm run monthly-check` and relays the report.

### API credentials (set as environment variables / routine secrets)

All optional — a missing credential degrades that section to `SKIPPED`, not a
failure.

| Variable              | Where to get it |
|-----------------------|-----------------|
| `GSC_SA_JSON`         | Google Cloud service-account key JSON (raw or base64). Enable the Search Console API, then add the service-account email as a **user** in Search Console. |
| `GSC_SITE_URL`        | `sc-domain:aswhub.maxifidigital.com` (domain property) or `https://aswhub.maxifidigital.com/`. |
| `BING_API_KEY`        | Bing Webmaster Tools → **Settings → API access** (index status). |
| `BING_SITE_URL`       | `https://aswhub.maxifidigital.com`. |
| `PERPLEXITY_API_KEY`  | Perplexity API key — the one engine with a real citation API. Pre-fills the Perplexity column of the capture sheet. |
| `PERPLEXITY_MODEL`    | Optional; defaults to `sonar`. |
| `BING_SEARCH_API_KEY` | Azure **Bing Web Search v7** key (a Copilot rank proxy) — **distinct** from `BING_API_KEY`. |

`SKIP_SCRAPE=1` skips the best-effort headless scrape (usually BLOCKED anyway;
the index-status + Perplexity API sections are the authoritative signals).

The same egress note above applies: the routine's container must have the
allowlist domains plus `searchconsole.googleapis.com`, `oauth2.googleapis.com`,
`ssl.bing.com`, `api.perplexity.ai`, and `api.bing.microsoft.com` for the index
+ citation APIs to work.

### What the monthly check writes

- **`monitoring/index-baseline.json`** — the per-URL Google/Bing index verdicts
  from this run. **Commit it** so next month can diff against it (the report's
  "Index changes since last baseline" section and the 🚨 Alerts block depend on
  it). Newly-indexed Google pages are the headline cue to re-run the manual
  6-engine battery.
- **`monitoring/latest-capture.csv`** — a pre-filled capture sheet (6 engines ×
  the `src/_data/citations.json` battery) for that manual run. The Perplexity
  column is auto-filled from the API and the Copilot column carries the Bing-rank
  hint; the rest are left blank for the human. It is regenerated every run, so it
  is **git-ignored** (not committed).

## Manual checks (run from a browser, not the sandbox)

- Google Search Console: https://search.google.com/search-console/index?resource_id=https%3A%2F%2Faswhub.maxifidigital.com%2F
- Bing Webmaster Tools: https://www.bing.com/webmasters/home
- Google index check: https://www.google.com/search?q=site%3Aaswhub.maxifidigital.com
