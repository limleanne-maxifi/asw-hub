# Hand-off: ASW Hub AEO/GEO optimisation

**Branch:** merge target is `main`. Active feature branch: `claude/clever-einstein-a32jJ` (open until merged).
**Stack:** Eleventy (Nunjucks + Markdown) → Netlify. Source in `src/`, output via 11ty.
**Canonical domain:** `https://aswhub.maxifidigital.com/`
**Last updated:** 2026-06-08

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
- Fix `Offer` (`price`, `priceCurrency`) in `schema-event.njk`.
- Replace `btn-disabled` "Conference Sprint" CTA on home + how-it-works with a working link, or remove.

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
