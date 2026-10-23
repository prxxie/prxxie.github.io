---
id: US-GAME-005
title: Load a game by URL
epic: EPIC-04-games
status: ready
priority: P1
size: M
depends_on: [US-SITE-003, US-GAME-001]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/architecture.md", "02-reference/screens/README.md"]
---

# US-GAME-005 — Load a game by URL

## 1. Story

**As a** visitor
**I want** a game to open from its own URL with the shell around it
**so that** I can share a link to a specific game and go back without losing the page.

## 2. Context

`/games/:game` is the route the hub links to and the sitemap lists. It must load exactly one remote, show a named header with the way back and the star count, and never leave an empty frame (NFR-03, NFR-06).

**NFRs**: NFR-02, NFR-03, NFR-06

| Topic | Reference |
|-------|-----------|
| Architecture | [architecture.md](../../01-overview/architecture.md) |
| Screens | [README.md](../../02-reference/screens/README.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | `/games/shikaku` | it is opened directly | the shikaku remote is fetched, the board appears, and no other game remote is requested |
| AC2 | the route | it is loaded | the header shows the game title, the earned stars and a link back to `/games` |
| AC3 | an unknown game slug | it is opened | the not-found screen renders instead of an empty frame |
| AC4 | the remote | it fails to load | the named fallback renders with a retry, and the hub link still works |
| AC5 | the gameplay route | it is left for the hub | the shell returns to the hub with the updated star count, without a reload |
| AC6 | the game route | it is prerendered | the document contains the header and the loading placeholder, not a board |

## 4. Contract

The route reads the game from the `games` registry by slug; an unknown slug is a 404. The star count comes from `ProgressService` and updates on `cozyos:progress-updated`.

## 5. Rules and edge cases

- Only the addressed remote is imported — no eager import map of all three.
- The header is the shell's, not the game's.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Deep links into a specific level (the game keeps its own level choice).

## 8. Test notes

Router-level test with a mocked dynamic import per slug asserting exactly one fetch; a failure-path test for the fallback.

## 9. Open questions

None.
