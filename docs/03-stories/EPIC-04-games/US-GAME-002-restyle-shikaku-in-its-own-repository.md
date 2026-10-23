---
id: US-GAME-002
title: Restyle Shikaku in its own repository
epic: EPIC-04-games
status: ready
priority: P2
size: L
depends_on: [US-DS-001, US-DS-002]
open_questions: []
accepted_assumptions: [OQ-04]
refs: ["02-reference/design-system.md", "04-decisions/adr/ADR-0003-module-federation-remotes.md", "02-reference/screens/README.md"]
---

# US-GAME-002 — Restyle Shikaku in its own repository

## 1. Story

**As a** visitor
**I want** the shikaku board to look like the rest of the site, and to be playable with the keyboard
**so that** the game feels like part of the product instead of a different site.

## 2. Context

`packages/shikaku` is a separate repository mounted as a submodule, so the restyle happens there and arrives here as a released bundle plus a pointer bump. It currently ships its own amber styles; the token contract in `docs/02-reference/design-system.md` § Game surfaces is what it must consume.

**NFRs**: NFR-12, NFR-13, NFR-14, NFR-19

| Topic | Reference |
|-------|-----------|
| Design system | [design-system.md](../../02-reference/design-system.md) |
| ADR-0003 | [ADR-0003-module-federation-remotes.md](../../04-decisions/adr/ADR-0003-module-federation-remotes.md) |
| Screens | [README.md](../../02-reference/screens/README.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the game at `/games/shikaku` | a level is opened | the board, grid and controls use the shared tokens — no amber surface, no pixel border |
| AC2 | the board | it is played with the keyboard only | focus is visible on the board, the cursor moves with the arrow keys and a level can be completed |
| AC3 | the game | `prefers-reduced-motion` is set | win and error animations are removed |
| AC4 | the game | a level is solved | it dispatches `cozyos:progress-updated` exactly once and the host star count changes |
| AC5 | the host | the submodule pointer is bumped | the new bundle is fetched and the old one is gone from the artifact |
| AC6 | the game at 360px | it is played | the grid fits without horizontal scroll |

## 4. Contract

The game consumes only CSS custom properties published by the host (`--color-*`, `--font-*`, `--radius-*`, `--space-*`); it declares no palette of its own. Its expose name stays `shikaku/ShikakuApp`.

## 5. Rules and edge cases

- Ship from the game repository through its own release workflow, then bump the pointer here — never edit the submodule from this repository.
- Keep the engine untouched; this story changes presentation and input only.
- The pointer bump is part of the story, not a follow-up.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Changing puzzle rules or level data.

## 8. Test notes

The game's existing engine tests must stay green; add a keyboard-only completion test at the component level and record one manual reduced-motion check.

## 9. Open questions

- `OQ-04` — built on its recorded **Assumption**; if the answer differs, the affected acceptance criteria are re-checked before the story closes.
