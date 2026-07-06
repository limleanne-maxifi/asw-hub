# Next-session prompt — search-grounded citations for ChatGPT / Claude / Gemini

Paste the block below into a **new Claude Code session**. The work is primarily in
the sibling **`ai-visibility-engine`** repo (Python, Render) — the asw-hub front
end already renders citations for any engine that returns them, so it needs no
code changes, only copy tweaks if the feature ships.

Context for whoever runs this: today only Perplexity (always) and Google AI
Overviews (when present) return source links in the demo tiles, because those are
the only engines whose API is search-native. ChatGPT, Claude and Gemini are called
as **bare model APIs** — no browsing, so no sources to cite. Each vendor offers an
optional search tool that returns URL citations, at extra per-search cost, and
turning it on changes what the demo measures (search-augmented engines rather than
the default chat modes most buyers use). This session is to decide and, if agreed,
implement.

---

You are upgrading the Maxifi AI-visibility demo backend so that ChatGPT, Claude
and Gemini tiles can show **cited source links**, like Perplexity already does.

**Repos:** backend `limleanne-maxifi/ai-visibility-engine` (add with `add_repo`;
engine calls live in `src/visibility_engine/demo.py`). Front end
`limleanne-maxifi/asw-hub` — `src/demo.njk` (`renderCites()`) already renders a
`citations: [urls]` array for **any** engine, so the probe response contract is
the only interface: keep returning
`{ok, named, model, ms, verbatim_response, citations, sample}`.

**0 · Before writing code — present the trade-off and STOP for a decision:**
- Enabling grounding means the demo measures the **search-augmented** engine, not
  the bare model a default ChatGPT/Claude/Gemini chat uses. That may *improve*
  brands' apparent visibility (search results get injected) and changes the sales
  story ("what the engine says" → "what the engine says when it searches").
- Per-call cost increases (each vendor bills web-search tool use separately, on
  top of tokens). Every demo page load auto-runs all engines, so this multiplies
  the daily budget burn. Quote current prices from the vendor docs — do not rely
  on memory.
- Recommend a default (suggested: ship it **feature-flagged and off**), then wait
  for approval.

**1 · Implementation (if approved):**
- OpenAI: Responses API with the `web_search` tool — collect `url_citation`
  annotations from the output into `citations`.
- Anthropic: Messages API `web_search` server tool — collect the cited URLs from
  the response content blocks.
- Gemini: `google_search` grounding tool — collect
  `groundingMetadata.groundingChunks[].web.uri`.
- One env flag per engine (e.g. `DEMO_SEARCH_GROUNDING_OPENAI=true|false`, same
  for `ANTHROPIC`, `GEMINI`), default **false**, so each engine can be flipped
  independently and reverted without a deploy of the front end.
- When grounding is on, return the real model id plus a marker the front end can
  show verbatim (e.g. `model: "gpt-5.2 + web search"`) so tiles never pass a
  grounded run off as a bare-model run.
- Respect the existing daily cap and safe mode exactly as today; grounded calls
  must count against the cap.

**2 · Front-end copy (asw-hub, only if the flags go live):**
- Trust card currently reads "for Perplexity and AI Overviews — the live source
  links they cited" — update to name whichever engines now cite.
- Tile subtitles (e.g. "Anthropic · Sonnet") should gain a "+ web search" marker
  when grounding is on. Keep `/CANSO-demo/` untouched.
- Update `CLAUDE.md` ("Generic demo template" section) and `HANDOFF.md`.

**3 · Verify like `routines/demo-live-verify.md`:** probe each grounded engine
directly; confirm `citations` is a non-empty URL array on a query that should
ground, tiles render a "Sources (n)" list, and the run stamp still reads LIVE.
Screenshot a tile with sources for the hand-off note.
