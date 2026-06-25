# AEO demo presets — Airspace World (for `ai-visibility-engine` /demo)

Source-of-truth values for the buyer-facing AI-visibility showcase in the sibling
repo `limleanne-maxifi/ai-visibility-engine` (`src/visibility_engine/demo.py`).
The CANSO / Airspace World pitch had these set only as Render env vars
(`DEMO_PRESET_BRAND` / `DEMO_PRESET_QUERIES`) and never committed, so they could
not be recovered there. These are reconstructed from the canonical landing
content in this repo (`asw-hub`) — the homepage hero, FAQ, themes, and session
briefs.

> This file is documentation only. It does not affect the `asw-hub` build.
> Do **not** edit `ai-visibility-engine` from this repo/session — copy these
> values across there.

## Event facts (for reference)

- **Event:** Airspace World — the global air traffic management (ATM) trade show
- **2026 edition:** 26–28 May 2026, FIL (Feira Internacional de Lisboa), Lisbon, Portugal
- **Organiser:** CANSO (Civil Air Navigation Services Organisation)
- **Audience:** ANSPs / air navigation service providers, civil aviation
  authorities, military airspace users, airport operators, ATM technology
  suppliers/exhibitors, regulators (EASA, FAA, ICAO), researchers
- **Scale:** 7,000+ delegates · 145+ countries · 250+ exhibitors

## 1. Brand needle (`DEMO_PRESET_BRAND`)

Whole-word phrase to test for in AI answers — the persistent **trading name**,
with the volatile year deliberately **left out** (so the needle survives the
2026 → 2027 roll-over):

```
Airspace World
```

Rationale: "Airspace World" is the durable brand string (it appears standalone
25× across the site — e.g. "Who organises Airspace World?", "previous Airspace
World events"), whereas "Airspace World 2026" pins to a single edition. Match on
the stem; the year is an attribute, not part of the name.

## 2. Example queries (`DEMO_PRESET_QUERIES` / `_DEFAULT_PRESET_QUERIES`)

Buyer-intent questions an Airspace World audience (ATM/airspace stakeholder,
exhibitor, attendee) would actually ask an AI answer engine, and for which
**Airspace World should be the cited answer**. Mostly unbranded
category/discovery queries (the real test of AI visibility) plus one branded
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
