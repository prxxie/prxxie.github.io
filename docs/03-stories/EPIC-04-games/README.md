---
id: EPIC-04-games
code: GAME
title: The games hub and three games in the same clothes
---

# EPIC-04 — The games hub and three games in the same clothes

The three puzzles stop being separate tabs in amber terminal dress and become one exhibit: a hub that lists them with what is finished, a route that loads one of them, and three repositories restyled onto the cream/coral system — including the sokoban level that cannot be solved.

## Goal

The visitor opens `/games`, sees three cards with their completion state, opens one, plays a level that looks like the rest of the site, and comes back to a hub that remembers it.

## Stories

Generated from story frontmatter — run `python3 .agents/scripts/verify-docs.py --fix`; do not edit by hand.

<!-- adf:epic-stories -->
| Id | Title | Priority | Size | Status | Depends on |
|---|---|---|---|---|---|
| [US-GAME-001](US-GAME-001-build-the-games-hub.md) | Build the games hub | P1 | M | ready | US-SITE-003 |
| [US-GAME-002](US-GAME-002-restyle-shikaku-in-its-own-repository.md) | Restyle Shikaku in its own repository | P2 | L | ready | US-DS-001, US-DS-002 |
| [US-GAME-003](US-GAME-003-restyle-sokoban-and-fix-the-two-unsolvable-levels.md) | Restyle Sokoban and fix the two unsolvable levels | P2 | L | ready | US-DS-001, US-DS-002 |
| [US-GAME-004](US-GAME-004-restyle-slitherlink-in-its-own-repository.md) | Restyle Slitherlink in its own repository | P3 | L | ready | US-DS-001, US-DS-002 |
| [US-GAME-005](US-GAME-005-load-a-game-by-url.md) | Load a game by URL | P1 | M | ready | US-SITE-003, US-GAME-001 |
<!-- /adf:epic-stories -->

## Out of scope

- New puzzles or new levels beyond the sokoban fix.
- Multiplayer, accounts or leaderboards.
- Changing a game engine's rules.
