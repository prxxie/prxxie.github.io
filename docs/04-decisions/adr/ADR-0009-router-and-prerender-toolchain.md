---
id: ADR-0009
title: Route and prerender with React Router 7 plus a Vite SSR prerender step
status: accepted
date: 2026-06-14
supersedes: []
---

# ADR-0009 — Route and prerender with React Router 7 plus a Vite SSR prerender step

## Context

Real paths with prerendered HTML (ADR-0002) need a routing layer and a build step the repository has never had: the
shell has no router dependency and switches on a hash (`packages/shell/src/hooks/useHashRouter.ts:4-32`,
`packages/shell/src/App.tsx:138-151`). Module Federation limits what can be prerendered, because remotes are fetched at
runtime from `/mfe/<name>/assets/remoteEntry.js` (`packages/shell/vite.config.ts:27-32`). The choice is open as OQ-12;
this record states the working assumption the doc set uses until it is answered.

## Decision

React Router 7 supplies routing, run in static-handler mode so the same route table drives both the browser and the
build, and `scripts/build-static.sh` gains a prerender step that renders each route to an HTML file before the
assembly step.

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| **React Router 7 in static-handler mode** | One dependency, one route table for both environments, fits the existing build script | The prerender step is ours to maintain |
| TanStack Router with file-based generation | Typed routes, generated tree | The same maintenance with a larger API surface for six routes |
| Vike | Routing, SSR and prerendering out of the box | Owns the app shell, which conflicts with the federation host |
| Hand-rolled router plus headless-browser post-render | No dependency | Needs a browser in CI and gives no route table for the prerender |

## Consequences

- The prerender step must tolerate remotes that are not loaded at build time: it renders the shell chrome and a
  placeholder container per route, and the remote hydrates client-side.
- `/devlog/<slug>` enumeration comes from the markdown files (ADR-0006), so the prerender reads the same content the
  posts MFE does.
- Answering OQ-12 either confirms this record or supersedes it.
