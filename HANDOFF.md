# Hand-off: ASW Hub AEO/GEO optimisation

**Branch:** merge target is `main`. Active feature branch: `claude/wizardly-feynman-g0ra6h` (AEO hardening; open until merged).
**Stack:** Eleventy (Nunjucks + Markdown) → Netlify. Source in `src/`, output via 11ty.
**Canonical domain:** `https://aswhub.maxifidigital.com/`
**Last updated:** 2026-06-23

## ⏩ AEO hardening pass — structured data, meta layer, canonical, citation table (2026-06-23)

Hardening sweep ahead of the 25 June 2026 CANSO pitch. All changes on
`claude/wizardly-feynman-g0ra6h`.

**Structured data (Task 1):**
- **Root-cause fix:** every schema partial interpolated front-matter raw
  (`"name": "{{ title }}"`), so Nunjucks autoescaping leaked `&amp;`/`&#39;` into
  JSON-LD string values site-wide (e.g. theme breadcrumbs, every apostrophe). All
  string values now use `| dump | safe` (`schema-session/speaker/insight/breadcrumb`).
- **SpaceX keynote page** emitted 8 JSON-LD blocks with 4 conflicting Events
  (one with the invalid datetime `2026-05-26T14:45 BST:00+01:00`), a `Person` named
  after the *session* with empty `jobTitle`, and a duplicate generic FAQ. The generic
  partials are now OFF for that page — it keeps its curated, validated inline
  `FAQPage` + `BusinessEvent` (now down to 4 clean blocks). Added `location` to its
  `superEvent`.
- **`schema-speaker.njk`:** dropped the meaningless self-referential `sameAs`;
  `jobTitle`/`worksFor` are now conditional (no empty strings); added optional
  front-matter `sameAs` (array of external profile URLs) support.
- **Removed `schema-event.njk`** — it duplicated the canonical `Event` already in the
  site-wide `@graph`. Enriched the graph `Event` with the full FIL postal address +
  `organizer.url`. Dropped the now-defunct `schemaEvent` flag from home + SpaceX.
- Validation: all **157** JSON-LD blocks parse; **0** contain HTML entities; required
  `Event`/`Person`/`FAQPage`/`BreadcrumbList`/`Article` fields all present, dates ISO-valid.

**Meta layer (Task 2):** `base.njk` description now falls back `description → summary →
generic`, so all **54** pages have a **unique** meta description (sessions/speakers/
themes/insights inherit their `summary`). Added `og:site_name`, `og:image:alt`,
`twitter:title`, `twitter:description`, `twitter:image:alt`. Fixed double-encoded
`&amp;amp;` in `themes/index` meta description.

**Canonical (Task 3):** this repo is airtight — self-referential `rel=canonical` on
every page, all schema/llms/robots reference `aswhub.maxifidigital.com` only, **no**
competing reference to `maxifidigital.com/asw-hub` anywhere in `src/`/`public/`.
⚠️ **Owner action:** if the duplicate at `maxifidigital.com/asw-hub` is live, the dedupe
must happen in the **`dashboard`** repo (the Astro site) / Netlify — either a 301 to the
subdomain or `rel=canonical` pointing at it. Out of scope for this repo.

**Citation table (Task 4):** template now renders the owner's drop-in results cleanly —
a cited cell links to its source `url`, or shows a non-link ✓ with the verbatim `quote`
as a tooltip if no url. `citations.json` `_note` carries the exact drop-in recipe
(set `cited:true` + `url`, optional `quote`/`screenshot`). Bumped `lastUpdated` to
2026-06-23 (live-monitoring date; next full audit 2026-07-01 drives the countdown).
**No ✓ fabricated** — all cells stay `–` until the owner records real, screenshotted results.

## ⏩ Monthly index & citation monitor — activation hand-off (2026-06-15)

A second monitoring routine shipped alongside the daily monitor: the **monthly
index & citation check**, which confirms every sitemap URL is *actually indexed*
via the Google Search Console + Bing Webmaster APIs (headless engine scraping is
bot-blocked, so the APIs are the authoritative signal). It runs on the **15th of
each month** (cron `0 9 15 * *`). Code is merged to `main` (PR #13).

**Shipped & merged:**
- `scripts/monthly-index-check.mjs` — dependency-free Node helper (`npm run monthly-check`).
- `routines/monthly-index-citation-check.md` — the routine prompt + secrets/scheduling notes.
- `public/BingSiteAuth.xml` — Bing site-verification file, **live on production** at
  `https://aswhub.maxifidigital.com/BingSiteAuth.xml` (confirmed 200).
- `MONITORING.md` + `CLAUDE.md` — documented the routine, schedule, egress hosts, secrets.

**Activation checklist (Claude Code web UI — no code left):**

| Step | State | Notes |
|---|---|---|
| GSC API enabled, service account created | ✅ | `aswhub-index-checker@maxifi-aswhub-index.iam.gserviceaccount.com` |
| Service account added as Search Console user | ⏳ verify | Must be **Full** user or GSC calls 403 |
| Bing site verified + API key generated | ⏳ verify | Settings → API access → API Key |
| 4 secrets on environment | ⏳ verify | `GSC_SA_JSON`, `GSC_SITE_URL=https://aswhub.maxifidigital.com/`, `BING_API_KEY`, `BING_SITE_URL=https://aswhub.maxifidigital.com` |
| 3 API hosts on egress allowlist | ⏳ verify | `searchconsole.googleapis.com`, `oauth2.googleapis.com`, `ssl.bing.com` |
| Routine created (15th monthly) | ⏳ | Prompt: `routines/monthly-index-citation-check.md` |

**⚠️ Verification must happen in a FRESH session.** Env vars and the egress
allowlist are fixed when a container starts — a session that was already running
when the secrets/allowlist were edited will show empty secrets and
`host_not_allowed` even when the config is correct. Start a new session, then run
`npm run monthly-check`; success = the GSC and Bing sections show real
indexed/not-indexed counts instead of `SKIPPED`. Ready-to-paste verification
prompt: `routines/fresh-session-verify.md`.

## Context

A full AEO (Answer Engine Optimisation) / GEO (Generative Engine Optimisation)
audit was completed against five criteria: entity clarity, RAG retrievability,
intent architecture, citable formatting, crawlability/trust. The first three
priorities from that audit have now shipped (Session page class, Home, How It
Works) along with a rebuild of the AI Citation Tracker. Remaining work is in
the backlog below.

## Page scores — current state

| Page class | Score before | Score now | Status |
|---|---|---|---|
| Home `/` | 78 | ~90 | ✅ Done (this hand-off) |
| How It Works `/how-it-works/` | 86 | ~95 | ✅ Done (this hand-off) |
| Session `/sessions/*` | 62 | ~92 (opening-plenary); pattern ready for rollout | ✅ Pattern + reference page done. Roll-out across remaining sessions pending. |
| AI Citation Tracker `/citation-report/` | n/a | rebuilt | ✅ Done (this hand-off) — renamed, live monitoring header, SpaceX test-case context |
| Theme `/themes/*` | 92 (flagship) | 92 | Stable. Reference pattern: `src/themes/safety-security-resilience.md` |
| Insight `/insights/*` | 80 | 80 | Pending — see backlog item 3 |
| Speaker `/speakers/*` | ~70 (est.) | ~70 | Pending — see backlog item 5 |

## What shipped in this hand-off

### Session page class — canonical pattern (item 1 of original backlog)
- `src/_includes/schema-session.njk`: real `startDate`/`endDate` from the `time` front-matter (split on ` – `), `day` → date (26/27/28 May 2026), `performer` as an array with speaker URLs (prefer `speakerLinks`), `location` with parent venue FIL — Feira Internacional de Lisboa + full address, `superEvent` with `startDate`/`endDate`.
- `.eleventy.js`: registered `split`, `daysUntil`, `longDate`, and `breadcrumbs` filters.
- `src/_layouts/session.njk`: H1 entity tail (`{{ title }} — Airspace World 2026`).
- `src/sessions/opening-plenary-state-of-global-atm.md`: 4-block, ~720-word reference page with inline `FAQPage` JSON-LD.
- `src/sessions/_template.md`: standardised on the same structure.
- Canonical pattern documented in `CLAUDE.md` for rolling out to remaining session files.

### Home (item 1 of original "remaining backlog")
- New H1 + lede; first 50 words define entity / use-case / differentiator.
- Small italic disclaimer beneath the H1 ("Built and maintained by Maxifi Digital — not affiliated with CANSO").
- Inline definition of AEO lifted into a white pull-out box (`.aeo-explainer`) beside the "Why most conference content disappears after the event" heading, plain-English copy ("Making sure AI chatbots like ChatGPT, Claude, and Google's AI answers can find your content and use it when they answer people's questions").

### Site-wide entity graph + breadcrumbs (item 2)
- New `src/_includes/schema-site.njk`: `WebSite` + `Maxifi Digital Organization` (global AEO/GEO consultancy, `areaServed: "Worldwide"`) + canonical ASW 2026 `Event` graph, emitted on every page via `base.njk`.
- New `src/_includes/schema-breadcrumb.njk` + `breadcrumbs` filter in `.eleventy.js`: per-page `BreadcrumbList` derived from `page.url`, leaf uses the page `title`. Suppressed on `/`.

### How It Works (item 3)
- Enriched H1: "How the ASW Hub works — turning Airspace World 2026 sessions into AI-citable answers".
- New `src/_includes/schema-howto.njk`: `HowTo` JSON-LD for Capture / Structure / Mark up / Measure, with `#capture`, `#structure`, `#markup`, `#measure` anchors wired on the on-page `<li>` ids.

### AI Citation Tracker rebuild (`/citation-report/` permalink retained)
- Renamed: "Citation Report" → "AI Citation Tracker" (page title, H1, nav label, internal links).
- Pulsing green "Monitoring" pill in the page header (CSS `@keyframes`, respects `prefers-reduced-motion`).
- Audit strip below the lede: LAST AUDIT · NEXT FULL AUDIT (with auto-computed "in N days" countdown pill) · INDEXING WINDOW.
- 4 + 1 query design: q1 generic control kept; q2–q5 are Tier 1 head queries targeting the SpaceX keynote canonical record (`/sessions/spacex-keynote-canso-summit-2026/`).
- New `Tier` (Control / Head) and `Target page` columns in the citation table.
- Compact two-card context strip above the table: Indexing window (amber rule) + Post-event citation test case (blue rule).

### Cross-cutting copy fix
- "UK AEO consultancy" / "UK-based" corrected to "global Answer Engine Optimisation consultancy" in `CLAUDE.md`, `public/llms.txt` (x2), and `src/_includes/schema-site.njk` (also `areaServed → Worldwide` and British-English `knowsAbout` spellings).

## ▶ Next priorities (post-merge backlog)

### 1. Roll the canonical session pattern across remaining `src/sessions/*.md` files
Every session file except `opening-plenary-state-of-global-atm.md` is still on
the thin (~110-word) old body. Use the reusable prompt below the "Canonical
Session page pattern" section in `CLAUDE.md` for each file; one session at a
time, or batch by speaker / theme. Acceptance: ≥300 words, 4-block structure,
inline `FAQPage` JSON-LD, ` – ` time separator, `speakerLinks` populated where a
`/speakers/<slug>/` page exists.

### 2. `Article` schema on theme + insight pages
Add `Article` JSON-LD with `about` / `mentions` entity links on every
`src/themes/*.md` and `src/insights/*.md` so retrievers have explicit topical
graph edges. Reference: existing entity graph in `schema-site.njk`.

### 3. Direct-answer + Methodology blocks on insights, plus FAQ block
Insights (`src/_layouts/insight.njk`, `src/insights/*.md`) currently lack a
top-of-page direct answer and a methodology block — both standard AEO patterns
for citation-grade analysis. Add an inline `FAQPage` to each insight.

### 4. Comparison table per theme page
Themes are FAQ-prose-first today. Add one structured comparison table per theme
page (regulation vs. operational reality / vendor A vs. B / before vs. after).
Tables retrieve well as discrete claims.

### 5. Speaker `Person` schema enrichment
`src/_layouts/speaker.njk` + `src/speakers/*.md`: add `jobTitle`, `worksFor`,
`sameAs`, `performerIn` (back-link to session pages). Establish bidirectional
session ↔ speaker links.

### 6. Tracker cleanup once live data lands
- Remove the redundant amber "Indexing window" strip on the citation report
  page **after** the first full audit produces non-zero data — the audit strip
  already carries the dates.
- Once the first citation lands, add the ticker / counter element described in
  the citation-tracker recommendation (item 4 of that proposal).

### 7. Smaller fixes (carry-over from prior backlog)
- ~~Fix `Offer` in `schema-event.njk`~~ — moot: `schema-event.njk` removed (the
  canonical `Event` lives in the site-wide `@graph`). The event is concluded, so no
  ticket `Offer` is needed; add one to the graph `Event` only if a future event is added.
- Replace `btn-disabled` "Conference Sprint" CTA on home + how-it-works with a working link, or remove.
- Populate speaker `sameAs` (LinkedIn / Wikipedia / Wikidata / official bio) in
  `src/speakers/*.md` front-matter — `schema-speaker.njk` now emits a `sameAs` array
  when present (left empty rather than fabricated).

## Acceptance gates for any future change
1. `npx @11ty/eleventy` builds clean — no warnings on touched files.
2. All `<script type="application/ld+json">` blocks on touched pages parse as valid JSON. Validate Event / FAQPage / HowTo / Article / BreadcrumbList via Google Rich Results test or schema.org validator.
3. Word counts on session/insight pages ≥300 (excluding embedded JSON-LD).
4. British-English spelling preserved (optimisation, organise, programme, centre, etc.).
5. Canonical domain only: `https://aswhub.maxifidigital.com/`.

## Notes
- Locale: British English (`en-GB`).
- Two `layers.css` files used to exist in the repo — the duplicate at `src/_includes/components/layers.css` was deleted in this hand-off after it caused a "wrong file edited" debug session. The only `layers.css` now is `src/assets/css/layers.css`, served via the assets passthrough copy.
- `daysUntil` filter in `.eleventy.js` computes the citation-tracker countdown at build time, so the deploy cadence determines how fresh the "in N days" pill stays.
