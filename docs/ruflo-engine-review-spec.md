---
title: "RuFlow engine-review SOP — ai-visibility-engine"
description: "Tightly-constrained RuFlow (multi-agent swarm) task spec and phased rollout for reviewing the ai-visibility-engine, with safeguards."
---

# RuFlow engine-review SOP — `ai-visibility-engine`

**Purpose.** A safe, repeatable procedure for using RuFlow (the `ruflo`
multi-agent swarm that runs on top of Claude Code) to run a security and quality
review of the `ai-visibility-engine` Python service — first as an isolated test,
then as a governed wider rollout.

**Scope note.** This SOP lives in `asw-hub` for convenience, but it targets the
**separate** `ai-visibility-engine` repository (Python app on Render). It touches
no `asw-hub` code. Paste the accompanying Word version into that repo if you want
it version-controlled there.

**Why so constrained.** The `ruflo start --task …` command runs the swarm
*autonomously and makes changes*. For an evaluation you want it to diagnose and
report first, change almost nothing, and be structurally unable to reach anything
live (Render config, secrets, deploy, paid API calls). A rule written in the task
string is *soft* — the swarm may ignore it — so every soft rule below is backed by
a *hard* safeguard (blanked keys, no remote, spend cap).

> **Prerequisites.** Node.js installed (so `npx` works) and Claude Code set up
> (RuFlow rides on your Claude subscription/API key and spends real model budget on
> every run). RuFlow itself is free and open source; the model behind it is not.

---

## Phase 0 — Isolated test on a throwaway copy

### 0.1 Make an isolated copy (Windows)

In the folder that contains the project:

```cmd
xcopy "ai-visibility-engine" "ai-visibility-engine-REVIEW-COPY" /E /I /H
cd "ai-visibility-engine-REVIEW-COPY"
```

### 0.2 Sever the copy from git — *critical*

The copy must have **no remote**, so no command inside it can ever push to the real
repository. Delete its git history entirely:

```cmd
rmdir /S /Q .git
```

(If you would rather keep history, at minimum run `git remote remove origin` and
confirm `git remote -v` prints nothing.)

### 0.3 Secrets hygiene — hard layer, before the swarm runs

1. Open any `.env` / secrets file in the copy and **blank every API key** (leave the
   variable names, empty the values). With no keys, any accidental live call fails —
   it cannot spend money or leak a real key.
2. Scan the copy for hardcoded secrets and record the result:

   ```cmd
   npx --yes @secretlint/quick-start "**/*" > ..\secretscan-before.txt 2>&1
   ```

   (Or `pip install detect-secrets && detect-secrets scan > ..\secretscan-before.txt`.)
   Any real key found in source is itself a finding — note **file and line only**,
   never the value.

### 0.4 Set a spend cap and know the abort drill

- Set a hard budget/spend limit on the Claude/Anthropic side **before** you start,
  so a runaway swarm cannot rack up cost.
- Abort = `Ctrl+C` in the terminal. Afterwards confirm no orphaned workers remain:
  Windows `tasklist | findstr node` and end any stray `node` processes. Re-running
  the wizard does not clean these up.

### 0.5 Initialise RuFlow inside the copy

```cmd
npx ruflo@latest init --wizard
```

If the wizard offers a read-only / dry-run / review-only mode, prefer it. Do **not**
initialise RuFlow anywhere except this copy.

### 0.6 The constrained review task (paste as one line)

```cmd
npx ruflo@latest start --agents 4 --topology hierarchical --max-iterations 3 --task "READ-ONLY SECURITY & QUALITY REVIEW of this Python 'ai-visibility-engine' codebase. This is a THROWAWAY COPY with no git remote — evaluation only. HARD RULES, never violate: (1) Do NOT call any external or paid API (OpenAI, Anthropic, Google/Gemini, Perplexity, or any SERP layer). Stub or mock every network call; if something cannot be reviewed without a live call, record it under 'needs live verification' and move on. (2) Do NOT read, print, echo, log, or write any API key, token, or secret value anywhere. If you find a secret hardcoded in source, report only its FILE and LINE as a finding — never its value. (3) Do NOT change DEMO_SAFE_MODE, .env, Dockerfiles, render.yaml, CI, or anything affecting a live/production service. (4) Do NOT run git commit, git push, or any deploy command. (5) Make NO source edits in this pass except adding tests. (6) Do NOT flag any client brand/query data you encounter — instead, flag as a finding any place such prospect data is logged or persisted (potential PII). SCOPE, in priority order: (a) each provider engine adapter and how API keys are loaded and handled; (b) the /demo/probe handler in src/visibility_engine/demo.py — input validation, error handling, and the DEMO_SAFE_MODE safe-mode fallback path; (c) the per-day engine budget/cost cap and rate limiting; (d) CORS and the demo-token auth path; (e) general Python security (injection, unsafe deserialisation) and error-handling robustness; (f) dependency vulnerabilities — run pip-audit or safety and report real advisories only, do not guess CVE numbers. DELIVERABLE: write ONE file REVIEW.md at the repo root with a prioritised findings table (Severity | File:Line | Issue | Recommended fix | Confidence), a plain-language summary of the safe-mode and budget-cap logic as you understand it, and an explicit list of everything you could NOT verify without a live call. Then add pytest unit tests (ALL network calls mocked) covering the safe-mode fallback and probe input validation, and run pytest, reporting pass/fail. TEST INTEGRITY: never make a test pass by weakening its assertions, mocking away the behaviour under test, or deleting cases. Do NOT claim any fix is done unless a test proves it. If a fact about provider behaviour is uncertain, write 'unverified' — never guess. British English spelling throughout."
```

### 0.7 Post-run secret sweep

Confirm nothing leaked into the output:

```cmd
npx --yes @secretlint/quick-start "REVIEW.md" > ..\secretscan-after.txt 2>&1
```

Read `REVIEW.md` and skim the RuFlow run logs for any string resembling a real key.

### 0.8 Record the run (audit trail)

Capture, in a short note you keep: RuFlow version (`npx ruflo@latest --version`),
date, model used, agents/topology, wall-clock time, and the **actual model spend**
for the run (from your Claude/Anthropic usage dashboard). This is how you measure
the real cost — treat any "75% cheaper" claim as unverified until your own numbers
say so.

---

## Acceptance gate — go / no-go

Every row must pass before RuFlow touches anything real. Record a dated sign-off.

| Gate | Pass criterion |
|---|---|
| **Findings are real** | You independently confirm 2–3 top findings at the cited `File:Line`. No fabricated issues. |
| **No hallucinated facts** | Anything it could not verify is marked "unverified", not asserted. |
| **No secret leakage** | `REVIEW.md`, logs, and the after-scan contain zero real key values. |
| **Tests are honest** | pytest tests actually run, genuinely cover safe-mode + validation, and were not weakened to pass. |
| **Stayed in bounds** | Logs show no git commit/push, no deploy-file edits, no live API calls. |
| **Cost acceptable** | Measured spend is proportionate to what a careful single agent would cost. |

**Sign-off:** _reviewer_ ______________  _date_ __________  **Decision:** GO / NO-GO

> If "findings are real" or "no hallucinated facts" fails, **stop**. A swarm that
> fabricates is worse than no swarm for a product whose value is citation accuracy.

---

## Wider rollout (only after the gate passes)

Each phase is gated on the previous. Through-line: **swarm proposes on an isolated
copy or protected branch; a human merges; live config is always off-limits.**

### Phase 1 — Real repo, proposal-only
Run the *same* constrained task on a fresh **branch** of the real
`ai-visibility-engine` (not the copy). **First confirm `main` is branch-protected**
so the swarm cannot push to it. The swarm produces findings + a draft PR; **you
review and merge**. Steady state for the Python engine: security sweeps,
test-coverage passes, adapter refactors — swarm-drafted, human-merged, CI-gated.

### Phase 2 — Other code projects, per-project rules
Reuse the template for any other genuinely code-heavy suite project, each with its
**own** constraint string and its own "do not touch" list (anything with live
tokens/deploy is forbidden explicitly). Keep the `dashboard` Astro site and
`asw-hub` on a single context-aware Claude Code session for schema/content work —
those are not swarm-shaped and the swarm does not know their conventions.

### Phase 3 — `asw-hub` session-page rollout, with a human fact-gate
The parallelisable-but-risky one (23 thin session pages). Attempt only after Phases
1–2 prove the swarm's discipline. Constraint string must add: *draft structure and
JSON-LD only against `src/sessions/_template.md`; flag EVERY factual claim
(regulations, dates, quotes) for human review; NEVER invent a regulation, deadline,
or quote; British English.* The automated gates (11ty build + JSON-LD parses + ≥300
words) catch schema breakage; **only a human catches a fabricated NIS2 deadline** —
and that is the failure that would actually hurt the product.

---

## Governance — applies to every phase

- Never point the swarm at production, live tokens, or deploy config — copy or
  protected branch, always.
- Human merge gate on 100% of swarm output. No swarm-to-`main`.
- A spend cap per run, and a recorded cost each time. Reassess if a run costs more
  than the work is worth.
- Secrets hygiene: strip real keys from any copy before the swarm sees it; scan
  before and after.
- Keep the run's audit note (version, model, cost, logs) for reproducibility.
- Stop the moment output quality or fact-accuracy regresses — the accuracy gate
  outranks any convenience.
