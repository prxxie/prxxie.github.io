---
id: US-GAME-001
title: Build the games hub
epic: EPIC-04-games
status: ready
priority: P1
size: M
depends_on: [US-SITE-003]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/screens/README.md", "02-reference/data/README.md", "01-overview/architecture.md"]
---

# US-GAME-001 — Build the games hub

## 1. Story

**As a** visitor
**I want** one page that lists the three games and shows how far I have got in each
**so that** I can choose a puzzle from a single place instead of a tab strip.

## 2. Context

The three games are currently top-level tabs, each loading its remote on demand. The hub replaces the tabs with cards built from one registry, showing stars per game and a resume row for the last thing played — all from `ProgressService`, so it is prerendered text and needs no game remote.

**NFRs**: NFR-03, NFR-15

| Topic | Reference |
|-------|-----------|
| Screens | [README.md](../../02-reference/screens/README.md) |
| Data model | [README.md](../../02-reference/data/README.md) |
| Architecture | [architecture.md](../../01-overview/architecture.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | `/games` | it is prerendered | three cards are in the HTML with their titles and level counts |
| AC2 | a game | it has completed levels | its card shows the earned stars against the total and a resume link |
| AC3 | a game | it has no progress | its card shows a start affordance, not a zeroed scoreboard |
| AC4 | a remote that is unreachable | the hub is opened | the card still renders and says the game is unavailable |
| AC5 | the hub | it is navigated with the keyboard | each card is reachable and opens with Enter |
| AC6 | the page | it is loaded with JavaScript disabled | the three titles and links are readable |

## 4. Contract

One `games` registry module — `{ id, title, blurb, levelCount, remote }` — is the single source for the hub, the route table (US-SITE-001), the prerender expansion and the sitemap. Nothing else may hardcode a game slug.

## 5. Rules and edge cases

- Star totals are read from progress, never from the game bundle.
- A game whose remote is down is listed as unavailable rather than hidden.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- A game detail page showing every level — the game itself owns level selection.

## 8. Test notes

Component tests over three registry fixtures (no progress, partial, complete) and an unavailable-remote case.

## 9. Open questions

None.
