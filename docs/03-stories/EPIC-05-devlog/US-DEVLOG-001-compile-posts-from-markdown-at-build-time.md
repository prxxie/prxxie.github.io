---
id: US-DEVLOG-001
title: Compile posts from markdown at build time
epic: EPIC-05-devlog
status: ready
priority: P1
size: M
depends_on: [US-FND-001]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/data/README.md", "04-decisions/open-questions.md", "01-overview/architecture.md"]
---

# US-DEVLOG-001 — Compile posts from markdown at build time

## 1. Story

**As a** owner-developer
**I want** to add a post by writing one markdown file
**so that** publishing is a file, not a code change.

## 2. Context

Today posts are two hardcoded entries in an array plus a runtime `fetch` of markdown from `public/posts/` (`packages/posts/src/PostsApp.tsx:29-36`, files under `public/posts/`). OQ-10 fixed the intent: markdown compiled at build time with `import.meta.glob({ eager: true })` and a validated frontmatter contract. This story builds that pipeline and migrates the two existing posts into it.

**NFRs**: NFR-01, NFR-16

| Topic | Reference |
|-------|-----------|
| Data model | [README.md](../../02-reference/data/README.md) |
| OQ-10 answer | [open-questions.md](../../04-decisions/open-questions.md) |
| Architecture | [architecture.md](../../01-overview/architecture.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | a post file with valid frontmatter | the site is built | the post appears in the typed collection with its title, date, slug and teaser fields |
| AC2 | a post file missing `title` or `date` | the build runs | it fails and names the file and the missing field |
| AC3 | a file with an unknown frontmatter key | the build runs | it fails rather than silently ignoring the key |
| AC4 | the collection | it is read | posts are ordered newest first and the date format is the single fixed one |
| AC5 | the two existing posts | the build runs | both are in the collection and the hardcoded array and the runtime fetcher are gone |
| AC6 | the site | a post is opened with JavaScript disabled | its text is in the prerendered document |

## 4. Contract

Frontmatter contract: `title` (string), `date` (`YYYY-MM-DD`), `summary` (string), `teaserGame` and `teaserLevel` (optional strings). Body is markdown. The producer is a `loadPosts()` module returning `Post[]` sorted newest first; it is the only place that reads the filesystem.

## 5. Rules and edge cases

- Validation is at build time and fails the build — a broken post never ships.
- No markdown at runtime, no `fetch` of content, no inline HTML in posts.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Rendering the post pages — US-DEVLOG-003.

## 8. Test notes

Unit tests over fixture files: valid set sorts correctly, invalid files throw with file and field named, unknown keys throw.

## 9. Open questions

None.
