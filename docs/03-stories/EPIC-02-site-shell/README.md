---
id: EPIC-02-site-shell
code: SITE
title: Real routes, prerendered pages, one contact path
---

# EPIC-02 — Real routes, prerendered pages, one contact path

The hash router is replaced by real paths, every route is prerendered at build time, and the shell grows the regions every page needs: a three-item nav, a footer, a skip link, a 404 and an error boundary. This is the epic that makes the site quotable — a link to `/devlog/a-post` is a document, not a fragment of the home page.

## Goal

Opening any published URL returns a prerendered HTML document for that page, with the right title, the shell chrome already drawn, working deep links on GitHub Pages, and a legacy hash URL that lands on the same content.

## Stories

Generated from story frontmatter — run `python3 .agents/scripts/verify-docs.py --fix`; do not edit by hand.

<!-- adf:epic-stories -->
| Id | Title | Priority | Size | Status | Depends on |
|---|---|---|---|---|---|
| [US-SITE-001](US-SITE-001-replace-the-hash-router-with-real-routes.md) | Replace the hash router with real routes | P0 | L | done | US-FND-001 |
| [US-SITE-002](US-SITE-002-give-the-shell-its-regions-and-its-failure-states.md) | Give the shell its regions and its failure states | P0 | M | done | US-SITE-001 |
| [US-SITE-003](US-SITE-003-prerender-every-route-at-build-time.md) | Prerender every route at build time | P0 | L | ready | US-SITE-001, US-SITE-002 |
| [US-SITE-004](US-SITE-004-make-the-real-paths-work-on-github-pages.md) | Make the real paths work on GitHub Pages | P0 | M | ready | US-SITE-003 |
| [US-SITE-005](US-SITE-005-land-the-old-hash-links-on-their-pages.md) | Land the old hash links on their pages | P2 | S | ready | US-SITE-001 |
| [US-SITE-006](US-SITE-006-offer-a-contact-path-with-no-backend.md) | Offer a contact path with no backend | P1 | S | ready | US-SITE-002 |
<!-- /adf:epic-stories -->

## Out of scope

- Page content — HOME, GAMES and DEVLOG fill these routes.
- Search, pagination and any server-side rendering of a game board.
