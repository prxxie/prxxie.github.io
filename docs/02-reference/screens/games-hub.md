# Games hub

**Route** `/games` · **Job**: let a visitor choose a puzzle in one screen, and show that the visitor's previous play still
exists (NFR-05). **Status**: designed, not built; today the three games are three tabs and there is no hub.

## Entry and exit

- **Entry**: the header's Games item, the home page's play section, or a game's own "all games" control.
- **Exit**: a game, or back to the home page. A visitor who has played before sees their star tally here and can resume
  the level they left.

## Layout

| Region | Contents |
|--------|----------|
| Intro | one line: three puzzles, played in the browser, progress kept on this device |
| Star tally | total stars earned out of the total possible, and the pet's stage |
| Game cards | three cards in a row (stacked below 768px): name, one-line rule, level count, stars earned for that game, and a primary "Play" |
| Resume | only when a level is unfinished: a secondary row offering the last level |

Each card carries one number a stranger can use — how many levels, how many stars — and nothing else: no screenshot
carousel, no description longer than a line.

## Fields

| Field | Type | Validation | Source |
|-------|------|-----------|--------|
| Game name | `string` | one of the three module ids | each game's package |
| Rule line | `string` | ≤ 90 characters | content module |
| Level count | `number` | derived from the game's catalog | each game's `levels.ts` |
| Stars earned | `number` | derived: sum of best stars for that module | `ProgressState.completedLevels` |

## States

| State | What renders |
|-------|--------------|
| Loading | prerendered cards; only the star figures fill in after the repository loads |
| Never played | `0 / n` stars per card, the tally at `0`, the pet at stage 1 |
| Partly played | per-card figures, and a resume row when a level was started and not finished |
| All solved | every card full; the tally states it plainly rather than congratulating |
| Remote offline | the affected card's Play is disabled with the reason; the other two stay playable |
| Narrow | cards stack; the star figures stay on the card, not in a legend |

## Actions

| Action | Effect | Backend | Permission |
|--------|--------|---------|------------|
| Play a game | navigates to `/games/<game>` | none | any visitor |
| Resume a level | same, with the level preselected | none | any visitor |
| Back to home | navigates to `/` | none | any visitor |

## Accessibility

- Cards are a list of links, not a grid of divs: a screen-reader visitor hears three links with their names.
- Stars are text (`2 of 3 stars`) with the glyphs marked decorative; the count is never carried by colour alone.
- Disabled Play states explain themselves in text, not only by dimming.
- Focus order follows the visual order at every breakpoint.

## Design

`docs/02-reference/design-system.md` — cards use the card recipe, one coral primary per card is allowed only on the
hovered/focused card; the rest are secondary outlines so three corals never compete.
