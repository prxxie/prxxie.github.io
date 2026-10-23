---
id: US-GAME-003
title: Restyle Sokoban and fix the two unsolvable levels
epic: EPIC-04-games
status: ready
priority: P2
size: L
depends_on: [US-DS-001, US-DS-002]
open_questions: []
accepted_assumptions: [OQ-04]
refs: ["02-reference/design-system.md", "04-decisions/open-questions.md", "04-decisions/adr/ADR-0003-module-federation-remotes.md"]
---

# US-GAME-003 — Restyle Sokoban and fix the two unsolvable levels

## 1. Story

**As a** visitor
**I want** a sokoban that looks like the site and whose levels can actually be finished
**so that** I do not spend ten minutes on a puzzle that has no solution.

## 2. Context

Two levels, `hack-06` and `hack-10`, fail the repository's own solvability test: the solver exhausts its state budget (`packages/sokoban/src/engine/solver.ts:93` `maxStates = 100000`, the cap check at `:134`) after exploring 46973 of 66605 states for `hack-06`. OQ-05 chose the fix: correct the levels and keep both the solver and the assertion. The restyle rides along because it is the same release.

**NFRs**: NFR-12, NFR-13, NFR-19

| Topic | Reference |
|-------|-----------|
| Design system | [design-system.md](../../02-reference/design-system.md) |
| OQ-05 answer | [open-questions.md](../../04-decisions/open-questions.md) |
| ADR-0003 | [ADR-0003-module-federation-remotes.md](../../04-decisions/adr/ADR-0003-module-federation-remotes.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | `hack-06` and `hack-10` | the solvability test runs | both are proven solvable well inside the state budget |
| AC2 | a level | it is replayed from the recorded solution | the boxes land on every goal |
| AC3 | the level catalog | it is read | the two ids, their titles and their level counts are unchanged |
| AC4 | the game at `/games/sokoban` | a level is played | it uses the shared tokens and can be completed with the keyboard |
| AC5 | the game | `prefers-reduced-motion` is set | move and win animations are removed |
| AC6 | the host artifact | the submodule pointer is bumped | the fixed bundle is served |

## 4. Contract

The solver contract is unchanged: `solve(level, { maxStates })` still returns a move list or a failure. A level fix must be a level edit (or a documented difficulty reduction), never a raised budget.

## 5. Rules and edge cases

- Raising `maxStates` is not a fix — it is the assertion being weakened.
- Do not delete the failing levels: they are referenced by progression.
- Record the explored-state count before and after in the story.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Rewriting the solver.
- Changing the difficulty curve of the other levels.

## 8. Test notes

The existing engine suite is the test: add the two levels to the solvability table and assert the state count stays under the budget with margin.

## 9. Open questions

- `OQ-04` — built on its recorded **Assumption**; if the answer differs, the affected acceptance criteria are re-checked before the story closes.
