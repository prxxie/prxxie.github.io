# Adopt report — 2026-10-23

## What this code is

A **retro terminal-styled personal site** delivered as a static SPA: a Vite + React 18 host (`shell`) that lazy-loads
six Module Federation remotes (`about`, `posts`, `pets`, `shikaku`, `sokoban`, `slitherlink`) over a custom hash router
(`packages/shell/src/types.ts:1`). There is no server: all state is browser-side (`localStorage`) with an **optional**
Supabase cloud-sync layer for email/password accounts (`packages/shell/src/utils/supabase.ts:9-19`). Three game remotes
are separate GitHub repositories mounted as git submodules, each with its own build-and-release workflow that dispatches
a redeploy of the host. Deployed as static files to GitHub Pages (`.github/workflows/deploy.yml:48-52`).
Maturity: active, 304 commits, dense test suite (36 test files, 293 tests) but **red on all three quality gates**
(see Commands). Graded **`standard`**: 7 packages / 6 routes / 1 database table / 2 roles (anonymous local user,
authenticated cloud user) / no published contract / no delivery reporting — several bounded contexts, not one.

## Evidence read

| Area | Files | Facts taken |
|------|-------|-------------|
| Manifests & toolchain | `package.json`, `pnpm-workspace.yaml`, `packages/*/package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `eslint.config.mjs`, `vitest.config.ts` | npm workspaces declared but pnpm lockfile + pnpm `node_modules`; `shared: "*"` dep; ports 3000–3006; strict TS; `recommendedTypeChecked` lint |
| Entrypoints & routing | `packages/shell/src/main.tsx`, `packages/shell/src/App.tsx`, `src/hooks/useHashRouter.ts`, `src/types.ts`, `src/types/remotes.d.ts` | 6 tabs, no router library, per-remote `.catch()` fallback, `ProgressServiceProvider` |
| Federation & build | `packages/*/vite.config.ts`, `scripts/build-static.sh`, `packages/shell/index.html` | `@originjs/vite-plugin-federation` 1.3.5, `/mfe/<name>/assets/remoteEntry.js`, `dist/mfe/<name>/` assembly |
| State & data | `packages/shell/src/store/*.ts`, `packages/shell/src/hooks/useProgressService.tsx`, `packages/shared/src/**` | 2 dead Zustand stores; `ProgressService` over a repository; `cozyos.progress.v1` envelope |
| Cloud sync | `packages/shell/src/utils/supabase.ts`, `src/components/CloudSyncModal.tsx`, `packages/shared/src/repository/SupabaseProgressRepository.ts` | email+password auth, table `user_progress(user_id, state)`, client-side field-timestamp merge |
| Game engines | `packages/{shikaku,slitherlink,sokoban}/src/engine|solver|store|levels.ts` | validation predicates, star rules, BFS solver caps, level counts 50/10/100 |
| Content | `packages/posts/src/PostsApp.tsx`, `src/utils/markdown.ts`, `public/posts/*.md`, `packages/about/src/AboutApp.tsx` | 2 hardcoded posts + runtime `fetch` of static markdown; 4 hardcoded skills |
| Tests | 36 `*.test.ts(x)` files, `vitest.config.ts`, `packages/shell/src/components/MockMfe.tsx` | MFE remotes aliased to a mock in tests; engines tested directly |
| CI / deploy | `.github/workflows/deploy.yml`, `packages/{shikaku,sokoban,slitherlink}/.github/workflows/build.yml`, `.gitmodules` | push-to-main + `repository_dispatch: mfe-updated`; release `dist.tar.gz` per game |
| Pre-existing docs | `README.md`, `AGENTS.md`, `CLAUDE.md`, `DESIGN.md`, `docs/README.md`, `docs/superpowers/{specs,plans}/*` | see verdicts below |

## Commands (run)

| Command | Source | Result | Verified |
|---------|--------|--------|----------|
| `npx vitest run` | `package.json#scripts.test` (`vitest run`) | **3 failed / 32 passed** of 35 collected files; **290 passed / 3 failed** tests; duration **663.43 s** | yes |
| `npx tsc --noEmit` | `package.json#scripts.typecheck` | **exit 2, 12 errors** | yes |
| `npx eslint .` | `package.json#scripts.lint` | **exit 1, 109 problems (7 errors, 102 warnings)** | yes |
| `npx vitest run packages/shell/src/components/Icons.test.tsx` | single-file retry | 1 passed | yes |
| `npm run build:static` | `package.json#scripts.build:static` | — | no (not run: rewrites `dist/`, needs pre-built submodule artifacts) |
| `npm run dev` | `package.json#scripts.dev` | — | no (long-running dev servers) |
| submodule `build.yml` workflows | `.github/workflows/build.yml` in each game repo | — | no (needs GitHub Actions runner + `DISPATCH_TOKEN`) |

### Failure detail (verbatim)

```
FAIL  packages/slitherlink/src/SlitherlinkApp.test.tsx > SlitherlinkApp Integration > renders level select menu initially
Error: Test timed out in 5000ms.

FAIL  packages/sokoban/src/levels.test.ts > Sokoban Levels > should verify no level is mathematically unsolvable
AssertionError: Level hack-10 (Buffer Overflow) is mathematically unsolvable (explored only 66605 states): expected false to be true

FAIL  packages/sokoban/src/solver/existing-levels.test.ts > Existing Levels Solvability > should verify all existing levels are solvable
AssertionError: Level hack-06 (Stack Overflow) is mathematically unsolvable (explored only 46973 states): expected false to be true

Errors  1 error
Unhandled Error: [vitest-worker]: Timeout calling "fetch" with "["/@vite/env","web"]"
```

### Typecheck detail

```
packages/shell/src/hooks/useProgressService.tsx(2,86): error TS2306:
  File 'node_modules/.pnpm/shared@0.2.0/node_modules/shared/lib/shared.d.ts' is not a module.
packages/shikaku/src/ShikakuApp.tsx(30,14): error TS7006: Parameter 'improved' implicitly has an 'any' type.
packages/slitherlink/src/SlitherlinkApp.tsx(44,16): error TS7006: Parameter 'firstTime' implicitly has an 'any' type.
packages/slitherlink/src/SlitherlinkApp.tsx(47,17): error TS7006: Parameter 'err' implicitly has an 'any' type.
packages/sokoban/src/components/WinModal.tsx(46,14): error TS7006: Parameter 'improved' implicitly has an 'any' type.
packages/pets/src/PetsApp.tsx(91,20): error TS2769: No overload matches this call. (clearTimeout of 'Timeout | null')
```

**Root cause (verified by inspection):** the workspace dependency `"shared": "*"` (`packages/shikaku/package.json`,
`packages/slitherlink/package.json`, `packages/sokoban/package.json`, `packages/shell/package.json`) resolves under pnpm
to the **unrelated published npm package `shared@0.2.0`** — "Shared objects over MongoDB", dependencies `bson`,
`mongodb` (`node_modules/.pnpm/shared@0.2.0/node_modules/shared/package.json:1-16`). That is why all three game
`vite.config.ts` files carry `rollupOptions: { external: ["mongodb", "bson"] }`
(`packages/shikaku/vite.config.ts:26-27`). `node_modules/shared` is *also* symlinked to `../packages/shared`, so the
two coexist. All 102 lint warnings are consequences of this one unresolved type.

## Conflicts

| # | Topic | Code says | Existing doc says | Where |
|---|-------|-----------|-------------------|-------|
| 1 | Pet state injected into `pets` MFE | Shell passes the **ProgressService context value**: `<PetsApp progressState={progressService} />` | `AGENTS.md` says "receives shell's `usePetStore` hook as a prop"; `usePetStore` is imported by nothing but its own test | `packages/shell/src/App.tsx:200`, `:243` vs `AGENTS.md` § `pets` |
| 2 | Cloud sync / Supabase | Fully implemented: auth modal, cloud repository, CI secrets | `AGENTS.md` and `README.md` never mention Supabase (0 occurrences) | `packages/shell/src/components/CloudSyncModal.tsx`, `AGENTS.md`, `README.md` |
| 3 | `shared` package exports | Also exports `SupabaseProgressRepository` | `AGENTS.md` lists only `ProgressService`, `LocalProgressRepository`, `getEvolutionStage`, `PetState`, `ProgressState`, `CompletedLevel` | `packages/shared/src/index.ts:1-6` vs `AGENTS.md` § `shared` |
| 4 | Visual design system | Rendered UI is amber-on-black pixel/terminal (`body { background: #000; color: #FFB000 }`, `.pixel-btn`, `.retro-window`) | `DESIGN.md` (589 lines) specifies a *warm cream + coral editorial* system ("Claude.com"); `docs/superpowers/specs/2026-05-30-flat-mono-redesign-design.md` specifies flat monochrome; latest commit is a "daisyUI redesign"; `AGENTS.md` claims "CRT/scanline animations" but **no scanline/CRT CSS exists** | `packages/shell/src/index.css:6-44`, `:46-52` vs `DESIGN.md:301-400`, latest commit `284315f` |
| 5 | Two design token sets in one file | `:root` defines the cream/coral `--color-primary #cc785c` etc.; `@theme` defines amber `--color-cozy-text #FFB000`; `body` uses the amber set | Both documented as the system | `packages/shell/src/index.css:5-32` vs `:34-44`, `:46-52` |
| 6 | Package manager | `package.json` declares npm `workspaces`; `README.md` says `npm install`; but `pnpm-lock.yaml` + pnpm `node_modules` are what is installed; no `package-lock.json` | README: "npm" | `package.json:4-6`, `README.md` § Getting Started vs `pnpm-lock.yaml` |
| 7 | Test file count | 36 `*.test.ts(x)` files on disk | Full run reported 35 files / `Icons.test.tsx` produced no result line (passes in isolation) | `packages/shell/src/components/Icons.test.tsx`, `/tmp` run log |
| 8 | Slitherlink edge-array shape | Data allocated `hEdges` = `(h+1)×w`, `vEdges` = `h×(w+1)` | Type comments say `hEdges` = `W×(H+1)`, `vEdges` = `(W+1)×H` | `packages/slitherlink/src/types.ts:4-5` vs `packages/slitherlink/src/store/useSlitherlinkStore.ts:33-36` |
| 9 | Shikaku levels "generated" | `levels.ts` is a 5334-line literal array; `scripts/` holds only `build-static.sh` — no generator exists | Test suite is titled `describe("Generated Levels Verification")` | `packages/shikaku/src/levels.ts:3`, `packages/shikaku/src/levels.test.ts:6` |
| 10 | Supabase schema ownership | Code reads/writes `user_progress(user_id, state)` only; never reads `updated_at` | The design spec defines `updated_at` + trigger + RLS policies, but **no `.sql`/migration exists in the repo** | `packages/shared/src/repository/SupabaseProgressRepository.ts:280-296` vs `docs/superpowers/specs/2026-06-03-supabase-backend-design.md` § 2 |
| 11 | `pets` props contract | `PetsApp` implements only `feedPet` as required | `packages/shell/src/types/remotes.d.ts:16-42` declares `playWithPet` / `toggleSleep` as required | `packages/pets/src/PetsApp.tsx:8-25` vs `remotes.d.ts:16-42` |
| 12 | Auto-merge "conflict resolution" | Merge is per-field max / latest-timestamp; no deletion semantics, no server clock | Design spec calls it "Auto-Merging … to prevent user data loss" | `packages/shared/src/repository/SupabaseProgressRepository.ts:165-242` |

## Dead code found (facts, not defects to fix here)

| Item | Location | Status |
|------|----------|--------|
| `usePetStore` (`hunger/happiness/status/feed/play/toggleSleep/tick`) | `packages/shell/src/store/petStore.ts:17-77` | imported only by `petStore.test.ts` |
| `useUiStore` (`isMenuOpen`) | `packages/shell/src/store/uiStore.ts:9-14` | imported only by `uiStore.test.ts` |
| `PetWidget` component | `packages/shell/src/components/PetWidget.tsx:6` | never imported anywhere |
| `StarTargets.oneStar` | `packages/shikaku/src/types.ts:10` | declared, present in all 50 levels, never read |
| `useSlitherlinkStore.stopTimer` | `packages/slitherlink/src/store/useSlitherlinkStore.ts:194-196` | never called |
| `slitherlink` `synth.playError` | `packages/slitherlink/src/engine/synth.ts:81` | never called |
| `shikaku` `synth.setMuted` | `packages/shikaku/src/engine/synth.ts:31` | no UI caller (shikaku has no mute control) |
| `QueryClientProvider` in shell | `packages/shell/src/App.tsx:13`, `:263-265` | created, but no shell component uses react-query |
| Per-MFE `src/index.css` | `packages/{about,posts,pets}/src/index.css` | three identical files, never imported (MFEs import `../../shell/src/index.css`) |

## Pre-existing docs — verdicts

| Doc | Verdict | Why |
|-----|---------|-----|
| `README.md` | **mostly accurate, incomplete** | Architecture, ports, dev/build/test commands match the code; omits Supabase cloud sync, daisyUI, and the `shared` dependency defect |
| `AGENTS.md` | **stale on 5 points** | Wrong pets-prop mechanism, no Supabase, incomplete `shared` exports, claims CRT/scanline animations that do not exist, says "npm workspaces" while pnpm is installed. Still correct on federation wiring, ports, `/mfe/` paths, and the CI story |
| `CLAUDE.md` | **accurate** | single line `@AGENTS.md` — an include, inherits AGENTS.md's staleness |
| `DESIGN.md` (589 lines) | **stale / not the implemented design** | Specifies the warm cream + coral "Claude.com" editorial system with licensed Copernicus/StyreneB fonts; the shipped UI is amber-on-black pixel terminal. Its tokens were copied into `index.css` but `body` overrides them |
| `docs/README.md` | **accurate placeholder** | ADF not yet generated (this run is the adoption step) |
| `docs/superpowers/specs/` (20 files) | **historical record, partly superseded** | Design specs from 2026-05-28 → 2026-06-03; they describe the intended architecture accurately at their date, but several were later reversed (flat-mono → amber CRT → daisyUI) |
| `docs/superpowers/plans/` (28 files) | **historical record** | Implementation plans; useful as change history, not as current requirements |
| `docs/superpowers/plans/tasks-todo.md`, `2026-05-29-shikaku-todo.md` | **stale** | Ad-hoc todo lists with no completion state |
| `.github/prompts/ui-ux-pro-max/**` | **superseded** | A vendored third-party UI/UX prompt+CSV knowledge base (colors, stacks, guidelines); not project-specific |

## Intent gaps (interview)

| # | Brief section | Question | Why the code cannot answer it |
|---|---------------|----------|-------------------------------|
| 1 | 1 Problem / 2 Users / 3 Goals | Who is the audience and what must the site achieve? | Code shows a bio, 2 devlog posts, 4 skills and 3 games; it cannot show whether this is a recruiter-facing portfolio, a personal sandbox, or a product |
| 2 | 4 Scope / 6 Tech stack | Which of the four visual directions is the product's design system? | Four layers coexist: amber CRT (rendered), Claude warm-editorial (`DESIGN.md`), flat-mono (spec), daisyUI (latest commit) |
| 3 | 4 Scope / 10 Integrations | Is Supabase cloud sync in scope for the next release? Who owns the project, and are the RLS policies + table actually applied? | The repo contains no migration, no `.env.example`, and the schema exists only inside a design spec |
| 4 | 4 Scope / 11 Environments | Are the three game submodules in product scope, and where are game defects fixed? | They live in separate repos with their own CI and are pinned as submodules; ownership is invisible |
| 5 | 12 Quality | Sokoban levels `hack-06` / `hack-10` fail the project's own solvability test — replace the levels, fix the solver, or relax the assertion? | The test asserts unsolvability; only a human can say whether the level or the solver is wrong |
| 6 | 6 Tech stack / 5 Constraints | Which package manager is canonical — npm (declared + README) or pnpm (lockfile + installed tree)? | Both are present; this single choice causes the 12 typecheck errors and 102 lint warnings |
| 7 | 9 Non-functional requirements | What are the NFR targets (performance, a11y, reduced motion, browser support), and may the CRT aesthetic override `prefers-reduced-motion`? | Code shows current behavior (animations, audio autoplay guard) but no targets or policy |
| 8 | 11 Environments | Confirm the public URL / base path and any release cadence or deadline | CI publishes `./dist` to GitHub Pages; the repository name implies `prxxie.github.io` but no `base` is set in the shell's Vite config |
| 9 | 15 Assumptions and open questions | Should `DESIGN.md` and the 48 `docs/superpowers/` files be kept as source-of-history or archived/deleted? | They are evidence of intent but partly contradict the code; only the owner can retire them |
| 10 | 4 Scope | Is the posts pipeline (2 hardcoded entries + runtime `fetch` of static markdown) the intended content model, or is build-time markdown / a CMS the goal? | A `public/posts/` folder copied into two builds works today; nothing records intent |

## Assumptions taken to date

| # | Assumption | Basis | Would change what if wrong |
|---|------------|-------|----------------------------|
| 1 | The three game MFEs are part of the shipped product, not side experiments | They are wired into shell routing (`packages/shell/src/App.tsx:36-55`), into `scripts/build-static.sh:14-21`, and CI downloads their release artifacts | Scope, epic structure, and where game defects are triaged |
| 2 | Amber-on-black terminal is the current visual truth for the shell | `packages/shell/src/index.css:46-52` sets `body` background/colour from the `--color-cozy-*` tokens; `.pixel-btn` / `.retro-window` are the classes actually used in shell components | Which design doc `adf-docs` must describe, and whether `DESIGN.md` is retired |
| 3 | Supabase sync is optional and off by default in local dev | `packages/shell/src/utils/supabase.ts:9-19` requires both `VITE_SUPABASE_*` vars; without them the shell silently uses `LocalProgressRepository` | Whether auth is a first-class capability or a hidden extra |
| 4 | Progress data is single-user and non-sensitive | Only pet XP/stars/level ids are stored (`packages/shared/src/progress/types.ts:1-21`); no PII beyond account email | Data-protection requirements, retention rules |
| 5 | Tier `standard` | 7 packages, 6 routes, 1 table, 2 roles, 293 tests, no published contract, no delivery reporting | Doc set depth (epics/stories vs full test-case + report tiers) |
