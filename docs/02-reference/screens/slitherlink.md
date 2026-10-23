# Slitherlink

**Route** `/games/slitherlink` · **Job**: the loop-drawing puzzle, playable on the first visit, re-skinned into the
editorial system (OQ-11). **Status**: shipped as a tab with the amber chrome; restyle and route are pending, in its own
repository.

## Entry and exit

- **Entry**: the games hub, or a direct link. Ten levels, easy to medium, in order.
- **Exit**: back to the hub, next level, or the level list.

## Layout

| Region | Contents |
|--------|----------|
| Header | back to hub, game name, level number of 10, stars for this game, sound toggle |
| Board | the clue grid; edges are drawn, crossed or blank |
| Controls | undo, clear, and the rule in one sentence |
| Win panel | stars, time, "next level", "back to hub" |

## Fields

| Field | Type | Validation | Source |
|-------|------|-----------|--------|
| Level | `{ id, width, height, clues }` | every clue `n` in `0..3` must be satisfiable | `packages/slitherlink/src/levels.ts` |
| Edge state | `blank`, `line`, `cross` | the finished loop must be one closed loop with every clue's count exact | `packages/slitherlink/src/engine/validation.ts` |
| Stars | `number` 0–3 | awarded from time and corrections | game engine |

## States

| State | What renders |
|-------|--------------|
| Loading | board frame with a skeleton grid |
| Playing | drawn and crossed edges, clue numbers |
| Loop closed but wrong | the loop renders as invalid on release; no modal, no error toast |
| Solved | the win panel with stars and next level |
| Remote offline | the host's named fallback with retry |

## Actions

| Action | Effect | Backend | Permission |
|--------|--------|---------|------------|
| Click / drag an edge | cycles blank → line → cross | none | any visitor |
| Undo / clear | steps back / clears every edge | none | any visitor |
| Solve | writes a `CompletedLevel` with stars, awards XP, advances | none | any visitor |

## Accessibility

- Edges are buttons in a grid, each announcing its position and state (`row 3, between columns 2 and 3, line`).
- Keyboard: focus an edge, space cycles its state; no drag required for the core interaction.
- Clue cells announce their number as text.
- The win panel is a live region and takes focus.

## Design

`docs/02-reference/design-system.md` — dark board, cream chrome, the drawn loop in the primary colour so the solution reads
as the page's one coral element.
