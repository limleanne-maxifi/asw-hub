# Event & Conference AEO Checklist

**Answer Engine Optimisation for events — the client-facing playbook.**
Maxifi Digital · How to organise your conference for AI visibility, and where the
"bolt-on" AEO pages fit.

---

## The model: why AI cites one source and not another

Getting cited by an AI engine (ChatGPT, Claude, Perplexity, Google AI Overviews,
Microsoft Copilot, Gemini) is a **four-stage pipeline**. Every stage must pass:

```
CRAWLED  →  INDEXED  →  RETRIEVED for the query  →  CHOSEN over rivals  →  CITED
```

- **Stages 1–2 are won by code.** Crawl access, schema, clean indexable pages.
  This is necessary but *not sufficient* — it only gets you into the candidate pool.
- **Stages 3–4 are won off-page.** Authority, corroboration, and the link graph
  decide whether you're *retrieved* and *chosen* ahead of the official and
  established sources.

Most event organisers have the second half backwards: they assume great content
wins. It doesn't — **authoritative, corroborated content wins.** This checklist
separates the two so you know exactly what your team owns and what we deliver.

> **Legend:** `[CODE]` = controllable by code/on-page (Maxifi delivers).
> `[OFF]` = off-page authority/relationship work (client-owned, Maxifi advises).
> `[JOINT]` = shared — fastest when client + Maxifi combine.

---

## PART A — Parts you control by code `[CODE]`
*On-page and technical AEO. These are table stakes: do them all, completely. They
get you crawled and indexed and make you the most extractable source in the pool.*

### A1. Crawl access & bot policy
- [ ] `robots.txt` allows all six target AI crawlers and their variants
      (GPTBot, OAI-SearchBot, ChatGPT-User; ClaudeBot, Claude-User, Claude-SearchBot;
      PerplexityBot, Perplexity-User; Googlebot, Google-Extended; Bingbot;
      Applebot/Applebot-Extended; plus CCBot for training corpora).
- [ ] No accidental `Disallow` in a named user-agent group (named groups read
      *only* their own rules — a global block won't apply, and a global block won't
      be inherited).
- [ ] `Sitemap:` directive present in `robots.txt`.
- [ ] No `noindex`, no auth wall, no JS-gated content on pages you want cited.
- [ ] `llms.txt` published at site root listing canonical/authoritative URLs.

### A2. Indexation & discovery
- [ ] XML sitemap auto-generated, lists every canonical URL, kept current.
- [ ] One canonical domain; every page sets a self-referential `<link rel="canonical">`.
- [ ] No duplicate URLs (trailing-slash, http/https, www/non-www all resolve to one).
- [ ] Deep pages (sessions/speakers) submitted via Search Console / Bing Webmaster
      URL Inspection to shorten indexing latency.
- [ ] Site verified in Google Search Console **and** Bing Webmaster Tools.
- [ ] Logical, shallow URL structure (`/sessions/<slug>/`, `/speakers/<slug>/`).

### A3. Structured data / schema (`schema.org`)
- [ ] `Event` (or `BusinessEvent`) JSON-LD on the event + every session, with
      `startDate`, `endDate`, `location`, `eventStatus`, `organizer`, `superEvent`.
- [ ] `Person` schema on every speaker, with `jobTitle`, `worksFor`, and `sameAs`
      pointing to LinkedIn / Wikipedia / Wikidata.
- [ ] `FAQPage` JSON-LD on pages with Q&A — mirroring the visible questions verbatim.
- [ ] `Organization` + `WebSite` graph site-wide (publisher entity, `sameAs` links).
- [ ] `BreadcrumbList` per page for hierarchy signalling.
- [ ] `VideoObject` with `transcript` where recordings exist.
- [ ] Every block **validates** (Google Rich Results Test / schema.org validator)
      before it's considered done.

### A4. Content engineering (extractability)
- [ ] Each page answers one clear intent; the lede paragraph *is* the liftable answer.
- [ ] FAQ-first structure — the highest-intent questions (**who** spoke, **when/where**)
      answered first, in 2–3 sentences each.
- [ ] Self-contained, citable facts: each statistic has a number, a date, and a source
      inline (no "see above").
- [ ] Named entities explicit on every mention (full name + role + organisation), not
      pronouns — AI extracts entities, not implications.
- [ ] Unique primary information (verified transcripts, quotes, original data), not a
      rewrite of the official page — engines reward the *fullest* source.
- [ ] Consistent locale, terminology, and entity naming across the whole site.
- [ ] Clear publish + "last updated" dates visible and in schema.

### A5. Entity & internal link architecture
- [ ] Every speaker and session has a permanent, canonical entity page.
- [ ] Topic clusters: theme/track hubs linking to their sessions and back.
- [ ] Related-content links between sessions, speakers, and themes.
- [ ] Stable URLs — never break a canonical record once published.

### A6. Performance, rendering & accessibility
- [ ] Server-rendered / static HTML (content present without JS execution).
- [ ] Fast load, mobile-clean, valid HTML, semantic headings (one `<h1>`, ordered `<h2>`s).
- [ ] Open Graph + Twitter Card tags for clean link unfurls (aids social corroboration).
- [ ] Image alt text describing entities.

### A7. On-page provenance & trust
- [ ] Explicit authorship/publisher, contact, and corrections policy.
- [ ] Stated source hierarchy (official bodies, regulators, primary documents).
- [ ] Clear independence/affiliation disclosure.
- [ ] Citation string provided on each canonical record (make it easy to cite you).

---

## PART B — Parts you cannot control by code `[OFF]`
*Off-page authority, corroboration, and the link graph. This is what decides
stages 3–4 — retrieval and selection. It is earned over time and through
relationships, which is exactly why it's the moat and why it can't be faked.*

### B1. Domain & entity authority `[OFF]`
- [ ] Inbound links from **authoritative, topical** domains (the official event site,
      the organising body, regulators, established trade press).
- [ ] Consistent NAP/entity signals across the web (same name, same description).
- [ ] Age + track record on the domain (compounds; start early).
- [ ] Being recognised as *an* authority on the topic, not just present on it.

### B2. Corroboration `[OFF]`
- [ ] The same facts asserted by **multiple independent sources** that agree with your page.
- [ ] Coverage in trade media / news that names the same entities, dates, and claims.
- [ ] Co-citation: other pages that engines trust appearing alongside yours for the query.
- [ ] No contradiction between your page and the official record (engines drop conflicting low-authority sources).

### B3. Link graph `[OFF] / [JOINT]`
- [ ] Backlink from the official event domain to the canonical records `[JOINT]` — *highest-leverage single action.*
- [ ] Backlink from the organising body (e.g. the association) `[JOINT]`.
- [ ] Speaker / sponsor / partner organisations linking to their own session pages `[JOINT]`.
- [ ] Trade-press articles linking to the records `[OFF]`.
- [ ] Earned links over time from people referencing the canonical record `[OFF]`.

### B4. Knowledge-base & entity presence `[JOINT]`
- [ ] Wikidata item for the event, key speakers, and (where notable) the sessions.
- [ ] Wikipedia presence where notability thresholds are genuinely met (never fabricate).
- [ ] Google Knowledge Panel / entity recognition for the event and organisation.
- [ ] `sameAs` links from your schema *to* those entities (the code half of a joint task).

### B5. Brand, social & distribution signals `[JOINT]`
- [ ] Official channels (LinkedIn, YouTube, press wire) publishing and **linking back** to the records.
- [ ] Speakers sharing their own canonical session/profile pages.
- [ ] Recordings + transcripts hosted and linked (YouTube `VideoObject` ↔ page).
- [ ] Sustained mentions, not a single launch burst.

### B6. Primary-source & freshness signals `[OFF] / [JOINT]`
- [ ] You are the *first or fullest* publisher of the verified detail (transcript, quotes, data).
- [ ] Records updated as the official record completes (post-event transcripts, corrections).
- [ ] Demonstrable recency cadence so engines re-crawl and re-rank.

---

## PART C — Division of labour: the "bolt-on" model

The fastest path to AI visibility combines what **only you** can grant (authority)
with what **we** build and run (code + content + measurement).

| Domain | You (client) own | Maxifi delivers |
|---|---|---|
| Authority `[OFF]` | The official-domain backlink; organising-body endorsement; speaker/partner links | Advisory on *who* to ask, *what* anchor text, *which* pages to point at |
| Corroboration `[OFF]` | Press relationships; official narrative consistency | Content engineered to match & extend the official record so corroboration aligns |
| Link graph `[JOINT]` | Approving links from your owned channels | Distribution scaffolding, anchor strategy, link targets |
| Knowledge base `[JOINT]` | Notability facts, sign-off | Wikidata items, `sameAs` schema wiring |
| Code/technical `[CODE]` | — | Crawl policy, sitemap, schema, FAQ engineering, entity pages, performance |
| **Bolt-on AEO pages** `[CODE]` | Source material (programme, speakers, recordings) | The canonical, schema-rich, FAQ-first session/speaker record pages that *become* the citable source |
| Measurement `[CODE]` | — | Monthly six-engine citation audit + indexation monitoring + reporting |

**What a "bolt-on" AEO page is:** a canonical, machine-extractable record for each
session/speaker that sits alongside your existing event site, engineered to be the
source AI engines retrieve — FAQ-first, schema-complete, entity-linked, with verified
primary detail. You supply the raw material; we build the page and run the measurement.
Your authority (one official backlink) is what lights it up.

---

## PART D — Cadence: when each item happens

- [ ] **8–12 weeks pre-event** `[CODE]` — stand up the hub, schema, sitemap, bot policy,
      speaker/session scaffolding; verify Search Console + Bing; seed `llms.txt`.
- [ ] **Pre-event** `[JOINT]` — secure the official-domain backlink; create Wikidata
      entities; line up distribution channels.
- [ ] **During event** `[CODE]+[JOINT]` — publish canonical records live; speakers/partners
      share their pages; capture recordings.
- [ ] **0–2 weeks post-event** `[CODE]` — land verified transcripts, quotes, and data
      (become the *fullest* source); submit deep URLs for indexing.
- [ ] **Monthly** `[CODE]` — run the six-engine citation audit + indexation check; report
      green/grey grid; refresh records on substantive change.

---

## PART E — Measurement: proving it worked

- [ ] Fixed set of head queries per event (the **who**, **when/where**, **what-was-said**
      questions real users ask).
- [ ] Each query checked across all six engines monthly; record `cited: true/false`
      **with the verifiable source URL** the engine returned.
- [ ] **Never mark a citation without a real source URL** — measurement integrity is the
      product; a fabricated tick destroys the only thing that makes the report credible.
- [ ] Separate "indexed" from "cited" in reporting (different stages, different fixes).
- [ ] Public, dated citation report so progress is visible and accountable.

---

*Maxifi Digital — Answer Engine Optimisation. We build the systems that make expert
organisations the answer AI gives. hello@maxifidigital.com*
