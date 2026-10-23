---
id: US-DEVLOG-003
title: Give each post its own page
epic: EPIC-05-devlog
status: done
priority: P1
size: M
depends_on: [US-DEVLOG-001, US-SITE-003]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/screens/README.md", "04-decisions/adr/ADR-0002-prerendered-root-site.md", "02-reference/design-system.md"]
---

# US-DEVLOG-003 — Give each post its own page

## 1. Story

**As a** visitor
**I want** a post at a stable URL with readable typography and a way to the next one
**so that** I can read a post and share it.

## 2. Context

`/devlog/:slug` is one prerendered document per post. It carries the post title, date, body, previous/next navigation and an honest not-found for an unknown slug.

**NFRs**: NFR-01, NFR-12

| Topic | Reference |
|-------|-----------|
| Screens | [README.md](../../02-reference/screens/README.md) |
| ADR-0002 | [ADR-0002-prerendered-root-site.md](../../04-decisions/adr/ADR-0002-prerendered-root-site.md) |
| Design system | [design-system.md](../../02-reference/design-system.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | a post URL | it is opened directly | the prerendered document for that post is served with its title in `<title>` and an `h1` |
| AC2 | a post | it is read | headings, links, lists, code blocks and inline code render with the shared type scale |
| AC3 | an unknown slug | it is opened | the not-found screen renders with a link back to the index |
| AC4 | a post | the previous/next links are used | they move to the adjacent posts in date order, and the first/last post hides the missing direction |
| AC5 | a post | it is loaded with JavaScript disabled | the body text and links are readable |

## 4. Contract

The route resolves the slug against the build-time collection; a miss renders the shared not-found component. Code blocks use the display mono face and are not syntax-highlighted at runtime.

## 5. Rules and edge cases

- No runtime markdown parsing: the body is compiled during the build.
- Anchor ids are generated at build time so a heading link survives.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Comments or share buttons.

## 8. Test notes

Router test for known and unknown slugs; a prerender assertion per post URL; a snapshot of the rendered markdown fixture.

## 9. Open questions

None.

## 10. Outcome

Commit `6d10162`. `packages/shell/src/screens/DevlogPost.tsx` renders one post at `/devlog/:slug`: title, date, summary and the compiled body; `renderPostBody` demotes the body `h1` to `h2`, adds slug ids to headings and labels GFM task-list inputs, so the page keeps one `h1` and the a11y gate passes. Proven by `packages/shell/src/screens/devlog.test.tsx` and the gate run.
