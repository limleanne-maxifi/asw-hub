# Hand-off: ASW Hub AEO/GEO optimisation

**Branch:** `claude/clever-einstein-a32jJ`
**Stack:** Eleventy (Nunjucks + Markdown) → Netlify. Source in `src/`, output via 11ty.
**Canonical domain:** `https://aswhub.maxifidigital.com/`
**Last updated:** 2026-06-07

## Context

A full AEO (Answer Engine Optimization) / GEO (Generative Engine Optimization)
audit was completed against five criteria: entity clarity, RAG retrievability,
intent architecture, citable formatting, crawlability/trust. The site is already
strong on hygiene (`llms.txt`, canonicals, sitemap, per-type JSON-LD, FAQ-first
theme pages). Remaining work is surgical.

## Page scores (from audit)

| Page class | Score | Key file(s) |
|---|---|---|
| Home `/` | 78 | `src/index.njk` |
| How It Works `/how-it-works/` | 86 | `src/how-it-works.njk` |
| **Session `/sessions/*` (START HERE)** | **62** | `src/_layouts/session.njk`, `src/_includes/schema-session.njk`, `src/sessions/*.md` |
| Theme `/themes/*` | 92 (flagship) | `src/themes/safety-security-resilience.md` (reference pattern) |
| Insight `/insights/*` | 80 | `src/_layouts/insight.njk`, `src/insights/*.md` |
| Speaker `/speakers/*` | ~70 (est., not yet opened) | `src/_layouts/speaker.njk` |

## ▶ FIRST TASK: Fix the Session page class (score 62 → target 90+)

Session pages are the weakest class. Three problems, in priority order:

### 1. Fix `src/_includes/schema-session.njk` (schema bugs — highest leverage)
Current bugs:
- `startDate` is date-only; should use the `time` front-matter (e.g. `2026-05-26T10:00:00+01:00`).
- No `endDate` (front-matter `time: 10:00 – 10:25` is parseable — split on ` – `).
- `performer` is a single `Person` even with multiple speakers — make it an **array**, prefer `speakerLinks` over the flat `speakers` string, and add speaker URLs.
- `location.name` is just the room; add parent venue "FIL — Feira Internacional de Lisboa" + address for entity disambiguation.
- `superEvent` should carry `startDate`/`endDate` for the parent event.

Reference the proposed drop-in in the audit (split `time` with a Nunjucks filter,
map `day` → date). Verify a `split` filter exists in `.eleventy.js`; if not, register one.

### 2. Expand each `src/sessions/*.md` body (thin content — ~110 words today)
RAG retrievers want ≥300 words of substantive content + a FAQ block. Standardise
every session on a 4-block template:
- `## What this session covers` — 3 sentences, name the entity + speaker affiliations + the operational question.
- `## Why it matters now` — concrete 2026 context (regulation/deadline/incident/milestone).
- `## Key takeaways for ATM operators` — 3 bulleted claims with sources.
- `## Frequently asked questions` — 3–5 Q&A pairs, **plus an inline `FAQPage` JSON-LD block**.

Copy the FAQPage JSON-LD pattern from `src/themes/safety-security-resilience.md`
(lines ~60–107). Consider also updating `src/sessions/_template.md` so new sessions
inherit the structure.

**Start file:** `src/sessions/opening-plenary-state-of-global-atm.md`
Speaker: Tim Arel (Chair, CANSO; COO, FAA ATO) → `tim-arel`. Tue 26 May, 10:00–10:25, Frequentis Theatre.

### 3. Enrich the session H1 in `src/_layouts/session.njk:9`
Add an entity tail, e.g. `{{ title }} — Airspace World 2026` (style the tail span so
it doesn't dominate visually).

### Acceptance check
- `npx @11ty/eleventy --serve` builds clean; validate emitted JSON-LD (Google Rich
  Results test / schema validator) for the opening-plenary page.
- Session page body ≥300 words with a visible FAQ section and matching FAQPage schema.
- `performer` array renders correctly for multi-speaker sessions.

## Remaining backlog (after sessions) — prioritised

1. Home H1 + lede so first 50 words define entity/use-case/differentiator (`src/index.njk:14-18`).
2. Add `WebSite` + `Organization` graph in `base.njk`; `BreadcrumbList` per layout.
3. `HowTo` schema on `/how-it-works/`; enrich H1.
4. `Article` schema (`about`/`mentions` entity links) on theme + insight pages.
5. Direct-answer + Methodology blocks on all insights; add FAQ block to insights.
6. Comparison table per theme page.
7. Fix `Offer` (`price`, `priceCurrency`) in `schema-event.njk`.
8. Replace `btn-disabled` "Conference Sprint" CTA with a working link or remove.
9. Speaker `Person` schema: `jobTitle`, `worksFor`, `sameAs`, `performerIn`; bidirectional session links.

## Notes
- Brief mentioned `llmst.txt`; correct standard is `llms.txt`, already present at `public/llms.txt`. No action.
- Locale is British English (`en-GB`). Keep spelling consistent (optimisation, organise).
- Do NOT push to any branch other than `claude/clever-einstein-a32jJ`.
