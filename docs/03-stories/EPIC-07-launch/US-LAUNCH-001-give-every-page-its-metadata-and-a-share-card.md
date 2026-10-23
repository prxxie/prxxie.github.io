---
id: US-LAUNCH-001
title: Give every page its metadata and a share card
epic: EPIC-07-launch
status: done
priority: P2
size: M
depends_on: [US-SITE-003]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/deployment.md", "04-decisions/adr/ADR-0002-prerendered-root-site.md"]
---

# US-LAUNCH-001 — Give every page its metadata and a share card

## 1. Story

**As a** visitor receiving a link
**I want** a preview that says what the page is before I open it
**so that** a shared link looks deliberate on social platforms and in search results.

## 2. Context

Prerendering gives each route its own document, so each can carry its own title, description, canonical URL, Open Graph and Twitter card tags. One generated image covers the site; posts and games reuse it with their own title.

**NFRs**: NFR-01

| Topic | Reference |
|-------|-----------|
| Deployment | [deployment.md](../../01-overview/deployment.md) |
| ADR-0002 | [ADR-0002-prerendered-root-site.md](../../04-decisions/adr/ADR-0002-prerendered-root-site.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | any route | its document is read | `<title>`, description, canonical, `og:*` and `twitter:*` are present and route-specific |
| AC2 | the canonical link | it is compared with the served URL | they match, with no trailing slash |
| AC3 | the share image | it is requested | it returns 200 with an absolute URL and a described `alt` |
| AC4 | a devlog post | its document is read | the title and description come from the post frontmatter |
| AC5 | a route added later | the build runs | it gets metadata from the route manifest without a code change |

## 4. Contract

Metadata is produced by the prerender step from the same route manifest plus the post collection; a route without a description fails the build.

## 5. Rules and edge cases

- One 1200×630 social image, generated at build time from the tokens — no stock imagery.
- Nothing that requires a third party embeds or tracks.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Per-post bespoke illustration.

## 8. Test notes

Build assertions over every generated HTML file; a manual preview check with a card validator.

## 9. Open questions

None.

## 10. Outcome

| # | Criterion | Where it is proven |
|---|-----------|--------------------|
| AC1 | `<title>`, description, canonical, `og:*`, `twitter:*` per route | `scripts/prerender-helpers.mjs` `metadata(page)`; `tests/prerender.test.ts` › share metadata |
| AC2 | canonical matches the served URL, no trailing slash | `canonicalUrl` in `scripts/prerender-helpers.mjs`; `tests/prerender.test.ts` › canonicalises |
| AC3 | the share image returns 200, absolute URL, described alt | `scripts/make-og-image.mjs` writes `public/og.png` (1200×630, copied into `dist/`); `SHARE_IMAGE` exports the alt |
| AC4 | a post describes itself from its frontmatter | `descriptionForPath` in `packages/shell/src/entry-server.tsx` returns `post.summary`; `titleForPath` returns `post.title` |
| AC5 | a route added later needs no code change | `metadata(page)` reads the rendered page only; `descriptionForPath` has a site fallback |

Notes: the share card is generated from tokens in code rather than by hand, and `build-static.sh` builds it before the shell, so it cannot go stale. A route with no description fails the build (`assertReadable`).
