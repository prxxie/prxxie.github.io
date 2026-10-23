---
id: US-GAME-004
title: Restyle Slitherlink in its own repository
epic: EPIC-04-games
status: ready
priority: P3
size: L
depends_on: [US-DS-001, US-DS-002]
open_questions: []
accepted_assumptions: [OQ-04]
refs: ["02-reference/design-system.md", "04-decisions/adr/ADR-0003-module-federation-remotes.md", "02-reference/screens/README.md"]
---

# US-GAME-004 — Restyle Slitherlink in its own repository

## 1. Story

**As a** visitor
**I want** the slitherlink board to match the site and to be playable without a mouse
**so that** the third puzzle stops looking like a different product.

## 2. Context

Same shape as the shikaku restyle, with the loop-drawing interaction as the risk: the board is a canvas-like grid with pointer-drag input, so keyboard parity is real work, not a class-name change.

**NFRs**: NFR-12, NFR-13, NFR-14, NFR-19

| Topic | Reference |
|-------|-----------|
| Design system | [design-system.md](../../02-reference/design-system.md) |
| ADR-0003 | [ADR-0003-module-federation-remotes.md](../../04-decisions/adr/ADR-0003-module-federation-remotes.md) |
| Screens | [README.md](../../02-reference/screens/README.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the game at `/games/slitherlink` | a level is opened | the board and clue typography use the shared tokens |
| AC2 | the board | it is played with the keyboard only | edges can be drawn and removed with the keyboard and a level can be completed |
| AC3 | a level | it is completed | the closed-loop validation still succeeds and progress is written once |
| AC4 | the game | `prefers-reduced-motion` is set | the win animation is removed and the board is still legible |
| AC5 | the host | the pointer is bumped | the restyled bundle is served and the old one is gone |
| AC6 | the game at 360px | it is played | the grid and the clue numbers fit without horizontal scroll |

## 4. Contract

Consumes the host token set only; no local palette. Expose name stays `slitherlink/SlitherlinkApp`.

## 5. Rules and edge cases

- The loop validation engine is not touched.
- Keyboard input must go through the same store actions the pointer uses, so undo and validation stay consistent.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- New puzzle sizes or clue-generation changes.

## 8. Test notes

Existing engine and store tests stay green; add a keyboard completion component test and one reduced-motion check.

## 9. Open questions

- `OQ-04` — built on its recorded **Assumption**; if the answer differs, the affected acceptance criteria are re-checked before the story closes.
