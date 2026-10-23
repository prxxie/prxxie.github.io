---
id: US-DEVLOG-004
title: Put a teaser level inside a post
epic: EPIC-05-devlog
status: ready
priority: P2
size: M
depends_on: [US-DEVLOG-003, US-HOME-002]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/data/README.md", "02-reference/screens/README.md"]
---

# US-DEVLOG-004 — Put a teaser level inside a post

## 1. Story

**As a** reader
**I want** to play the level a post is about, in the post
**so that** the writing and the thing it describes are the same page.

## 2. Context

A post can name a game and level in its frontmatter; the post then renders the same `GameEmbed` the home page uses (US-HOME-002). The level id is validated against the game catalog at build time, so a renamed level cannot ship a broken embed.

**NFRs**: NFR-03, NFR-04

| Topic | Reference |
|-------|-----------|
| Data model | [README.md](../../02-reference/data/README.md) |
| Screens | [README.md](../../02-reference/screens/README.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | a post whose frontmatter names a game and level | it is opened | the embed container renders in place, with a load affordance |
| AC2 | the load affordance | it is activated | the named level opens playable, and solving it writes progress |
| AC3 | frontmatter naming a level that does not exist | the build runs | the build fails and names the post and the level |
| AC4 | a post with no teaser fields | it is opened | no embed container appears and nothing is fetched |
| AC5 | the embed | the remote fails | a named placeholder with a retry appears and the post stays readable |

## 4. Contract

Reuses `GameEmbed` with `levelId` from frontmatter. The catalog used for validation is the games registry from US-GAME-001.

## 5. Rules and edge cases

- One teaser per post — more than one is a build error.
- The teaser is optional; most posts will not have one.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Per-post numerical parameters or a level editor.

## 8. Test notes

Build-time validation tests over fixture frontmatter; a component test for the embed being lazily loaded.

## 9. Open questions

None.
