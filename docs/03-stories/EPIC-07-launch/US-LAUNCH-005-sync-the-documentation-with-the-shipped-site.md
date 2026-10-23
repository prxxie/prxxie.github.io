---
id: US-LAUNCH-005
title: Sync the documentation with the shipped site
epic: EPIC-07-launch
status: done
priority: P3
size: M
depends_on: [US-SITE-001, US-DS-001, US-PET-003]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/conventions.md", "04-decisions/open-questions.md", "01-overview/architecture.md"]
---

# US-LAUNCH-005 — Sync the documentation with the shipped site

## 1. Story

**As a** future maintainer
**I want** the docs, the agent guide and the archive to describe the site that exists
**so that** the next person — or the next session — starts from truth.

## 2. Context

`DESIGN.md` describes the amber terminal that no longer exists, `docs/superpowers/` holds 48 files from a different process, and `AGENTS.md` still lists a pets tab and Supabase. OQ-09 settled the fate of the archive; this story executes it and refreshes the guide.

| Topic | Reference |
|-------|-----------|
| Conventions | [conventions.md](../../01-overview/conventions.md) |
| OQ-09 answer | [open-questions.md](../../04-decisions/open-questions.md) |
| Architecture | [architecture.md](../../01-overview/architecture.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the repository | the root files are read | `DESIGN.md` is gone and `docs/superpowers/` is archived or removed as OQ-09 decided |
| AC2 | `AGENTS.md` | its PROJECT section is read | it describes the routes, the token system, the pet widget and the local-only progress that exist |
| AC3 | the doc set | `verify-docs.py` runs | it reports zero errors and zero warnings |
| AC4 | the environment docs | they are read | no `(planned — verify after US-FND-001)` marker remains anywhere |
| AC5 | the reference indexes | their story columns are read | every screen and capability names the story that built it |

## 4. Contract

The PROJECT block in `AGENTS.md` stays between its `adf:project` markers; the section is regenerated, not appended to.

## 5. Rules and edge cases

- Delete nothing without recording where it went.
- The doc set is the contract: if code and docs disagree at the end of this story, the docs are wrong and are fixed.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Rewriting the adopted brief or the architecture decision records.

## 8. Test notes

The verifier is the test: `python3 .agents/scripts/verify-docs.py` exits 0, plus a read-through of AGENTS.md against the shipped route list.

## 9. Open questions

None.

## 10. Outcome

| # | Criterion | Where it is proven |
|---|-----------|--------------------|
| AC1 | `DESIGN.md` gone, the archive removed as OQ-09 decided | `git rm DESIGN.md`, `git rm -r docs/superpowers` — the cream/coral tokens live in `packages/shell/src/index.css`, the solver rationale in `US-GAME-003`, the evolution thresholds in `docs/02-reference/data/README.md` |
| AC2 | `AGENTS.md` describes routes, tokens, the pet widget and local-only progress | `AGENTS.md` § Routes, Design tokens, Pet and progress, Module Federation, CI and deploy |
| AC3 | `verify-docs.py` clean | `0 error(s), 0 warning(s)` |
| AC4 | no `(planned — verify after US-FND-001)` marker anywhere | `grep -r "planned — verify" docs/ AGENTS.md` returns only the two story texts that describe the requirement |
| AC5 | every screen names the story that built it | `docs/02-reference/screens/README.md` status column refreshed; the ten shipped stories that had no outcome row now carry one |

Notes: the doc set no longer claims an open question — all twelve are answered. Three remotes (`about`, `posts`, `pets`) still import daisyUI; their restyles are the remaining game and pet stories, and `docs/01-overview/conventions.md` records the deviation until then.
