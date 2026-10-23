---
id: US-DEVLOG-002
title: List the posts
epic: EPIC-05-devlog
status: done
priority: P1
size: M
depends_on: [US-DEVLOG-001, US-SITE-003]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/screens/README.md", "04-decisions/adr/ADR-0002-prerendered-root-site.md"]
---

# US-DEVLOG-002 — List the posts

## 1. Story

**As a** visitor
**I want** a devlog index that lists the posts newest first with a reason to open each one
**so that** I can see what has been written without scrolling a wall of titles.

## 2. Context

`/devlog` replaces the posts tab. It is prerendered from the collection built in US-DEVLOG-001 and must hold up with one post and with none.

**NFRs**: NFR-01, NFR-15

| Topic | Reference |
|-------|-----------|
| Screens | [README.md](../../02-reference/screens/README.md) |
| ADR-0002 | [ADR-0002-prerendered-root-site.md](../../04-decisions/adr/ADR-0002-prerendered-root-site.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | `/devlog` | it is prerendered | every published post appears as a link with its title, date and summary |
| AC2 | the list | it is read | the newest post is first and the order does not depend on the filesystem |
| AC3 | the collection | it has one post | the page renders normally with no empty-state styling leaking |
| AC4 | the collection | it is empty | an honest empty state renders and the page still has its heading |
| AC5 | a post entry | it is reached by keyboard | the whole card is one link with a visible focus ring |
| AC6 | the index | it is loaded with JavaScript disabled | all entries and their links are present |

## 4. Contract

The index renders the same `Post[]` the post page loads; no second source of truth, no client-side sort.

## 5. Rules and edge cases

- Dates render in one fixed format (`YYYY-MM-DD`) — no `Intl` negotiation.
- Reading time, if shown, is computed from the body length at build time.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Tag filters, search or pagination.

## 8. Test notes

Component tests for zero/one/many posts; a prerender assertion that every post appears in the built HTML.

## 9. Open questions

None.

## 10. Outcome

Commit `4d4bb81`. `packages/shell/src/screens/DevlogIndex.tsx` renders `loadPosts()` newest first; each entry is one link with its title, date and summary; `docs/02-reference/screens/devlog-index.md` describes it. Proven by `packages/shell/src/screens/devlog.test.tsx`.
