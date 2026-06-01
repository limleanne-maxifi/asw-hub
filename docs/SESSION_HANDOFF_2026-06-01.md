# Session Handoff — 2026-06-01

> Read this first to resume without breaks. Covers what shipped today, what's
> outstanding, and the critical steps still missing. Written for the next
> session (and for a human picking this up).

---

## 0. TL;DR — current state

- **Repo:** `limleanne-maxifi/asw-hub` (Eleventy static site → `aswhub.maxifidigital.com`)
- **Working branch:** `claude/affectionate-bohr-WCwVD`
- **`main` HEAD:** `db84a5d` (PR #5, merged & deployed)
- **Open work:** **PR #6** (draft) — the monthly citation-check script. Branch HEAD `b8d130d`. CI/deploy-preview green.
- **Biggest outstanding item:** run the **real citation audit** to populate `src/_data/citations.json` (currently all `cited:false`). Blocked on environment config — see §2.

---

## 1. What shipped today

### 1a. PR #5 — merged to `main` (`db84a5d`), deployed
- 5-phase AEO/build hardening (robots.txt, llms.txt, sitemap lastmod, crawler edge function, independence disclaimer, etc.)
- **Citation-report copy overhaul** (`src/citation-report.njk`):
  - Reframed pre-event → post-event / "indexing window" (event ran 26–28 May; page is now in the June results window)
  - Fixed legend symbol mismatch (`○` → `–`, matching the cells the page renders)
  - Standardised on "standard test queries"
  - `lastUpdated` → `2026-06-01` in `src/_data/citations.json`

### 1b. maxifidigital.com `/asw-hub` redirect — DONE (separate repo)
- Lives in `limleanne-maxifi/maxifi-digital` (the Astro marketing site), **not** this repo.
- Two `[[redirects]]` blocks (`/asw-hub` and `/asw-hub/*` → `https://aswhub.maxifidigital.com/…`) are committed to that repo's `main` (commit `40d8d87`) and auto-deploy via Netlify.
- **Still unverified from a sandbox** (no general outbound web). See §3.

### 1c. PR #6 — citation-check script (DRAFT, open)
- `scripts/citation-check.mjs` — runs the 5 standard ATM queries against the 4 web-search-API engines, detects `aswhub.maxifidigital.com` citations, writes results to `citations.json`.
- `scripts/README.md`, `package.json` (`npm run citation-check` + dev deps), lockfile.
- Verified: `--help`, keyless dry-run, canonical-host matching unit checks (incl. spoof guard), `npm run build` clean (55 files).

---

## 2. ⚠️ CRITICAL — run the real citation audit (the main outstanding task)

`src/_data/citations.json` is still all `cited:false`. The script is built but has **never run with real keys**. To run it you MUST resolve two environment blockers discovered today.

### 2a. Network allowlist (discovered today)
This environment's network policy is a **selective allowlist**. Reachability tested 2026-06-01:

| Host | Engine | Reachable from this env? |
|---|---|---|
| `api.anthropic.com` | Claude | ✅ yes |
| `generativelanguage.googleapis.com` | Gemini | ✅ yes |
| `api.openai.com` | ChatGPT | ❌ **"Host not in allowlist"** |
| `api.perplexity.ai` | Perplexity | ❌ **"Host not in allowlist"** |
| `registry.npmjs.org` | npm | ✅ yes |

**Decision made (2026-06-01):** run the **full 4-engine audit in this environment** by
**adding `api.openai.com` + `api.perplexity.ai` to the network allowlist**. This
requires a network policy that supports a custom egress allowlist. Docs:
https://code.claude.com/docs/en/claude-code-on-the-web

> Fallback if the policy can't be widened: run `npm run citation-check -- --write`
> **locally** with all 4 keys (keys never leave your machine), then commit the diff.

### 2b. API keys (none set today)
Add all four as **environment variables / secrets** (chosen over pasting in chat to keep secrets out of the transcript):

```
ANTHROPIC_API_KEY     = sk-ant-…
OPENAI_API_KEY        = sk-…
PERPLEXITY_API_KEY    = pplx-…
GEMINI_API_KEY        = …          (GOOGLE_API_KEY also accepted)
```

### 2c. Run procedure (next session, after 2a + 2b are configured)
Env config changes apply on a **fresh container**, and the container is ephemeral
(`node_modules` won't persist; `package.json`/lockfile will restore it).

1. `git checkout claude/affectionate-bohr-WCwVD && git pull`
2. **Verify env first** (do NOT skip — confirms the blockers are actually resolved):
   - Check all 4 keys are set.
   - `curl` each of the 4 engine endpoints; confirm none returns "Host not in allowlist".
3. `npm install`
4. `npm run citation-check` — review the dry-run matrix.
5. `npm run citation-check -- --write` — persists results for the reachable engines.
6. Work the printed **manual checklist** for Google AI Overviews + Copilot (no API — see §4), and hand-edit those two engines' `cited`/`url` in `citations.json`.
7. `git diff src/_data/citations.json` → review → `npm run build` → commit to the PR branch → push.

### 2d. Script behaviour reminders
- Dry-run by default; `--write` persists; `--engine=<ids>` filters.
- Engines whose key is absent are **skipped** (existing values preserved).
- **Failed calls never overwrite** existing data.
- Model/tool IDs are centralised in the `MODELS` constant at the top of `scripts/citation-check.mjs` — bump there if an engine API changes.
- Gemini grounding returns redirect URIs; the script resolves each to its final host.

---

## 3. ⚠️ CRITICAL — verifications that could NOT be done from the sandbox

General outbound web is blocked here, so these were never confirmed live. **Do them from a browser / your own machine:**

1. **maxifidigital.com `/asw-hub` redirect is live.** Source is committed (§1b), but the deploy wasn't observed.
   ```bash
   curl -sSI https://maxifidigital.com/asw-hub | grep -i "^HTTP\|^location"
   # expect: 301  +  location: https://aswhub.maxifidigital.com/
   curl -sSI https://maxifidigital.com/asw-hub/test | grep -i location
   # expect: location: https://aswhub.maxifidigital.com/test
   ```
2. **SSL cert** on `aswhub.maxifidigital.com` (and the `airspaceworldhub.maxifidigital.com` alias once added — see §4) resolves cleanly in a browser.

---

## 4. Outstanding from PR #5 "Track B" (human decisions / Netlify-UI actions)

These are carried over and still open:

1. **Add `airspaceworldhub.maxifidigital.com` as a domain alias** in Netlify UI
   (Site settings → Domain management → Add domain alias). The 301 rule is already
   in this repo's `netlify.toml`, but it does nothing until the alias is registered.
2. **Decide: retire `aeo-audit-hub` or `citation-report`?** They overlap (both
   pre/post-event baselines). `aeo-audit-hub` already 301s to `/citation-report/`
   in `netlify.toml` — confirm that's the intended canonical and remove the other
   if redundant.
3. **Manual citation engines (every audit):** Google AI Overviews + Copilot have no
   API. The script prints deep-links; a human runs each of the 5 queries and records
   `cited`/`url` by hand in `citations.json`.
4. **Publish more insight `.md` files** — only 2 insights exist; sitemap/collection
   machinery already picks them up on rebuild.

---

## 5. Lower-priority / housekeeping

- **npm audit:** `npm install` reported 2 vulnerabilities (1 critical) in the new
  dev-dependency tree (`@anthropic-ai/sdk`, `openai`, `@google/genai`). These are
  **dev-only** — the script is run manually and never ships in the Eleventy build or
  the deployed site — so risk to the hub is negligible. Optionally `npm audit` to
  review; don't let it block the audit.
- **PR #6 lifecycle:** still a **draft**. Mark ready → merge once you're happy with
  the script (and ideally once the first real `citations.json` data is in, so the
  page goes live with real results in one go). Squash-merge matches PR #5.

---

## 6. Context on the "Visibility Engine" (why the script is fresh code, not a lift)

The user asked whether the in-house Visibility Engine could produce the citation
data. Findings (2026-06-01):

- Org repos: `aeo_visibility_engine` (**archived** → redirects to `visibility_view`),
  `visibility_view` (the live product), `ai-visibility-engine` (**private, Python** —
  not inspectable from this session; may be the real measurement engine — worth
  checking if access is granted).
- `visibility_view` is a **lead-gen funnel**, not a citation tool: its measured-run
  engine **isn't built** (its `DATA_CONTRACT.md` is a frozen spec; fulfillment is
  manual), it targets only **4** engines (no AIO/Copilot), and its output is a
  visibility *score*, not a per-query citation matrix.
- So the citation-check script is purpose-built for the hub, **reusing** only the
  patterns that mapped cleanly: the Anthropic SDK call shape, the 6-engine
  vocabulary, and the per-engine deep-link map.

---

## 7. Key paths

| Path | What |
|---|---|
| `src/_data/citations.json` | Citation data (drives `/citation-report/`) — **to be populated** |
| `src/citation-report.njk` | The citation report page template |
| `scripts/citation-check.mjs` | The audit runner |
| `scripts/README.md` | Script usage / env vars |
| `netlify/edge-functions/crawler-log.js` | AI-crawler logging edge function |
| `public/llms.txt`, `public/robots.txt` | AEO discovery files |
| `netlify.toml` | Build + redirects + headers (incl. the `airspaceworldhub` alias rule) |
