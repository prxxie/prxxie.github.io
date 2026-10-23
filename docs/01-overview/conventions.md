# Conventions

Project-specific working agreement. Anything the installed pack decides is linked rather than repeated here; what
follows is what this project decides on top of it, and where it deviates.

## Stack packs

| Pack | Layer | Skill |
|------|-------|-------|
| `react-vite` (catalog status: unverified — its commands are advisory and were checked against this repo) | Shell and remote UI: components, hooks, state placement, fetching, forms, accessibility, Vite config | [adf-stack-react-vite](../../.agents/skills/adf-stack-react-vite/SKILL.md) |

No pack covers Module Federation, the pnpm workspace layout, the GitHub Pages assembly or the game engines; those
conventions are recorded below. The pack's own command table does not apply verbatim — see **Deviations from the pack**.

## Toolchain and commands

| Concern | Decision | Where |
|---------|----------|-------|
| Package manager | pnpm only; one frozen lockfile; internal dependencies use `workspace:*` | ADR-0005 |
| Runtime | Node 20 (what CI runs) | `.github/workflows/deploy.yml:23-26` |
| Modules | ESM everywhere; `moduleResolution: "bundler"` | `tsconfig.json` |
| Type checking | One root `tsconfig.json`, `strict: true`, `noEmit: true`, all packages listed in `include` — no project references, so there is no `tsc -b` | `tsconfig.json` |
| Tests | Vitest with `globals: true`, `jsdom` environment, Testing Library; files sit beside the source as `Foo.test.tsx` | `vitest.config.ts:4-9` |
| Lint | ESLint flat config, `eslint.config.mjs`, run from the repo root | `package.json#scripts.lint` |
| Formatting | No formatter is configured; do not introduce one without adding it to the pre-commit hook | `.husky/pre-commit` runs `lint-staged` for `*.{ts,tsx}` |
| Accessibility check | Part of the CI gate once ADR-0008 is implemented | ADR-0008 |

## Repository shape

- One package per deployable. `packages/shell` is the only host; every other package that exposes a UI is a remote.
- `packages/shared` holds logic and types only — no React, no JSX, no bundler configuration. It is imported by bare
  specifier (`shared`) and resolved through the workspace link, aliased to `packages/shared/src/index.ts` in
  `vitest.config.ts:36-39`.
- A package's public surface is exactly its exposed component. Nothing imports another package's internals; if two
  packages need the same logic it moves into `shared`.
- Content that is not code lives outside the packages: devlog markdown in `public/posts/`, which the shell mounts as its
  `publicDir` (`packages/shell/vite.config.ts:21`).

## Module Federation

| Rule | Detail |
|------|--------|
| One exposed component per remote | `./XxxApp` from `./src/XxxApp.tsx` |
| Base path | production builds use `base: "/mfe/<name>/"`, dev uses `/` (`packages/about/vite.config.ts:8`) |
| Shared dependencies | `react`, `react-dom` in every package; `zustand` and `@tanstack/react-query` additionally shared by the host and the packages that use them (`packages/shell/vite.config.ts:33`) |
| Host remote map | a remote resolves as `/mfe/<name>/assets/remoteEntry.js`; the name in the map is the federation `name`, not the package name (`packages/shell/vite.config.ts:18-32`) |
| Build options | `target: "esnext"`, `minify: false`, `cssCodeSplit: false` — deliberate, so a remote's CSS lands in one file |
| Isolation | a remote may fail; the host wraps every import so the failure is local (`packages/shell/src/App.tsx:15-67`) |
| Typing | remote specifiers are typed in `packages/shell/src/types/remotes.d.ts`; add the declaration when a remote is added |

## Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Package | the product name, lower case | `packages/pets`, dependency `"pets": "workspace:*"` |
| Federation name | identical to the package name | `name: "pets"` |
| Exposed component | `./<PascalCase>App` | `./PetsApp` |
| Component file | PascalCase, one component per file | `components/LevelSelect.tsx` |
| Hook file | `use<Thing>.ts`, extension `.tsx` when it returns JSX | `hooks/useProgressService.tsx` |
| Zustand store | `use<Domain>Store.ts` | `store/useSokobanStore.ts` |
| Custom event | `cozyos:<past-tense-change>` | `cozyos:progress-updated` |
| Storage key | `cozyos.<domain>.v<n>` | `cozyos.progress.v1` |
| CSS token | `--color-<role>`, `--radius-<size>`, `--font-<role>`; no raw hex in components | `--color-primary`, `--font-display` |
| Test | `<Subject>.test.ts(x)` beside the subject | `packages/shared/src/pet/evolution.test.ts` |

## State and data

- The progress document is the only persisted state (ADR-0004). Read it through `ProgressService`; never touch
  `localStorage` from a component, and never construct the key outside `LocalProgressRepository`.
- A write is a whole-document replacement, and every successful write dispatches `cozyos:progress-updated`
  (`packages/shared/src/progress/service.ts:19-33`). A UI that adds a write path must dispatch it too, or the widgets
  will not refresh.
- Derived values are computed, never stored: `stage` from XP, hunger from `lastFedAt`, happiness from `lastPlayedAt`.
  Storing a derived value is how the pet drifts out of sync.
- UI state that the whole page reads goes in a Zustand store (`store/petStore.ts`, `store/uiStore.ts`); state local to a
  route or a component stays in that component. Anything that survives a reload belongs in the progress document.

## Error handling

- A storage failure throws with the cause in the message (`Failed to save progress: …`,
  `packages/shared/src/repository/LocalProgressRepository.ts:110-116`); do not swallow it, and do not return a silent
  default.
- The service validates before writing rather than trusting the caller: a feed is refused when the pet is not hungry or
  no food is available, playing is refused while asleep
  (`packages/shared/src/progress/service.ts:35-70`). New domain rules belong in the service, not in the widget.
- Component-level failures log through `console.error` and rethrow so the caller can decide what the visitor sees
  (`packages/shell/src/hooks/useProgressService.tsx:83-96`). There is no logging library (NFR-17).

## Configuration

The build reads no configuration at all (ADR-0004, applied in US-FND-004): the only environment is the deploy
workflow's own `GITHUB_TOKEN`/`MFE_DOWNLOAD_TOKEN` secrets (`.github/workflows/deploy.yml:20`, `:33`), which never
reach the bundle. There is no `.env.example` and none is needed until a variable exists again.

## Content

- A devlog post is one markdown file in `public/posts/` whose front matter carries `title`, `date` and `slug` (ADR-0006).
  The slug drives the route `/devlog/<slug>` and the prerendered filename, so renaming a slug breaks a URL.
- Copy is English and inline; no i18n layer (NFR-16).

## Deviations from the pack

| Pack says | This project does | Why |
|-----------|-------------------|-----|
| React 19, Vite 7–8 | React 18.3.1, Vite ^5.2.11 | The federation plugin version in use targets this pairing; not upgrading mid-rework |
| `tsc -b` with project references | one root `tsconfig.json`, `tsc --noEmit` | No project references exist, and adopting them is its own change |
| `npm run …` | `pnpm …` / `pnpm -F <name> …` | ADR-0005, enforced since US-FND-001: `packageManager` pinned, `workspace:*` links, one root lockfile, the deploy workflow installs frozen |
| Playwright for end-to-end | none yet | No e2e suite exists; the accessibility gate (ADR-0008) is the first CI-side browser test |
| MSW for network mocking | none | There is no HTTP layer in the product; tests alias remotes to `MockMfe.tsx` instead (`vitest.config.ts:12-35`) |
| Coverage run in the test command | `vitest run` plain | No coverage thresholds are enforced yet |
