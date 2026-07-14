# OpenAI model-access check — can the demo's ChatGPT key call a newer model?

Use this to find out whether the OpenAI API key that powers the `/CANSO-demo/`
ChatGPT tile can call a model **newer than `gpt-4o-2024-08-06`** (the id the
backend currently pins). This is a **read-only diagnostic** — it does not change
which model the demo uses. Swapping the demo to a newer model is a separate
change on the backend (`ai-visibility-engine`, `src/visibility_engine/demo.py`),
because the demo probe **ignores** a `model` field in the request body (verified:
sending `gpt-4.1`/`gpt-5` still returns `gpt-4o-2024-08-06`).

## Where the key lives (important)
The key is **not** in the `asw-hub` repo. It is the `OPENAI_API_KEY` environment
variable on the **`ai-visibility-engine` Render service**. So run this check in
**one** of these contexts:
- a Claude Code session on the **`ai-visibility-engine`** environment (the key is
  in that container's env), **or**
- any shell where you have exported the same key:
  `export OPENAI_API_KEY='sk-...'` (use the exact key configured on Render, then
  clear it from history — never commit or paste it into a repo).

Egress note: the check calls `api.openai.com`. In a Claude Code on the web
session that host must be on the egress allowlist, and env/allowlist only apply
at **container start**, so use a **fresh** session.

---

You are checking whether an OpenAI API key can call models newer than
`gpt-4o-2024-08-06`. The key is in `$OPENAI_API_KEY`.

### 1. List every model the key/project can see
```bash
curl -sS https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
| python3 -c 'import sys,json; d=json.load(sys.stdin); print("\n".join(sorted(m["id"] for m in d["data"])))'
```
- A `401` means the key is invalid/expired.
- The list is what the account/project is entitled to, but a listed id is not a
  100% guarantee it is callable (project limits, verification tiers) — step 2 is
  the authoritative test.

### 2. Actually attempt a minimal call against each candidate newer model
The list changes over time, so treat the ids below as **candidates to try** and
add any newer ones you saw in step 1. Each call asks for 1 token, so it is cheap.
```bash
for M in gpt-4.1 gpt-4.1-mini gpt-4o-2024-11-20 o4-mini gpt-5 gpt-5-mini; do
  code=$(curl -sS -o /tmp/oai_$M.json -w "%{http_code}" \
    https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer $OPENAI_API_KEY" -H "Content-Type: application/json" \
    -d "{\"model\":\"$M\",\"max_tokens\":1,\"messages\":[{\"role\":\"user\",\"content\":\"ping\"}]}")
  echo "== $M -> HTTP $code =="
  grep -oE '"(id|model)":"[^"]*"|"(code|type|message)":"[^"]*"' /tmp/oai_$M.json | head -4
done
```
Some newer models reject `max_tokens` in favour of `max_completion_tokens`; if a
model returns a 400 mentioning that parameter, re-run just that id with
`max_completion_tokens` instead — a 400 about a parameter still proves the model
is **callable** (auth + access are fine).

### 3. Interpret
Per candidate model:
- **HTTP 200** (or a 400 that only complains about a parameter like
  `max_tokens`/`max_completion_tokens`) ⇒ **CALLABLE** — the key can use it.
- **HTTP 404** with `"code":"model_not_found"` ⇒ the key/project has **no access**
  to that id (or the id does not exist).
- **HTTP 403** ⇒ access is gated (e.g. org/project not verified for that model).
- **HTTP 429** ⇒ key is valid and has access, but is rate/quota limited right now.
- **HTTP 401** ⇒ the key itself is invalid.

### 4. Report
List each candidate as CALLABLE / NO-ACCESS / GATED / RATE-LIMITED / KEY-INVALID,
with the HTTP code and the returned `model` id (200s echo the resolved id, which
may differ from the alias, e.g. `gpt-4.1` → `gpt-4.1-2025-...`).

**Verdict:** name the newest model that returned CALLABLE. If one exists, that is
the id to pin on the backend (`ai-visibility-engine` demo probe) and to reflect in
the two `OpenAI · GPT-4o` labels in `public/CANSO-demo/index.html` (tile subtitle
~line 317 and the sample fallback `model:"gpt-4o"` ~line 539) plus the `gpt-4o`
example in `routines/demo-live-verify.md`. If nothing newer is callable, the demo
stays on `gpt-4o-2024-08-06` and the operator must upgrade the key's project
access on OpenAI first.
