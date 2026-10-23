---
id: ADR-0006
title: Treat devlog posts as markdown compiled at build time
status: accepted
date: 2026-06-14
supersedes: []
---

# ADR-0006 — Treat devlog posts as markdown compiled at build time

## Context

The posts MFE holds two complete posts as a hardcoded array (`packages/posts/src/PostsApp.tsx:29-36`) while also
fetching markdown from `public/posts/` at runtime through a hand-written converter
(`packages/posts/src/utils/markdown.ts`). Adding a post therefore means editing a component and redeploying, and the two
markdown files that do exist are reachable only through the runtime path. Prerendering needs one document per slug
(ADR-0002).

## Decision

Posts are markdown files under `public/posts/`, loaded eagerly at build time with `import.meta.glob` and `?raw`,
parsed and rendered during the build. The inline array, the runtime `fetch` and the hand-written Markdown converter are
deleted.

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| **Markdown compiled at build time** | A post is data, not code; every slug prerenders; no runtime parser shipped | Drafting needs a rebuild to preview |
| Keep the runtime fetch | Authoring without a rebuild | Contradicts prerendering, and the fetch path is already the unused one |
| Move to a headless CMS | Authoring in a browser | A backend and an account surface the project just removed (ADR-0004) |

## Consequences

- `packages/posts` keeps a single content path, and the markdown files become the source of truth.
- The syntax highlighter runs at build time, so `prismjs` stops shipping to the browser.
- Front matter defines title, date and slug; an invalid file fails the build rather than a page load.
