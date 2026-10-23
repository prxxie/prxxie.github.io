---
id: ADR-0005
title: Standardise on pnpm workspaces with one frozen lockfile
status: accepted
date: 2026-06-14
supersedes: []
---

# ADR-0005 — Standardise on pnpm workspaces with one frozen lockfile

## Context

The repository is an npm-workspaces monorepo (`package.json` declares `workspaces: ["packages/*"]`) whose committed
lockfile is pnpm's (`pnpm-lock.yaml`), while both CI workflows install with `npm install`
(`.github/workflows/deploy.yml:29`, `packages/sokoban/.github/workflows/build.yml:42`). The workspace dependency
`"shared": "*"` resolves to the local link or to the unrelated published `shared@0.2.0` package depending on which
client resolves it, which is the origin of the type and lint noise. The interview made pnpm canonical (OQ-06).

## Decision

pnpm is the only package manager and `pnpm-lock.yaml` the only lockfile. Every internal dependency is declared
`workspace:*`, installs run `pnpm install --frozen-lockfile`, and CI stops calling `npm install`.

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| **pnpm everywhere, frozen lockfile** | One resolver, deterministic CI, `workspace:*` makes the local link explicit | Every script and workflow must be rewritten; contributors need pnpm installed |
| npm everywhere, commit `package-lock.json` | Uses the tooling the scripts already call | npm's hoisting made the published `shared` package resolvable, which is the bug being fixed |
| Leave both, document one | No churn | The mismatch reproduces on the next CI run |

## Consequences

- `"shared": "*"` becomes `"shared": "workspace:*"` in the shell and the three game manifests; the published
  `shared@0.2.0` package can no longer resolve.
- `scripts/build-static.sh` calls `npm run build -w …` throughout and has to move to `pnpm -F`, together with both CI
  workflows.
- Contributors with a stale `node_modules` need one clean `pnpm install`.
