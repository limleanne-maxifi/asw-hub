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
2. **Stale-branch debt:** triaged in full on 2026-07-14 (second pass) — see §5
   below for the complete branch and PR disposition table.
3. **Stale task briefs:** this brief was built from a ~2-month-old repo
   snapshot. Before acting on repo-state claims in future briefs, verify
   against live `git status` first (as done here) — acting on the stale claims
   would have meant hunting for phantom files.
4. **No risk to the CANSO pipeline:** nothing in this pass touches the live
   site, the `/CANSO-demo/` page, or the demo backend.

---

## 5. Branch & PR triage — second pass, 2026-07-14

Method: `git cherry origin/main <branch>` (patch-equivalence) + mapping each
branch to its merged squash commit on main + review of all 10 open draft PRs.

### 5a. Open draft PRs (10) — decisions

| PR | Branch | Decision | Rationale |
|---|---|---|---|
| #6 citation-check script | `claude/affectionate-bohr-WCwVD` | **CLOSED** ✔ (2026-07-14) | Superseded by merged monthly monitor (#13) + manual live-fire audit process (#39); engine keys live on Render, not here |
| #11 session fixes + 6 canonical conversions | `claude/adoring-hopper-vq6kok` | **KEEP — highest-value open PR** | Does exactly the top backlog item (canonical Session pattern rollout) + URL fixes; predates merged post-event tense sweep (#10) so needs a rebase before merge |
| #16 GSC skip diagnostic | `claude/vibrant-newton-jnuvqd` | **CLOSED** ✔ (2026-07-14) | Moot — GSC activation since confirmed working end-to-end |
| #17 Google discovery seeding docs | `claude/wonderful-planck-pwn3sr` | **MERGE** (docs-only) | Google indexing gap (0/52) is still the standing issue; checklist still accurate |
| #18 GSC_SA_JSON credentials note | `claude/eager-curie-wbg4wr` | **MERGE** (docs-only) | Captures two hard-won activation gotchas; still accurate |
| #19 /compare/ AEO scorecard page | `claude/comparison-page` | **USER DECISION** | Sales asset that could support the Treacher pivot, but written pre-event — needs a freshness/tense pass before it can go live |
| #20 22-June citation quick-check | `claude/nifty-galileo-kajyu4` | **CLOSED** ✔ (2026-07-14) | Superseded by the merged 2 July full audit (#39) |
| #24 monitor alerts variant | `claude/index-citation-alerts` | **CLOSED** ✔ (2026-07-14) | #25 is the richer superset of the same upgrade; the two conflicted |
| #25 monthly monitor upgrade | `claude/serene-sagan-um37kt` | **MERGE after rebase + fresh-session verify** | Brings deployed script up to the routine's spec; verified against live creds when written |
| #38 OpenAI model-access routine | `claude/asw-hub-aeo-demo-verify-bh8zqa` | **MERGE** (docs-only) | Current; supports the demo model-upgrade decision |

### 5b. Branches with no open PR (26) — all safe to delete

**18 branches with zero unmerged patches** (`git cherry` shows every commit
already in main): `aeo-demo-publish`, `awesome-noether-25erl6`,
`canso-demo-fonts-logo`, `canso-demo-inter`, `canso-demo-linebreak`,
`canso-demo-netlify-proxy`, `canso-demo-path`, `canso-demo-token`,
`citation-q1-themes`, `citation-report-july-audit-nbfzvm`,
`demo-live-verify-docs`, `friendly-mccarthy-jhoqaq`,
`generic-demo-template-7qxbel`, `great-ritchie-wd7olz`,
`handoff-canonical-note`, `monitor-egress-domains`, `pensive-turing-3q9o1b`,
`wizardly-feynman-g0ra6h`.

**7 branches whose work landed via squash-merge** (patch-ids differ but content
is on main): `clever-einstein-a32jJ` (→ #7 + #8), `nice-carson-G7P6O` (→ #4
SpaceX keynote + canonical layout), `replace-themes-official-tracks` (→
`7fad69a` official-tracks alignment), `resume-session-Q0smv` (→ `03c7ae7` site
title; footer naming since superseded twice), `ruflo-init-wizard-install-fqyzp8`
(→ #43), `sweet-johnson-x41k1p` (→ #27 presets doc), `zen-newton-0o0lgh` (→
#27/#28 Carbon demo, since evolved into /CANSO-demo/).

**Plus `feature/educational-layers`** (§2) and, after the 4 closures above,
the 4 branches behind the closed PRs (`affectionate-bohr-WCwVD`,
`vibrant-newton-jnuvqd`, `nifty-galileo-kajyu4`, `index-citation-alerts`).

**Total: 30 branches ready for deletion.** Session push scope prevents doing it
from here; ready-to-paste operator command:

```bash
git push origin --delete \
  feature/educational-layers \
  claude/aeo-demo-publish claude/awesome-noether-25erl6 \
  claude/canso-demo-fonts-logo claude/canso-demo-inter claude/canso-demo-linebreak \
  claude/canso-demo-netlify-proxy claude/canso-demo-path claude/canso-demo-token \
  claude/citation-q1-themes claude/citation-report-july-audit-nbfzvm \
  claude/demo-live-verify-docs claude/friendly-mccarthy-jhoqaq \
  claude/generic-demo-template-7qxbel claude/great-ritchie-wd7olz \
  claude/handoff-canonical-note claude/monitor-egress-domains \
  claude/pensive-turing-3q9o1b claude/wizardly-feynman-g0ra6h \
  claude/clever-einstein-a32jJ claude/nice-carson-G7P6O \
  claude/replace-themes-official-tracks claude/resume-session-Q0smv \
  claude/ruflo-init-wizard-install-fqyzp8 claude/sweet-johnson-x41k1p \
  claude/zen-newton-0o0lgh \
  claude/affectionate-bohr-WCwVD claude/vibrant-newton-jnuvqd \
  claude/nifty-galileo-kajyu4 claude/index-citation-alerts
```

Branches to KEEP until their PRs resolve: `adoring-hopper-vq6kok` (#11),
`wonderful-planck-pwn3sr` (#17), `eager-curie-wbg4wr` (#18), `comparison-page`
(#19), `serene-sagan-um37kt` (#25), `asw-hub-aeo-demo-verify-bh8zqa` (#38).

## 6. Insights page → "Briefings and analysis" + new AEO article (2026-07-14)

Shipped on this branch alongside the triage:

- **Rename:** page `title`, eyebrow, nav label, footer link, and insight-layout
  CTA now read "Briefings & analysis" (the H1 already did). **URLs unchanged** —
  `/insights/` and all article slugs stay as-is so nothing indexed or cited
  breaks.
- **New lead article:** `/insights/ai-answers-deleting-clicks-aeo-non-negotiable/`
  ("AI answers are deleting traditional clicks — why AEO is now non-negotiable"),
  dated 2026-07-14. AEO-optimised per the flagship pattern: answer-first opening
  paragraph, question-phrased H2s, en-GB throughout, named entities (six engines,
  Forrester Jan 2026 stats), three-bullet takeaways, 5-question FAQ with inline
  `FAQPage` JSON-LD. Built page carries 4 valid JSON-LD blocks (site @graph,
  BreadcrumbList, Article, FAQPage); in sitemap and llms.txt.
- **The 15 Jan article stays live** (owner decision, 2026-07-14): it is the page
  Microsoft Copilot cited on 2 July — the tracked test-case URL in the public AI
  Citation Tracker (`src/_data/citations.json`) — so deleting it would 404 the
  URL the sales proof points at. It simply no longer leads the listing (newest
  first).
