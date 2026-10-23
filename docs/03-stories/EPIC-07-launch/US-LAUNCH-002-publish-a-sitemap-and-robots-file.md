---
id: US-LAUNCH-002
title: Publish a sitemap and robots file
epic: EPIC-07-launch
status: done
priority: P2
size: S
depends_on: [US-LAUNCH-001]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/deployment.md"]
---

# US-LAUNCH-002 — Publish a sitemap and robots file

## 1. Story

**As a** search engine
**I want** a sitemap and a robots file that match the published routes
**so that** the site is indexed by page instead of by the home page alone.

## 2. Context

Both files are derivable from the route manifest, so they are generated rather than maintained, and a stale entry cannot survive a route removal.

| Topic | Reference |
|-------|-----------|
| Deployment | [deployment.md](../../01-overview/deployment.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | a build | it finishes | `dist/sitemap.xml` lists every prerendered route with an absolute URL |
| AC2 | a route that is removed | the build runs | it disappears from the sitemap |
| AC3 | `robots.txt` | it is read | it allows crawling and points at the sitemap |
| AC4 | the sitemap | it is validated | it parses and every URL returns 200 on the deployed site |

## 4. Contract

Both files come from `dist/route-manifest.json`; no hand-written URL appears in either.

## 5. Rules and edge cases

- Exclude nothing from crawling — the site is the advertisement.
- Absolute URLs use the user-site origin (US-FND-007).

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Hreflang or alternate locales (NFR-16: English only).

## 8. Test notes

Build assertion on the file contents plus a validator run against the deployed site.

## 9. Open questions

None.

## 10. Outcome

`scripts/prerender-helpers.mjs` gains `sitemap(routes)` and `robotsTxt()`; `scripts/prerender.mjs` writes `dist/sitemap.xml` and `dist/robots.txt` from the same manifest the pages were rendered from, excluding `/404` from both. Proven by `tests/prerender.test.ts` › the crawl surface (canonical URLs, one entry per route, well-formed XML, 404 exclusion, sitemap pointer).
