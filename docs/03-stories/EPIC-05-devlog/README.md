---
id: EPIC-05-devlog
code: DEVLOG
title: Markdown compiled at build time
---

# EPIC-05 — Markdown compiled at build time

The two hand-mounted posts become a real content pipeline: markdown files with validated frontmatter, compiled into typed objects at build time, published as prerendered index and post pages, with an optional playable teaser level inside a post.

## Goal

Writing a post is adding one markdown file; publishing it produces a prerendered page at its own URL with the right metadata, and the index lists it in order without a rebuild of anything else.

## Stories

Generated from story frontmatter — run `python3 .agents/scripts/verify-docs.py --fix`; do not edit by hand.

<!-- adf:epic-stories -->
| Id | Title | Priority | Size | Status | Depends on |
|---|---|---|---|---|---|
| [US-DEVLOG-001](US-DEVLOG-001-compile-posts-from-markdown-at-build-time.md) | Compile posts from markdown at build time | P1 | M | done | US-FND-001 |
| [US-DEVLOG-002](US-DEVLOG-002-list-the-posts.md) | List the posts | P1 | M | ready | US-DEVLOG-001, US-SITE-003 |
| [US-DEVLOG-003](US-DEVLOG-003-give-each-post-its-own-page.md) | Give each post its own page | P1 | M | ready | US-DEVLOG-001, US-SITE-003 |
| [US-DEVLOG-004](US-DEVLOG-004-put-a-teaser-level-inside-a-post.md) | Put a teaser level inside a post | P2 | M | ready | US-DEVLOG-003, US-HOME-002 |
<!-- /adf:epic-stories -->

## Out of scope

- Comments, reactions, tags pages or an RSS feed.
- An authoring UI or a CMS.
