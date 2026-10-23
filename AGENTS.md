# AGENTS.md — Cozy OS Architecture Guide

> Keep this file up to date. If you add, remove, or restructure a package or change how MFEs are wired, update the relevant section before ending your session.

<!-- adf:project:start -->
## Project

| | |
|---|---|
| Name | prxxie-home ("Cozy OS") |
| Tier | `standard` |
| Project type | `web-app` |
| Stack | TypeScript 5.9 · React 18 · Vite 5 · Tailwind 4 + daisyUI 5 · Zustand · Module Federation (`@originjs/vite-plugin-federation` 1.3.5) · Vitest 1 · GitHub Actions → GitHub Pages |
| Stack pack | `adf-stack-react-vite` — its PROJECT values are used where they match this repo; deviations are recorded in `docs/01-overview/conventions.md` |
| Docs | `docs/README.md` — start there. `docs/00-source/brief.md` is the scope authority; `docs/04-decisions/` holds the ADRs and the open questions |

**Commands** (run in this tree)

| Purpose | Command | State |
|---------|---------|-------|
| Install | `pnpm install --frozen-lockfile` | verified: pnpm 10.33.0 pinned by `packageManager`, one lockfile at the root, `shared` linked as `workspace:*` |
| Run | `pnpm dev` | verified: host on `:3000` plus a watch build per remote, `:3001`–`:3006` |
| Test | `pnpm test` → `vitest run` | 49 files, 345 tests, green |
| Lint | `pnpm run lint` → `eslint . --max-warnings=0` | green: 0 problems; warnings fail the gate |
| Type check | `pnpm run typecheck` → `tsc --noEmit` | green: 0 errors |
| Build | `pnpm run build:static` | verified: creates the share card, measures the gate figures, assembles `dist/` from the host and six remotes, prerenders nine routes, writes the sitemap, then runs the accessibility gate |
| A11y gate | `pnpm run a11y` | verified: axe-core over every prerendered route plus 21 contrast pairs, no findings |

**Layout**

```
packages/shell      host: the route table, the layout regions, the screens, the pet store, and every
                    design token (src/index.css). Prerender entry: src/entry-server.tsx
packages/about      MFE: about page
packages/posts      MFE: devlog (markdown compiled at build time)
packages/pets       MFE: the pet display, receives shell state as props (US-PET-001 moves it into the shell)
packages/shikaku    MFE: Shikaku puzzle          [git submodule, own repo and release]
packages/sokoban    MFE: Sokoban puzzle          [git submodule, own repo and release]
packages/slitherlink MFE: Slitherlink puzzle     [git submodule, own repo and release]
packages/shared     ProgressService, ProgressRepository + local adaptor, evolution thresholds
packages/posts/src/content/posts/   the devlog's markdown, compiled at build time by import.meta.glob
public/             the share card (og.png, drawn by scripts/make-og-image.mjs)
scripts/            build-static.sh, prerender.mjs, prerender-helpers.mjs, a11y-gate.mjs, build-facts.mjs, make-og-image.mjs
tests/              repo-level checks: prerender, gate wiring, workflow shape, token and typeface rules
```

**Conventions** (full detail in `docs/01-overview/conventions.md`)

- Design: cream + coral tokens only, one coral action per view, no raw hex in a component, no `text-cozy-*`/`font-press`.
- Progress: only `ProgressRepository` touches storage; remotes receive behaviour, never `localStorage`.
- Remotes: `./XxxApp` exposed, `base: '/mfe/<name>/'`, `react`/`react-dom` shared as singletons.
- Content: markdown and copy are build inputs, never fetched at runtime.
- Tests: beside the source; remotes are aliased to `packages/shell/src/components/MockMfe.tsx`.
- Never add an account, a cloud call, an analytics event or a cookie banner (ADR-0004, ADR-0007).
- Accessibility is built in, not audited in: WCAG 2.2 AA, an automated gate in CI (ADR-0008).

<!-- adf:project:end -->

---

## Routes

The shell owns one route table (`packages/shell/src/routes.tsx`) shared by the browser and the build:

| Path | Screen | Source |
|------|--------|--------|
| `/` | the proof page: headline, what I build, a playable puzzle, the measured proof, contact | `screens/HomePage.tsx` |
| `/games` | the games hub | `screens/GamesHub.tsx` |
| `/games/:slug` | one game, loaded as a Module Federation remote | `screens/GameRoute.tsx` |
| `/devlog` | every post, newest first | `screens/DevlogIndex.tsx` |
| `/devlog/:slug` | one post | `screens/DevlogPost.tsx` |
| anything else | not found | `screens/NotFound.tsx` |

`prerenderPaths(postSlugs)` is the crawl surface: the build renders each entry through
`createStaticHandler` (`src/entry-server.tsx`), so the prerendered document and the hydrated app cannot disagree.
Old hash links (`#posts`, `#pets`, a game tab) are redirected to their new paths by `hooks/useLegacyHashRedirect.ts`.

## Design tokens

One system, cream canvas and coral action (ADR-0001). Every value lives in the `@theme` block of
`packages/shell/src/index.css`: 18 colours, 6 radii, 3 typefaces. Components use the Tailwind utilities those tokens
generate (`bg-canvas`, `text-ink`, `border-hairline`, `font-display`, `text-primary`), never a raw hex, and the shared
recipes are `.panel`, `.panel-dark`, `.panel-header`, `.panel-body`, `.btn`, `.btn-primary`.
`tests/design-tokens.test.ts` fails on a legacy class (`text-cozy-*`, `font-press`, `retro-window`, `pixel-*`), an amber
hex, or a token no file consumes. The stack pack's daisyUI deviation is recorded in `docs/01-overview/conventions.md`.
Typefaces are self-hosted through Fontsource (`src/fonts.ts`), 8 weights, no third-party font origin.

## Pet and progress

Progress is local only (ADR-0004): `ProgressService` over `LocalProgressRepository`, persisted at
`localStorage["cozyos.progress.v1"]`. `ProgressState` is `{ completedLevels, foodConsumed, pet }`; `PetState` carries
`xp`, `stage`, `happiness`, `isSleeping` and the last feed/play timestamps. Feeding spends one star, earns one XP, and is
rate-limited by a 10-minute cooldown; happiness decays 5 per cooldown; `EVOLUTION_THRESHOLDS = [0, 10, 30, 60, 100]`
map XP to stages 1–5. Game remotes report a win as a `cozyos:progress-updated` event; the shell listens and updates the
store. There is no backend, no account and no cloud sync.

## Module Federation

| Where | What |
|-------|------|
| `shell/vite.config.ts` | `remotes` = the six entries of `mfePackages`, shared `react`, `react-dom`, `zustand`, `@tanstack/react-query` |
| each MFE | `exposes: { ./XxxApp }`, `base: command === "build" ? "/mfe/<name>/" : "/"`, `react`/`react-dom` shared as singletons |
| dev | one watch build per remote on `:3001`–`:3006`, mounted by sirv at `/mfe/<name>` |
| tests | a remote import is aliased to `packages/shell/src/components/MockMfe.tsx` |

Adding an MFE touches three places: its own `vite.config.ts`, `mfePackages` in `shell/vite.config.ts`, and a route entry.

## CI and deploy

`verify` runs `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm run lint`, `pnpm run typecheck` on Node 20;
`build-and-deploy` then downloads each game's `dist.tar.gz` from its latest release (submodules are not built here),
runs `pnpm run build:static`, and publishes `dist/` to gh-pages with `peaceiris/actions-gh-pages`. A game repo pushes to
`main` → its own workflow builds and releases it → it dispatches this repo's deploy.

## Tests

- Beside the source (`Foo.test.tsx` next to `Foo.tsx`), plus `tests/` for repo-level contracts.
- The three game engines are pure TypeScript and are tested directly.
- Run everything: `pnpm test`. Gates: `pnpm run lint`, `pnpm run typecheck`, `pnpm run a11y`.

## Updating this file

| Change | Section to update |
|--------|-------------------|
| Add or remove a package | Layout, Module Federation |
| Change the route table | Routes |
| Change the exposed component name | Module Federation |
| Add a token, family or recipe | Design tokens, `docs/02-reference/design-system.md` |
| Change how progress is stored | Pet and progress |
| Change a gate or the deploy pipeline | CI and deploy, `docs/01-overview/deployment.md` |
