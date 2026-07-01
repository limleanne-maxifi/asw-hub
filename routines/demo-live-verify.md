# Fresh-session verification prompt — CANSO demo live responses

Paste the block below as the **first message in a brand-new Claude Code on the web
session** on the `asw-hub` environment. A fresh session is required because
environment variables and the egress allowlist are only applied at container
start — an already-running session will not see a newly-allowlisted backend host.

Goal: confirm that **every response shown by the `/CANSO-demo/` sales page is a
live, API-key-backed engine result** — not sample/illustrative data. The page
auto-runs one real probe on load and only falls back to a clearly-labelled sample
if the backend is unreachable or in safe mode, so "it shows tiles" is **not** proof
they are live.

---

You are verifying that the ASW Hub AEO sales demo returns **live** AI-engine
results (<https://aswhub.maxifidigital.com/CANSO-demo/>), after the Render
backend's API keys and the egress allowlist were configured.

Background (already in the repo — `public/CANSO-demo/index.html`):
- The page POSTs to `PROBE_URL = https://ai-visibility-engine.onrender.com/demo/probe`
  with header `X-Demo-Token: aw2026-demo-k9td` and body
  `{brand, query, engine, token, safe:false}`.
- Brand needle: `Airspace World`. Default query:
  `What is the leading global trade show for air traffic management?`
- The backend (`ai-visibility-engine`, Python on Render) returns real results **only**
  when `DEMO_SAFE_MODE=false` **and** the engine's API key is set — otherwise it
  returns sample data. The exact backend env-var names live in that repo's
  `src/visibility_engine/demo.py` (add it with `add_repo` if it isn't in this
  session's scope).

1. **Egress + reachability preflight.**
   - Confirm the backend host is **not** `host_not_allowed`:
     `ai-visibility-engine.onrender.com`. If it is, the egress allowlist wasn't
     picked up — stop and flag it (add the host, then verify in another fresh session).
   - `curl -s -o /dev/null -w "%{http_code}\n" https://aswhub.maxifidigital.com/CANSO-demo/` → expect 200.

2. **Probe each engine directly** — one call per engine (`openai`, `anthropic`,
   `google`, `perplexity`, `aio`):
   ```
   curl -sS -X POST https://ai-visibility-engine.onrender.com/demo/probe \
     -H "Content-Type: application/json" -H "X-Demo-Token: aw2026-demo-k9td" \
     -d '{"brand":"Airspace World","query":"What is the leading global trade show for air traffic management?","engine":"<ENGINE>","token":"aw2026-demo-k9td","safe":false}'
   ```

3. **Judge each response — LIVE vs SAMPLE.** A tile is genuinely live when the JSON has:
   - `ok: true` (not an error), **and**
   - `sample` absent or `false` (any `sample:true` ⇒ backend is in safe mode / missing that key), **and**
   - a real engine `model` id (e.g. `gpt-4o`, `claude-*`, `sonar`, `gemini-*`) — not a placeholder, **and**
   - a non-empty `verbatim_response`.

   In the browser the equivalent signals are: the run-meta reads **`● LIVE · queried …`**
   (green), **no** tile shows a **`· sample`** suffix, and there is no yellow "Sample
   data" / "backend was unreachable" notice.

   **Exception — `aio` (AI Overviews) and any Copilot column** come from a SERP layer,
   not an official API. An empty/absent AI Overview can be legitimate even on a healthy
   backend, so judge those on `ok` / no-error and `sample:false` — not on whether they
   cited the brand.

4. **Report per engine:** LIVE or SAMPLE/ERROR, with the `model` and the first line of
   `verbatim_response`. For anything not live, state the cause:
   - all engines `sample:true` ⇒ `DEMO_SAFE_MODE` is not `false` on Render.
   - one engine `sample`/error ⇒ that engine's API key is missing/invalid on Render.
   - `401` ⇒ demo token mismatch (page `DEMO_TOKEN` vs backend).
   - connection refused / `host_not_allowed` ⇒ egress allowlist missing the host, or backend down.
   - browser works but curl is blocked ⇒ egress not allowlisted for this session (the
     browser path is cross-origin via CORS and independent of session egress).

5. **Verdict:** state clearly whether **all** engines return live, API-key-backed
   results (AIO caveat above). Anything less is not pitch-ready — list exactly what the
   operator must fix on Render (`DEMO_SAFE_MODE=false`, the specific missing key, CORS,
   or the egress host).

This is a verification pass — **do not commit code** unless the page's `DEMO_TOKEN` /
`PROBE_URL` no longer match the backend, in which case fix those two constants in
`public/CANSO-demo/index.html` and note it.
