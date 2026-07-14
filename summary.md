# Repository housekeeping summary — 14 July 2026

Audit and housekeeping pass on `limleanne-maxifi/asw-hub`, executed from session
branch `claude/asw-hub-housekeeping-i7kcb3`. **Headline: the repository was
already clean — the task brief was based on a stale (mid-May 2026) snapshot.**

---

## 1. The "46 uncommitted files" — finding: they do not exist

**Actual state verified 2026-07-14:**

```
$ git status --porcelain | wc -l
0
$ git stash list
(empty)
$ git status
nothing to commit, working tree clean
```

There are **zero** uncommitted, untracked, or stashed files. No classification,
commit, or discard was needed or performed.

**Why the brief said 46:** the numbers match a snapshot of the repo from
~12 May 2026, before main's history was flattened and re-imported:

| Brief claim | Stale source it matches |
|---|---|
| "last commit 12 May 2026" | main's **oldest** commit is dated 2026-05-12 (`e09…`→`d9f0868`); its **latest** is `f449453`, 2026-07-13 |
| "46 files uncommitted" | `feature/educational-layers` contains exactly **46 commits** (2026-05-08 → 2026-05-10) — almost certainly the real referent, mislabelled |
| "formatting churn" | most of those 46 commits are indeed copy/typography/padding tweaks |

**Disposition: no action required.** Nothing was committed or discarded, because
there was nothing to commit or discard. The only new file in this pass is this
summary itself.

## 2. `feature/educational-layers` — decision: DELETE (archive first), do not merge

**State:** exists on `origin` only, tip `d9f40dc` (2026-05-10), 46 commits,
no open PR attached.

**It cannot be merged:** the branch shares **no merge base** with `main`
(`git merge-base` fails: "no merge base"). It is the original 8–10 May build
history; `main` was re-created as a flattened import on 12 May and has evolved
58 commits since. A merge would need `--allow-unrelated-histories` and would
reintroduce superseded content wholesale.

**It is fully superseded — file-level proof.** Every file that exists only on
the branch was deliberately replaced on main:

| Branch-only file | Superseded by (on main) |
|---|---|
| `src/themes/ai-in-air-traffic-control.md`, `airspace-capacity-resilience.md`, `atm-workforce-future.md`, `cybersecurity-in-ans.md`, `digital-atm-transformation.md`, `single-european-sky.md`, `sustainable-aviation.md` | The eight **official ASW 2026 track** theme pages (`safety-security-resilience.md`, `seamless-skies.md`, etc.) — the old invented theme set was replaced (`claude/replace-themes-official-tracks`) |
| `src/_includes/schema-event.njk` | Removed **by design** — the canonical `Event` is emitted site-wide via `schema-site.njk` (documented in `CLAUDE.md`) |
| `src/assets/js/aeo-inspector.js.txt`, `src/data/citations.json.txt`, `src/how-it-works.njk.txt` | `.txt` staging copies; the real AEO Inspector, citation report (`src/citation-report.njk` + `src/_data/citations.json`) and `src/how-it-works.njk` all ship on main in evolved form |
| `src/speakers/canso-director-general.md` | Main's speaker collection uses real named speakers (11 pages) |
| `src/_includes/components/layers.css` | Old homepage "layers" component; the Home page was rewritten (merged per `CLAUDE.md`) |

**Execution status:** deletion could **not** be executed from this session —
the session's git credentials are scoped to push only to
`claude/asw-hub-housekeeping-i7kcb3` (HTTP 403 on any other ref, including
tags), and the GitHub MCP toolset has no branch-deletion call.

**Operator follow-up (one command each, from any machine with push rights):**

```bash
# optional but recommended — keep the early history findable:
git fetch origin feature/educational-layers
git tag archive/educational-layers origin/feature/educational-layers
git push origin archive/educational-layers

# then delete the branch:
git push origin --delete feature/educational-layers
```

Or via GitHub UI: *Branches → feature/educational-layers → 🗑*. Nothing breaks
if the tag step is skipped — the content is superseded — but the tag preserves
the audit trail at zero cost.

## 3. Final repository state (verified 2026-07-14)

- **main:** `f449453` — "CANSO demo: revise Go Deeper copy" (2026-07-13)
- **Uncommitted files:** 0 (before this summary was added)
- **Local branches:** `claude/asw-hub-housekeeping-i7kcb3` (this session), `main`
- **Remote branches:** `main`, `feature/educational-layers` (pending operator
  deletion above), this session's branch, plus **36 stale `claude/*` session
  branches** (see §4)
- **Stashes:** none
- **Live site:** untouched — no change in this pass affects `main` or the
  Netlify deploy; `aswhub.maxifidigital.com` proof-of-concept integrity preserved.

Recent `git log` (main):

```
f449453 2026-07-13 CANSO demo: revise Go Deeper copy
dd0a15f 2026-07-13 Docs: record explainer embed + Plausible; fix dead relatedSessions links
4498e26 2026-07-13 CANSO demo: embed Visibility Value Model explainer + Plausible analytics
9cb29a9 2026-07-06 Add Gemini line to Ortus demo ticker after re-run (#44)
4e4a88b 2026-07-06 Populate Ortus demo ticker from real mini-audit + demo-template docs (#42)
```

## 4. Risks, blockers, follow-ups

1. **Blocker (minor):** `feature/educational-layers` deletion needs the two
   operator commands in §2 — session push scope prevented direct execution.
2. **Stale-branch debt:** ~36 old `claude/*` session branches on origin.
   Harmless but noisy. **10 open draft PRs** (#6, #11, #16–#20, #24, #25, #38)
   also pending triage — several may be superseded (e.g. #16/#17/#18 predate the
   merged monitoring work; #24 vs #25 overlap). Recommend a 15-minute
   close-or-merge sweep, but that is a content decision, not housekeeping —
   deliberately not executed here.
3. **Stale task briefs:** this brief was built from a ~2-month-old repo
   snapshot. Before acting on repo-state claims in future briefs, verify
   against live `git status` first (as done here) — acting on the stale claims
   would have meant hunting for phantom files.
4. **No risk to the CANSO pipeline:** nothing in this pass touches the live
   site, the `/CANSO-demo/` page, or the demo backend.
