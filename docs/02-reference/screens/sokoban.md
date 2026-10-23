# Sokoban

**Route** `/games/sokoban` · **Job**: the box-pushing puzzle, playable on the first visit, re-skinned into the editorial
system (OQ-11) — **and with its two unsolvable levels fixed** (OQ-05). **Status**: shipped as a tab with the amber chrome;
restyle, route and the level fix are pending, in its own repository.

## Entry and exit

- **Entry**: the games hub, or a direct link. The first level starts playable.
- **Exit**: back to the hub, the next level, or the level list. A stuck visitor always has reset and level list within
  reach, because being stuck is the normal state of this puzzle.

## Layout

| Region | Contents |
|--------|----------|
| Header | back to hub, game name, level number of 100, stars for this game, sound toggle |
| Board | walls, floor, goals, boxes, the player |
| Controls | undo, reset, level list, move counter; a directional pad below 768px |
| Win panel | stars, moves and pushes, "next level", "back to hub" |

## Fields

| Field | Type | Validation | Source |
|-------|------|-----------|--------|
| Level | `{ id, width, height, walls, goals, boxes, player }` | exactly as many boxes as goals; the level must be solvable | `packages/sokoban/src/levels.ts` |
| Stars | `number` 0–3 | awarded from moves and pushes | game engine |
| Level id | `string` | `hack-06` and `hack-10` must be re-authored, never left unsolvable | level catalog |

Two of the hundred levels are unsolvable in the shipped catalog — the search reports them as exhausted rather than
solved, so a visitor can never finish them. They are re-authored inside the game repository as part of the restyle, and
the regression test that proves solvability is part of that story.

## States

| State | What renders |
|-------|--------------|
| Loading | board frame with a skeleton grid |
| Playing | the current board, move and push counters |
| Stuck | nothing modal: undo, reset and the level list stay enabled |
| Solved | the win panel with stars and next level |
| Remote offline | the host's named fallback with retry |
| Narrow | board above, directional pad below in thumb reach |

## Actions

| Action | Effect | Backend | Permission |
|--------|--------|---------|------------|
| Move / push | steps the player, pushing a box when the cell ahead holds one | none | any visitor |
| Undo / reset | steps back through the move stack / restarts the level | none | any visitor |
| Level list | opens the 100-level list with solved marks | none | any visitor |
| Solve | writes a `CompletedLevel` with stars, awards XP, advances | none | any visitor |

## Accessibility

- The board is a grid with focusable cells; walls, goals and boxes are announced by role, not by colour.
- Arrow keys move the player; the directional pad is a set of buttons with real labels so it also serves switch access.
- Every move that changes the board announces the new position through a live region, throttled so a held key does not
  flood the reader.
- Undo and reset are labelled buttons, not icons.

## Design

`docs/02-reference/design-system.md` — dark board surface, cream page, coral reserved for the win panel's primary action.
