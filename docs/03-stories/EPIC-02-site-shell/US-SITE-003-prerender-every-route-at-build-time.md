---
id: US-SITE-003
title: Prerender every route at build time
epic: EPIC-02-site-shell
status: done
priority: P0
size: L
depends_on: [US-SITE-001, US-SITE-002]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/deployment.md", "01-overview/architecture.md", "04-decisions/adr/ADR-0002-prerendered-root-site.md", "04-decisions/adr/ADR-0009-router-and-prerender-toolchain.md"]
---

# US-SITE-003 — Prerender every route at build time

## 1. Story

**As a** visitor arriving from a link
**I want** the page text to be in the HTML before any script runs
**so that** the page is readable while the scripts load, and a crawler sees the same text.

## 2. Context

The build produces one SPA shell: `scripts/build-static.sh` copies the shell `dist/` and the six remotes into one artifact, and every route is rendered client-side. ADR-0002 and NFR-01 require one HTML document per route, produced by a Vite SSR prerender step in that same script.

**NFRs**: NFR-01, NFR-21, NFR-22

| Topic | Reference |
|-------|-----------|
| Deployment | [deployment.md](../../01-overview/deployment.md) |
| Architecture | [architecture.md](../../01-overview/architecture.md) |
| ADR-0002 | [ADR-0002-prerendered-root-site.md](../../04-decisions/adr/ADR-0002-prerendered-root-site.md) |
| ADR-0009 | [ADR-0009-router-and-prerender-toolchain.md](../../04-decisions/adr/ADR-0009-router-and-prerender-toolchain.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the assembled artifact | `dist/` is listed | it contains one HTML file per route, including the expanded game and post routes |
| AC2 | a prerendered document | it is fetched with JavaScript disabled | its headline, its main text and its links are readable |
| AC3 | a prerendered document | its `<title>` and `<main>` are read | they match the route, not the home page |
| AC4 | a game route | its prerendered document is read | it contains the game container and the loading placeholder, never a game board |
| AC5 | a route whose data is missing | the build runs | the build fails with the route named, instead of emitting an empty document |
| AC6 | the build script | its steps are read | the prerender step runs after the remotes are assembled and before publish |

## 4. Contract

`scripts/prerender.mjs` renders each entry of the route manifest through `createStaticHandler` into `dist/<path>/index.html` and writes `dist/route-manifest.json` — the same manifest the accessibility gate (US-FND-006) and the sitemap (US-LAUNCH-002) consume.

## 5. Rules and edge cases

- Prerender runs with the remotes absent: a game container must render a placeholder, never attempt a fetch.
- Copying the SPA shell to every path is not prerendering — the HTML must contain rendered output.
- Keep the manifest in the artifact; it is the contract other build steps read.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Server-side rendering at request time — there is no server.
- Prerendering a game board.

## 8. Test notes

Build-level test: run the build and assert one HTML file per manifest entry, each containing the expected `<h1>`; assert the build fails when a manifest entry has no renderer.

## 9. Open questions

None.

## 9. Outcome

Shipped on `feat/US-SITE-003-prerender`. The renderer is `packages/shell/src/entry-server.tsx`, built by
`packages/shell/vite.ssr.config.ts` and driven by `scripts/prerender.mjs`, which `scripts/build-static.sh` calls after
the remotes are copied and before anything is published (AC6; `tests/prerender.test.ts` asserts the ordering and `set -e`).

- AC1: nine documents are emitted — `/`, `/games`, the three `/games/<slug>`, `/devlog`, the two `/devlog/<slug>` and
  `/404` (as `dist/404.html`) — plus `dist/route-manifest.json`, the manifest US-FND-006 and US-LAUNCH-002 read.
- AC2: the markup is real React output, not a copy of the SPA shell, so headline, copy and links are in the document.
  The devlog routes carry a placeholder headline and one sentence until US-DEVLOG-002/003 render the real content.
- AC3: `titleForPath` gives every route its own `<title>` (`Sokoban — prxxie.dev`, `hello-retro-world — Devlog —
  prxxie.dev`) and the `<main id="main">` region is rendered.
- AC4: the SSR build has no federation plugin; remote imports are aliased to `screens/game/RemoteStub.tsx` and
  `GameRoute` answers `import.meta.env.SSR` with `GamePlaceholder` — container plus loading sentence, never a board.
  `AppShell` renders a sentence where the pet remote goes, so no Suspense boundary is left unfinished.
- AC5: `assertReadable` fails the build with the route named when a document has no title, no `<main>`, no `<h1>`, an
  unfinished Suspense boundary, a rendered board or under 800 bytes of markup.

Tests: `packages/shell/src/entry-server.test.tsx` (5, renderer) and `tests/prerender.test.ts` (7, paths, injection,
failure naming, build-script ordering).
