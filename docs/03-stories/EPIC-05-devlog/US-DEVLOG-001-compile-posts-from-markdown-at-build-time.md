---
id: US-DEVLOG-001
title: Compile posts from markdown at build time
epic: EPIC-05-devlog
status: done
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

None — resolved before implementation.

## 10. Outcome

- Frontmatter parser and collection live in `packages/posts/src/content/loadPosts.ts`: `parsePost(source, file)` throws
  with the file and field named, `sortPosts` orders newest first with a stable tie-break on slug, `loadPosts()` is the
  only reader (an eager `import.meta.glob(..., { query: "?raw" })` at build time).
- Posts moved from `public/posts/` to `packages/posts/src/content/posts/`; the two legacy posts were migrated to the
  contract (`author`/`category` dropped, `summary` added) and slugs became file names (`hello-retro-world`,
  `markdown-verification`).
- `PostsApp` reads the collection instead of a hardcoded array, and no longer fetches markdown: the old `useQuery` +
  `fetch('./posts/…')` path and the duplicate `parsePost` in `packages/posts/src/utils/markdown.ts` are gone.
- AC2's build failure is enforced by the loader throwing at module scope; the deploy build executes it once the prerender
  step lands in US-SITE-003. Until then the vitest suite (`loadPosts.test.ts`, 10 tests) is the gate that fails on a bad
  post.
- Docs updated: `docs/01-overview/architecture.md` (source layout), `docs/01-overview/conventions.md` (content location +
  frontmatter), `docs/01-overview/roles-and-permissions.md`, `docs/02-reference/data/README.md`,
  `docs/02-reference/screens/devlog.md` (field table), `ADR-0006`.

None.
