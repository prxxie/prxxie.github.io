---
id: ADR-0002
title: Serve a prerendered multi-page site from the GitHub Pages user-site root
status: accepted
date: 2026-06-14
supersedes: []
---

# ADR-0002 — Serve a prerendered multi-page site from the GitHub Pages user-site root

## Context

The shell is a single-page app behind `useHashRouter` (`packages/shell/src/hooks/useHashRouter.ts:4-32`), published as a
project site with the `gh-pages` branch contents as the artifact (`.github/workflows/deploy.yml:48-52`). Hash URLs are
invisible to crawlers, carry no per-page metadata, and cannot be prerendered as separate documents. The brief requires
real routes with prerendered HTML, per-page title/description/OG tags, `sitemap.xml` and `robots.txt` (brief § 4, § 14),
served from `https://prxxie.github.io/` (OQ-08).

## Decision

The site becomes a multi-page prerendered artifact served from the user-site root: `/`, `/games`, `/games/<game>`,
`/devlog`, `/devlog/<slug>`. The build emits one HTML file per route with the shell chrome already in the markup, plus
`sitemap.xml` and `robots.txt`. Hash routing is deleted; a route that does not exist returns the host's 404 page.

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| **Prerendered multi-page on the user-site root** | Crawler-visible HTML, per-page metadata, real shareable URLs, no hash | Build gains a prerender step (OQ-12); deep links depend on the host serving the emitted files |
| Keep the hash-router SPA | No build change, no host constraints | Fails every SEO requirement in brief § 14; no per-page OG image |
| A static-site framework (Astro, Next export) | Prerendering for free | Replaces the federation host and the MFE contract the games already ship |
| Move to a project site under a sub-path | Nothing to rename | Breaks existing links and the `/mfe/<name>/` asset root the remotes are compiled against |

## Consequences

- `scripts/build-static.sh` grows a prerender step and an asset-copy step; the assembled `dist/` layout keeps
  `dist/mfe/<name>/` where the federation remotes already expect to be.
- The MFE `base` stays `/mfe/<name>/` (`packages/about/vite.config.ts:8`), so game assets keep resolving after the move
  to the root site.
- The repository rename to the user-site name is a one-off manual step outside the build.
