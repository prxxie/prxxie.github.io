---
id: US-SITE-001
title: Replace the hash router with real routes
epic: EPIC-02-site-shell
status: done
priority: P0
size: L
depends_on: [US-FND-001]
open_questions: []
accepted_assumptions: []
refs: ["04-decisions/adr/ADR-0009-router-and-prerender-toolchain.md", "02-reference/screens/README.md", "01-overview/architecture.md"]
---

# US-SITE-001 — Replace the hash router with real routes

## 1. Story

**As a** visitor
**I want** each page to have its own URL that can be shared, bookmarked and prerendered
**so that** a link I send someone opens the page it names.

## 2. Context

Routing today is a `switch` over six tab strings in `packages/shell/src/App.tsx:138-151` driven by `window.location.hash` (`packages/shell/src/hooks/useHashRouter.ts:4-32`). No router dependency exists. ADR-0009 and the OQ-12 answer fix the choice: React Router 7 in `createStaticHandler` mode, so the same route tree can be rendered on the server side of the build and in the browser.

**NFRs**: NFR-01, NFR-21

| Topic | Reference |
|-------|-----------|
| ADR-0009 | [ADR-0009-router-and-prerender-toolchain.md](../../04-decisions/adr/ADR-0009-router-and-prerender-toolchain.md) |
| Screens | [README.md](../../02-reference/screens/README.md) |
| Architecture | [architecture.md](../../01-overview/architecture.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the site | `/devlog/some-post` is opened directly | the devlog post route renders, not the home page |
| AC2 | the site | an unknown path such as `/nope` is opened | the not-found screen renders with links to home, games and devlog |
| AC3 | any page | its URL is copied and opened in a new tab | the same route renders from the URL alone — no hash fragment involved |
| AC4 | the route tree | it is read | it declares `/`, `/games`, `/games/:game`, `/devlog`, `/devlog/:slug` and a catch-all |
| AC5 | the old hash URLs used by the current site | they are opened | they are handled by US-SITE-005, not by a redirect loop |
| AC6 | the shell bundle | dependencies are read | exactly one routing dependency is added, and the `useHashRouter` hook is deleted |

## 4. Contract

A single route table is the source of truth, exported so the prerender step can enumerate it: `{ path, element, prerender: boolean }` per route, with `/games/:game` and `/devlog/:slug` expanded at build time from the game registry and the post collection.

## 5. Rules and edge cases

- The catch-all route is a real screen, not a redirect — a 404 is prerendered as its own document.
- Route change must move focus to the main landmark and reset scroll (AC of US-SITE-002, not here).

## 6. Implementation notes

**Shipped.** One routing dependency, `react-router@7`, and one route table: `packages/shell/src/routes.tsx` exports
`createAppRoutes()` (a `RouteObject[]` tree, layout route plus `index`, `games`, `games/:game`, `devlog`,
`devlog/:slug`, `*`) and `prerenderPaths(postSlugs)` which is the list US-SITE-003 enumerates. `App.tsx` is now
providers plus `createBrowserRouter`, `AppShell.tsx` holds the chrome and renders an `Outlet`, and `screens/` holds one
component per route. The catch-all is a real screen with links to home, games and devlog; an unknown game slug explains
itself instead of blanking. `useHashRouter` and its test are deleted.

**Note for US-SITE-005.** Old `#/about` and `#/posts` links now land on the catch-all, because no route claims them yet.
The redirect story should turn them into `/devlog` and `/` before the site goes live.

**Note for US-SITE-002.** Focus does not yet move to the main landmark on a route change — that is the accessibility
story's acceptance criterion, not this one.

- No special constraints.

## 7. Out of scope

- Writing the page content for any route.

## 8. Test notes

Router tests in memory (no browser): each path resolves to the expected element; an unknown path resolves to the catch-all.

## 9. Open questions

None.
