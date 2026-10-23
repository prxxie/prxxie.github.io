# Delivery plan

Seven waves, 36 stories, **100.5 story-days** at S = 1, M = 2.5, L = 4.5. A wave contains only stories whose
dependencies are satisfied by earlier waves; inside a wave the order is dependency, then priority, then what unblocks the
most work. The estimate is one person working uninterrupted — it is a shape, not a schedule.

## Waves

### Wave 1 — the workspace stops lying (4.5 d)

| Story | Size | Priority | Why first |
|-------|------|----------|-----------|
| `US-FND-001` Make the workspace pnpm-canonical | L | P0 | the shadowed `shared` package is the root cause of the red gates and most lint noise |

**Gate**: none. This wave is what makes every later gate meaningful.

### Wave 2 — gates, one design system, real routing (19 d)

| Story | Size | Priority |
|-------|------|----------|
| `US-FND-002` Green the type-check gate | M | P0 |
| `US-FND-003` Green the lint gate | M | P0 |
| `US-FND-004` Delete the cloud-sync code path | M | P1 |
| `US-DS-001` Collapse the two token sets into one | L | P0 |
| `US-SITE-001` Replace the hash router with real routes | L | P0 |
| `US-DEVLOG-001` Compile posts from markdown at build time | M | P1 |

These six share nothing but the workspace fix, so they can be taken in any order. `US-FND-002` and `US-FND-003` should
come first: they are the smallest stories that turn a claim into a fact.

### Wave 3 — the pipeline enforces what the docs promise (8.5 d)

| Story | Size | Priority |
|-------|------|----------|
| `US-FND-005` Make the deploy workflow refuse a red tree | M | P0 |
| `US-SITE-002` Give the shell its regions and its failure states | M | P0 |
| `US-DS-002` Load free-licensed typefaces | M | P1 |
| `US-SITE-005` Land the old hash links on their pages | S | P2 |

**Gate**: `US-FND-005` needs `US-FND-002` and `US-FND-003` green first, or the pipeline it adds cannot pass.

### Wave 4 — the shape of the site (23.5 d)

| Story | Size | Priority |
|-------|------|----------|
| `US-SITE-003` Prerender every route at build time | L | P0 |
| `US-DS-003` Rebuild the chrome and the shared primitives | L | P1 |
| `US-SITE-006` Offer a contact path with no backend | S | P1 |
| `US-GAME-002` Restyle Shikaku in its own repository | L | P2 |
| `US-GAME-003` Restyle Sokoban and fix the two unsolvable levels | L | P2 |
| `US-GAME-004` Restyle Slitherlink in its own repository | L | P3 |

The three game restyles only need the token set and the typefaces, so they can run in their own repositories in
parallel with the shell work. Each one ends with a release and a pointer bump — a story is not done at the commit.

### Wave 5 — pages exist (20 d)

| Story | Size | Priority |
|-------|------|----------|
| `US-SITE-004` Make the real paths work on GitHub Pages | M | P0 |
| `US-HOME-001` Build the proof page | M | P1 |
| `US-GAME-001` Build the games hub | M | P1 |
| `US-PET-001` Build the pet widget | M | P1 |
| `US-DEVLOG-002` List the posts | M | P1 |
| `US-DEVLOG-003` Give each post its own page | M | P1 |
| `US-FND-006` Add the accessibility gate to CI | M | P1 |
| `US-LAUNCH-001` Give every page its metadata and a share card | M | P2 |

Eight parallel-friendly stories, all cut from the same three parts: a route, a collection and a component. The
accessibility gate arrives here because it needs prerendered routes to check.

### Wave 6 — the argument (15 d)

| Story | Size | Priority |
|-------|------|----------|
| `US-HOME-002` Put a playable puzzle on the front page | L | P1 |
| `US-GAME-005` Load a game by URL | M | P1 |
| `US-PET-002` Make the feeding economy legible | M | P2 |
| `US-PET-003` Put the pet in the home footer, and only there | S | P1 |
| `US-HOME-003` Print the proof from the build | M | P2 |
| `US-FND-007` Serve the site from the user-site root | S | P1 |
| `US-LAUNCH-002` Publish a sitemap and robots file | S | P2 |

**Gate**: `US-HOME-002` is the moment the front page stops being a description and becomes a demo. If it slips, the
release still ships — but the page loses its best claim.

### Wave 7 — landing (10 d)

| Story | Size | Priority |
|-------|------|----------|
| `US-DEVLOG-004` Put a teaser level inside a post | M | P2 |
| `US-LAUNCH-003` Meet a performance budget on a cold load | M | P2 |
| `US-LAUNCH-004` Audit and fix accessibility across every route | M | P1 |
| `US-LAUNCH-005` Sync the documentation with the shipped site | M | P3 |

`US-LAUNCH-004` needs every route to exist before the manual pass is meaningful, and `US-LAUNCH-005` is deliberately
last: the doc set is corrected against the finished site.

## Critical path

`US-FND-001` (4.5) → `US-SITE-001` (4.5) → `US-SITE-002` (2.5) → `US-SITE-003` (4.5) → `US-HOME-001` (2.5) →
`US-HOME-002` (4.5) → `US-DEVLOG-004` (2.5) — **25.5 days** of chain, the longest single line of dependencies. The two
hard gates on it are `US-SITE-003` (prerendering) and `US-HOME-002` (the embedded puzzle); everything else on the chain
is assembly.

## First three stories to ship

1. `US-FND-001` — Make the workspace pnpm-canonical. One lockfile, `workspace:*`, and the shadowed `shared` package
   gone. Everything else unblocks from here.
2. `US-FND-002` — Green the type-check gate. Twelve errors, most of them the shadowed package; it is the cheapest proof
   that the repository can be trusted again.
3. `US-FND-003` — Green the lint gate. Seven errors and a hundred warnings, then CI can hold the line.

Then start `US-DS-001` and `US-SITE-001` in parallel: they are the two long poles of waves 2 and 3.

## Assumptions carried into the plan

- `OQ-04` is accepted as recorded for the three game restyles: games are in product scope, defects are fixed in their own
  repositories and the pointer is bumped here. Recorded in each story's `accepted_assumptions`.
- `OQ-12` was answered before planning: React Router 7 with a prerender step (ADR-0009, now `accepted`). No routing story
  is blocked.
- The submodule repositories (`shikaku`, `sokoban`, `slitherlink`) are writable by the owner; the AI agent works in this
  repository and reaches them through the submodule working tree, never by editing a pointer by hand.
