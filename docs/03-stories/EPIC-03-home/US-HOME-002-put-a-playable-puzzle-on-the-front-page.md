---
id: US-HOME-002
title: Put a playable puzzle on the front page
epic: EPIC-03-home
status: ready
priority: P1
size: L
depends_on: [US-HOME-001]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/architecture.md", "02-reference/screens/README.md", "02-reference/data/README.md"]
---

# US-HOME-002 — Put a playable puzzle on the front page

## 1. Story

**As a** visitor
**I want** to solve a real level without leaving the page or creating anything
**so that** I experience the product instead of reading about it.

## 2. Context

This is the single strongest claim the page makes, and it is the only place a game remote is loaded outside its own route (NFR-02 is scoped to first paint, so the embed must be deliberate: a container, an explicit load, and a placeholder before it). The level comes from an existing game and its win writes progress through the same service the game uses.

**NFRs**: NFR-02, NFR-03, NFR-04, NFR-13

| Topic | Reference |
|-------|-----------|
| Architecture | [architecture.md](../../01-overview/architecture.md) |
| Screens | [README.md](../../02-reference/screens/README.md) |
| Data model | [README.md](../../02-reference/data/README.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the home page | it is first displayed | the puzzle container renders with a call to action, and no remote has been fetched |
| AC2 | the call to action | it is activated | the remote loads, the board appears, and the visitor can solve it |
| AC3 | the level | it is solved | progress is written once, a completed indicator appears, and the proof figures update |
| AC4 | the remote | it fails to load | a named placeholder with a retry appears and the rest of the page is unaffected |
| AC5 | the puzzle | it is played with the keyboard only | the level can be completed |
| AC6 | the page | `prefers-reduced-motion` is set | the board and the win affordance do not animate |

## 4. Contract

One `GameEmbed` component parameterised by game id and level id, reused by the devlog teaser (US-DEVLOG-004). It takes an explicit `levelId`, renders `MfeLoader` and `Fallback`, and reports a win through `ProgressService`.

## 5. Rules and edge cases

- The embed counts as play: the proof figure and the pet react to it like any other completion.
- Never autoplay or preload the remote on first paint.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- A second embedded game, or a puzzle of the day rotation.

## 8. Test notes

Component test with a mocked remote: lazy fetch, placeholder, win path; manual keyboard and reduced-motion check.

## 9. Open questions

None.
