---
id: US-SITE-004
title: Make the real paths work on GitHub Pages
epic: EPIC-02-site-shell
status: done
priority: P0
size: M
depends_on: [US-SITE-003]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/deployment.md", "04-decisions/open-questions.md"]
---

# US-SITE-004 — Make the real paths work on GitHub Pages

## 1. Story

**As a** visitor following a shared link
**I want** a deep URL to return the right document instead of a 404 page
**so that** links to individual posts and games actually work when they land cold.

## 2. Context

GitHub Pages serves files, not routes: `/devlog/a-post` only works if `dist/devlog/a-post/index.html` exists. The prerender step produces those files; this story makes the hosting and the URLs agree — trailing slashes, the `404.html` fallback, and the absence of a base path, which the absolute remote URLs already assume (`packages/shell/vite.config.ts:27-32`).

**NFRs**: NFR-01

| Topic | Reference |
|-------|-----------|
| Deployment | [deployment.md](../../01-overview/deployment.md) |
| OQ-08 answer | [open-questions.md](../../04-decisions/open-questions.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the deployed site | `/devlog/<slug>` is opened directly | the prerendered document is served with status 200 |
| AC2 | the deployed site | `/devlog/<slug>/` (trailing slash) is opened | the same document is served — no duplicate 404 |
| AC3 | the deployed site | `/nope` is opened | the prerendered not-found document is served |
| AC4 | a deep link | its request is inspected | no redirect through `/index.html` is needed to render it |
| AC5 | the built HTML | an asset URL is read | it is absolute from the domain root, with no `base` prefix baked in |

## 4. Contract

URL shape: no trailing slash in the canonical form, `/path/index.html` on disk, canonical link pointing at the slash-less URL. The `/404.html` fallback is the prerendered not-found document.

## 5. Rules and edge cases

- GitHub Pages returns 404 status for the fallback file — acceptable, the document is what matters.
- No rewrite rules, no service worker and no redirect hack to fake clean URLs.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Custom domain or HTTPS configuration.

## 8. Test notes

Manual + scripted: `curl -I` each route and assert 200 and the expected title; check the fallback returns the not-found document.

## 9. Open questions

None.

## 10. Outcome

Commit `f219232`. `scripts/prerender.mjs` writes both `dist/<path>.html` and `dist/<path>/index.html`, `prerender-helpers.mjs` exports `SITE_ORIGIN`, `canonicalUrl`, `outputFiles` and `inject`, and `scripts/build-static.sh` writes `dist/.nojekyll`; the shell sets no `base`. Proven by `tests/prerender.test.ts`.
