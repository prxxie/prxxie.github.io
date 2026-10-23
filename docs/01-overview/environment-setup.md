# Environment setup

## Prerequisites

| Tool | Version | Why that version |
|------|---------|------------------|
| Node.js | 20.x and up | the deploy workflow runs 20 (`.github/workflows/deploy.yml:26-31`); the tree also builds on 22 |
| pnpm | 10.x | the canonical package manager (ADR-0005), pinned by `packageManager: pnpm@10.33.0` — a wrong major fails at install |
| git | any recent | the three game packages are git submodules |

No global CLI, database, container runtime or cloud account is needed: the product is a static artifact and its only
storage is the browser's.

## Get the code

The three game packages are submodules, so a plain clone leaves three empty directories and the build fails on them.

```bash
git clone --recurse-submodules <repo-url> prxxie-home
cd prxxie-home
```

If you already cloned without the flag:

```bash
git submodule update --init --recursive
```

Submodule pointers currently resolve to build-branch commits (`git submodule status`); a game package builds from that
checkout, and the deploy workflow instead downloads each game's released `dist.tar.gz` (`.github/workflows/deploy.yml:31-40`).

## Install

```bash
pnpm install --frozen-lockfile
```

Verified: pnpm 10.33.0 resolves all nine workspace projects from the single root `pnpm-lock.yaml` and links `shared`
as `workspace:*`. There is one lockfile and no per-package one; npm's hoisting of the unrelated published `shared@0.2.0`
package is what the old tree resolved against, and it is gone with this setup. The deploy workflow runs the same
command (`.github/workflows/deploy.yml:33`).

## Run locally

The host never proxies a remote's dev server: it mounts each package's built `dist/` at `/mfe/<name>/` through a dev-only
sirv middleware (`packages/shell/vite.config.ts:36-45`). A stable local run therefore needs the remotes built before the
host starts, which `dev` arranges by running a `vite build --watch` per package beside the host.

```bash
pnpm dev   # shell on :3000 + a watch build for each of the six remotes
```

Verified: `pnpm dev` starts the host and six `vite build --watch` processes under `concurrently`.

| Server | Port | Command |
|--------|------|---------|
| shell (host) | 3000 | `pnpm -F shell dev` |
| about | 3001 | `pnpm -F about dev` |
| posts | 3002 | `pnpm -F posts dev` |
| pets | 3003 | `pnpm -F pets dev` |
| shikaku | 3004 | `pnpm -F shikaku dev` |
| sokoban | 3005 | `pnpm -F sokoban dev` |
| slitherlink | 3006 | `pnpm -F slitherlink dev` |

All seven use `--strictPort`, so a busy port fails loudly instead of drifting: a port already in use means another
instance is still running. Opening `http://localhost:3000` shows the host; opening a remote's own port shows that remote
in isolation, which is the fastest way to work on one game.

The first run of a remote's watch build takes a few seconds; until `packages/<name>/dist/assets/remoteEntry.js` exists the
host renders its `Fallback` naming that remote as offline.

## Test and check

| Purpose | Command | Baseline on this tree |
|---------|---------|----------------------|
| Unit and component tests | `pnpm test` → `vitest run` | 37 files, 301 tests, all passing |
| Lint | `pnpm lint` → `eslint .` | green: 0 errors, 0 warnings |
| Type check | `pnpm typecheck` → `tsc --noEmit` | fails: one error, `packages/pets/src/PetsApp.tsx(91,20): error TS2769` |
| Single test file | `pnpm exec vitest run packages/shared/src/pet/evolution.test.ts` | passes |

The type-check gate is the baseline the rework has to turn green: the site's claim is that its engineering is
checkable (NFR-18), so a red gate is a product defect, not a chore. The remotes are aliased to
`packages/shell/src/components/MockMfe.tsx` under test (`vitest.config.ts:12-35`), which is why the whole suite runs
without a browser or a running federation host.

## Common problems

| Symptom | Cause | Fix |
|---------|-------|-----|
| `⚠ MFE LOAD ERROR — Remote 'X' is offline` | `packages/X/dist` is missing or stale, so the sirv mount has nothing to serve | run the remote's watch build (or a full build) and reload |
| Type errors mentioning `bson`, `mongodb` or `shared` internals | an install left over from npm, which resolved the published `shared@0.2.0` instead of the workspace link | `rm -rf node_modules packages/*/node_modules && pnpm install --frozen-lockfile` |
| `Port 3000 is already in use` | `--strictPort` on a previous instance | stop the other process; ports are fixed by design |
| Submodule directories are empty | cloned without `--recurse-submodules` | `git submodule update --init --recursive` |
| A game's behaviour differs from the deployed site | the local checkout builds the submodule commit, the deploy downloads the latest release | compare `git submodule status` with the game repository's latest release |
| Pet looks reset | progress is per browser profile and origin | clear site data resets it deliberately; a different port is a different origin |
