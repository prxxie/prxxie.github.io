---
id: ADR-0003
title: Keep Module Federation remotes with an independent release cycle per game
status: accepted
date: 2026-06-14
supersedes: []
---

# ADR-0003 — Keep Module Federation remotes with an independent release cycle per game

## Context

The shell resolves six remotes at runtime from `/mfe/<name>/assets/remoteEntry.js`
(`packages/shell/vite.config.ts:27-32`) and the three games are separate repositories mounted as submodules, each
publishing a `dist.tar.gz` release that the host build downloads (`.github/workflows/deploy.yml:31-40`). The games are
the engineering exhibit the portfolio rests on (brief § 4), and their release independence is part of that exhibit.

## Decision

Module Federation stays the integration mechanism, with per-game independent releases: a game repo's CI builds and
releases its own artifact, and this repository picks it up by download at build time or by submodule pointer bump. The
shell keeps owning routing, layout, progress and the design tokens; the games keep owning their engines, levels and
presentation.

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| **Federation remotes, per-game releases** | Games ship without redeploying the site; each repo proves its own CI; the mechanism itself is a talking point | Two build shapes (downloaded artifact vs submodule source), runtime failure modes need a fallback |
| Build every package in one repo and deploy one artifact | Simplest build, no runtime remote resolution | Collapses the three game repos into the monorepo and loses their independent CI history |
| npm-published packages consumed as dependencies | Versioned, testable | Games are React UI, not libraries; publishing them adds a registry step with no benefit to the exhibit |

## Consequences

- A remote that fails to load must degrade visibly rather than blank the page; the shell already has the pattern
  (`packages/shell/src/App.tsx:15-67`).
- Prerendering cannot include a game's own DOM (ADR-0002, OQ-12): only the shell chrome and the container are rendered
  ahead of time.
- Restyling a game is three pull requests, three releases and three pointer bumps (OQ-11).
