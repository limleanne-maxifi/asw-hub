# Copilot go-live plan — adding Microsoft Copilot as a live demo engine

**Status today:** Copilot is a *roadmap tile* on `/CANSO-demo/`, not a live engine.
- Frontend: `copilot` is **not** in `LIVE_ENGINES` (`public/CANSO-demo/index.html`);
  the tile is a static `.soon` card with a `Rolling out` badge and the note
  "No real-time API yet — arriving via our SERP layer".
- Backend (`ai-visibility-engine`): the `/demo/probe` `engine` enum rejects
  `copilot` with **HTTP 422** — only `openai, anthropic, google, perplexity, aio`
  are accepted.

**Why it isn't already live:** Microsoft Copilot has **no official real-time
answer API** for this use case. Unlike ChatGPT/Claude/Gemini/Perplexity (official
model APIs), Copilot answers must come from a **SERP layer** — the same non-API
path that already feeds the AI Overviews (`aio`) tile.

---

## Recommended approach: reuse the existing SERP provider

The `aio` tile already proves the backend has a working SERP integration. The
cheapest, fastest path is to **reuse that same provider** for Copilot rather than
stand up new infrastructure.

1. **Confirm provider support (do this first — it gates everything).**
   Check whether the SERP provider currently powering `aio` in
   `ai-visibility-engine` exposes a **Bing Copilot / Bing "Deep Search" / Bing chat
   answer** endpoint. Providers that commonly do: SerpApi, DataForSEO, Bright Data
   SERP API, Oxylabs, Serper. If the current provider does **not** offer a Copilot
   answer product, either add a second provider that does, or defer — do **not**
   fall back to direct headless scraping of `copilot.microsoft.com` for a live
   sales demo (fragile, auth-gated, high maintenance; see Risks).

### Backend steps (`ai-visibility-engine` — primary work)
2. Add `copilot` to the `/demo/probe` `engine` enum (the Literal that currently
   422s it) in `src/visibility_engine/demo.py`.
3. Implement a `copilot` engine adapter that:
   - calls the SERP provider's Copilot/Bing-answer endpoint with the query,
   - extracts the answer text → `verbatim_response`, and source links → `citations`,
   - sets `model` to a stable label (e.g. `"Copilot (Bing)"`), and detects the
     brand needle for `named`.
4. **Match the existing SERP contract**, so the tile behaves like `aio`:
   - respects `DEMO_SAFE_MODE` (returns labelled `sample:true` when safe/no creds),
   - returns `ok:true` with an **empty** `verbatim_response` when Copilot legitimately
     has no answer (an empty Copilot result is valid — judge on `ok`/no-error, not
     on whether it cited the brand, exactly like `aio`),
   - honours the daily spend cap (`capped`).
5. Add the SERP/Copilot credential as a Render env var, add the provider's host to
   the **egress allowlist**, and redeploy.

### Frontend steps (`asw-hub` — cosmetic, ~15 min)
6. Add `"copilot"` to `LIVE_ENGINES` in `public/CANSO-demo/index.html` (~line 342).
7. Convert the static `.soon` Copilot tile (~line 317) into a real
   `data-engine="copilot"` tile (mirror the `aio` tile markup), and drop the
   `Rolling out` badge + "No real-time API yet" note.
8. Update the footer line (~line 338) to include Copilot in the live list and
   remove "Copilot rolling out via our SERP layer".
9. Update `routines/demo-live-verify.md` to add `copilot` to the probe loop and to
   its SERP-layer exception (same caveat as `aio`).

### Verify
10. In a **fresh** session (env/allowlist apply only at container start), probe
    `engine:"copilot"` via the same-origin path
    (`https://aswhub.maxifidigital.com/demo/probe`): expect `ok:true`,
    `sample:false`, a Copilot `model` label, and either a real answer or a
    legitimately-empty one. Then load `/CANSO-demo/` and confirm the tile runs live.

---

## Time estimate

Assumes the current SERP provider already offers a Copilot/Bing-answer endpoint.
Add ~1–2 days if a **new** provider must be onboarded (account, key, contract).

| Task | Estimate |
|---|---|
| Confirm provider Copilot support + test one query | 0.5 day |
| Backend adapter + enum + safe-mode/cap wiring | 1–2 days |
| Render env var + egress allowlist + redeploy | 0.5 day |
| Frontend tile conversion + footer/routine updates | ~0.5 day |
| Fresh-session verify + pitch sign-off | 0.5 day |
| **Total (provider already supports Copilot)** | **~3–4 working days** |
| **Total (new SERP provider needed)** | **~5–6 working days** |

Direct headless-scrape route (not recommended): 1–2 weeks to build + **ongoing**
maintenance every time Microsoft changes the page — treat as out of scope.

## Costs

- **SERP/Copilot queries are the only real cost.** Pricing is per-search and
  volume-based; **confirm current rates with the provider** — the figures below are
  ballpark ranges, not quotes:
  - Budget SERP APIs (e.g. Serper, DataForSEO): roughly **$1–3 per 1,000 queries**.
  - Full-service SERP APIs (e.g. SerpApi): tiered plans, roughly **$50–75/mo for
    ~5,000 searches**, scaling up.
- **Demo volume is low.** The page runs **one query per engine per page load**, so
  Copilot adds **+1 query per load**. At demo traffic (tens–low-hundreds of loads/day)
  that is a **few dollars a month** on a usage-based provider, or already covered if
  it fits inside an existing SERP plan's monthly quota. The existing daily spend cap
  (`capped`) protects against runaway cost.
- **No new model-API cost** — Copilot does not go through a paid LLM API on our side;
  it is SERP-sourced (same cost model as the `aio` tile).
- Engineering time (above) is the larger cost line than query spend at demo scale.

## Risks / caveats

- **Provider dependency:** if no SERP provider offers a reliable Copilot answer feed,
  there is no clean live path — keep the "rolling out" tile rather than ship a fake.
- **Empty answers are normal:** like AIO, Copilot may return nothing for a query;
  that is a legitimate live result, not a failure — don't gate the tile on citation.
- **Never present Copilot as live until step 10 passes** in a fresh session; a
  `sample:true` or 422 means it is not live and must stay labelled "rolling out".
