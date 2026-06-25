# AEO demo presets — Airspace World (for `ai-visibility-engine` /demo)

Source-of-truth values for the buyer-facing AI-visibility `/demo` showcase in the
sibling repo `limleanne-maxifi/ai-visibility-engine` (a Python app **deployed on
Render**; preset wiring in `src/visibility_engine/demo.py`).

The CANSO / Airspace World pitch had its presets set only as **Render env vars**
(`DEMO_PRESET_BRAND` / `DEMO_PRESET_QUERY` / `DEMO_PRESET_QUERIES`) and never
committed, so they could not be recovered from that repo. These are reconstructed
from the canonical landing content in this repo (`asw-hub`) — the homepage hero,
FAQ, themes, and session briefs.

> This file is documentation only and lives under `docs/` (outside the Eleventy
> build). The built showcase page now **ships with the site** as a passthrough
> page — `public/demo/index.html`, served at **`/demo/`** (see "Live demo").
> Do **not** edit `ai-visibility-engine` from this repo/session — copy these
> values across there.

## Live demo

The seeded showcase page is published with the site and is publicly reachable:

- **Live (production):** <https://aswhub.maxifidigital.com/demo/>
- **Source:** `public/demo/index.html` — a self-contained single-file page
  (inline CSS/JS, embedded Maxifi wordmark) copied verbatim to the site root by
  Eleventy's `public/` passthrough, so it is **not** in the nav, collections, or
  sitemap and does not touch the reference hub.

It is the IBM-Carbon `/demo` design reference reworked into an Airspace World
proof-of-reference sales page: Airspace-World-seeded brand + buyer-intent preset
queries, lede + trust hero, official Maxifi Digital wordmark, Inter headings on
IBM Plex Sans Light, conversion CTAs to `checkyourvisibility` / `aswhub`, and a
"CANSO · Premium AI Visibility" citation ticker.

Note: live engine runs POST to `/demo/probe`, which only exists on the
`ai-visibility-engine` backend (Render). On the static aswhub host the page
shows the **on-load sample render** (3/5 — Airspace World cited by ChatGPT and
Perplexity) plus the "Safe demo (sample data)" view; point it at the backend for
real-time runs.

## Event facts (for reference)

- **Event:** Airspace World — the global air traffic management (ATM) trade show
- **2026 edition:** 26–28 May 2026, FIL (Feira Internacional de Lisboa), Lisbon, Portugal
- **Organiser:** CANSO (Civil Air Navigation Services Organisation)
- **Audience:** ANSPs / air navigation service providers, civil aviation
  authorities, military airspace users, airport operators, ATM technology
  suppliers/exhibitors, regulators (EASA, FAA, ICAO), researchers
- **Scale:** 7,000+ delegates · 145+ countries · 250+ exhibitors

## 1. Brand needle — `DEMO_PRESET_BRAND`

Whole-word phrase to test for in AI answers — the persistent **trading name**,
with the volatile year deliberately **left out** (so the needle survives the
2026 → 2027 roll-over):

```
Airspace World
```

Rationale: "Airspace World" is the durable brand string (it appears standalone
25× across the site — e.g. "Who organises Airspace World?", "previous Airspace
World events"), whereas "Airspace World 2026" pins to a single edition. Match on
the stem; the year is an attribute, not part of the name. This is also the value
pre-filled in the demo's **Brand / organisation** field.

## 2. Default query — `DEMO_PRESET_QUERY`

The single query the demo pre-fills into the **Buyer-intent query** field (the
first preset below):

```
What is the leading global trade show for air traffic management?
```

## 3. Example queries — `DEMO_PRESET_QUERIES` / `_DEFAULT_PRESET_QUERIES`

Buyer-intent questions an Airspace World audience (ATM/airspace stakeholder,
exhibitor, attendee) would actually ask an AI answer engine, and for which
**Airspace World should be the cited answer**. Mostly unbranded
category/discovery queries (the real AI-visibility test) plus one branded
logistics query.

```
What is the leading global trade show for air traffic management?
Which conference brings together the world's air navigation service providers?
What is CANSO's flagship annual ATM event and where is it held?
Where can ATM technology vendors exhibit to reach ANSPs and civil aviation authorities?
Which 2026 aviation event covers SESAR, U-space, remote towers, and drone integration?
What conference should I attend to meet air traffic management decision-makers in Europe?
What is the biggest ATM and airspace exhibition in Europe?
When and where is Airspace World 2026 taking place?
```

### Single-line env-var form

`DEMO_PRESET_QUERIES` is a single env var, so it needs a delimiter. The exact
separator is whatever `demo.py` splits on (could not be confirmed from this repo
— check `_DEFAULT_PRESET_QUERIES` and the split logic in
`src/visibility_engine/demo.py`). Pipe-delimited form:

```
What is the leading global trade show for air traffic management?|Which conference brings together the world's air navigation service providers?|What is CANSO's flagship annual ATM event and where is it held?|Where can ATM technology vendors exhibit to reach ANSPs and civil aviation authorities?|Which 2026 aviation event covers SESAR, U-space, remote towers, and drone integration?|What conference should I attend to meet air traffic management decision-makers in Europe?|What is the biggest ATM and airspace exhibition in Europe?|When and where is Airspace World 2026 taking place?
```
