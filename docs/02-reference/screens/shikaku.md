# Shikaku

**Route** `/games/shikaku` · **Job**: the rectangle-fill puzzle, playable on the first visit, re-skinned into the
editorial system (OQ-11). **Status**: shipped as a tab with the amber chrome; restyle and route are pending, in its own
repository.

## Entry and exit

- **Entry**: the games hub, the home page's play section, or a direct link. The board is visible without a click: the
  puzzle is the page.
- **Exit**: back to the hub, the next level, or the devlog. A visitor who solves nothing still has a working back link.

## Layout

| Region | Contents |
|--------|----------|
| Header | back to hub, game name, level number, star count for this game, sound toggle |
| Board | the grid, with clue numbers in cells; filled rectangles drawn over it |
| Controls | undo, reset, and the rule in one sentence |
| Win panel | stars earned, time, "next level", "back to hub" |

## Fields

| Field | Type | Validation | Source |
|-------|------|-----------|--------|
| Level | `{ id, gridWidth, gridHeight, clues }` | every clue cell must be coverable by exactly one rectangle of its area | `packages/shikaku/src/levels.ts` |
| Selection | rectangle on the grid | area must equal a clue it covers; rectangles may not overlap | user input |
| Stars | `number` 0–3 | awarded from move count and time by the game | game engine |

## States

| State | What renders |
|-------|--------------|
| Loading | board frame with a skeleton grid |
| Playing | filled rectangles, the active drag preview |
| Invalid rectangle | the rectangle is redrawn as invalid on release and removed; no modal |
| Solved | the win panel with stars, then next level or hub |
| All levels solved | the last level's win panel offers only the hub |
| Remote offline | the host's named fallback with retry; the header and back link still work |

## Actions

| Action | Effect | Backend | Permission |
|--------|--------|---------|------------|
| Drag on cells | selects a rectangle; release validates it | none | any visitor |
| Undo / reset | steps back / clears the board | none | any visitor |
| Sound toggle | mutes the game's `RetroSynth` | none | any visitor |
| Solve | writes a `CompletedLevel` with stars, awards XP, advances | none | any visitor |

## Accessibility

- The grid is a grid of focusable cells with row and column announced; a clue cell announces its number.
- Arrows move focus, space starts and ends a selection — the drag gesture has a keyboard equivalent.
- The win panel is announced with a live region, and focus moves into it.
- The sound toggle is a labelled button with pressed state, not an icon alone.

## Design

`docs/02-reference/design-system.md` — the board is the page's dark surface; controls and the win panel use the card and
primary-button recipes.
