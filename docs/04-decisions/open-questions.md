# Open questions

Questions that block or shape the work and that only the product owner, client, or user can answer. Managed with
`adf-decide`. Format: [.agents/rules/02-docs-navigation.md § 5](../../.agents/rules/02-docs-navigation.md#5-open-questions).

<!-- adf:oq-summary -->
**Open: 1 · Blocking: 0 · Answered: 11 · Withdrawn: 0**

| Id | Question | Status | Blocking |
|---|---|---|---|
| [OQ-01](open-questions.md#oq-01--who-is-this-site-for-and-what-does-success-look-like) | Who is this site for, and what does success look like? | answered | — |
| [OQ-02](open-questions.md#oq-02--which-of-the-four-visual-directions-is-the-products-design-system) | Which of the four visual directions is the product's design system? | answered | — |
| [OQ-03](open-questions.md#oq-03--is-supabase-cloud-sync-in-scope-and-who-owns-the-project-table-and-rls-policies) | Is Supabase cloud sync in scope, and who owns the project, table, and RLS policies? | answered | — |
| [OQ-04](open-questions.md#oq-04--are-the-three-game-submodules-in-product-scope-and-where-do-game-defects-get-fixed) | Are the three game submodules in product scope, and where do game defects get fixed? | open | — |
| [OQ-05](open-questions.md#oq-05--sokoban-hack-06-and-hack-10-fail-the-solvability-test--replace-the-levels-fix-the-solver-or-relax-the-assertion) | Sokoban `hack-06` and `hack-10` fail the solvability test — replace the levels, fix the solver, or relax the assertion? | answered | — |
| [OQ-06](open-questions.md#oq-06--is-npm-or-pnpm-the-canonical-package-manager) | Is npm or pnpm the canonical package manager? | answered | — |
| [OQ-07](open-questions.md#oq-07--what-are-the-non-functional-targets-and-may-the-crt-aesthetic-override-prefers-reduced-motion) | What are the non-functional targets, and may the CRT aesthetic override `prefers-reduced-motion`? | answered | — |
| [OQ-08](open-questions.md#oq-08--what-is-the-public-url-and-base-path-and-is-there-a-release-cadence-or-deadline) | What is the public URL and base path, and is there a release cadence or deadline? | answered | — |
| [OQ-09](open-questions.md#oq-09--should-designmd-and-the-48-docssuperpowers-files-be-kept-or-archived) | Should `DESIGN.md` and the 48 `docs/superpowers/` files be kept or archived? | answered | — |
| [OQ-10](open-questions.md#oq-10--is-the-current-posts-pipeline-2-inline-entries--runtime-markdown-fetch-the-intended-content-model) | Is the current posts pipeline (2 inline entries + runtime markdown fetch) the intended content model? | answered | — |
| [OQ-11](open-questions.md#oq-11--do-the-three-game-mfes-get-restyled-and-who-owns-the-change) | Do the three game MFEs get restyled, and who owns the change? | answered | — |
| [OQ-12](open-questions.md#oq-12--which-router-and-prerender-toolchain-produce-real-paths-with-prerendered-html) | Which router and prerender toolchain produce real paths with prerendered HTML? | answered | — |
<!-- /adf:oq-summary -->

---

## OQ-01 — Who is this site for, and what does success look like?

- **Status**: answered
- **Raised**: 2026-10-23 by `adf-adopt`
- **Blocks**: none — every epic's acceptance criteria inherit the answer
- **Context**: The code shipped a bio, a two-post devlog, a skill matrix, a virtual pet and three puzzle games while
  recording no audience and no measure. Three readings fit the same code: a recruiter-facing portfolio, a personal
  sandbox, or the seed of a game portal. Each implied a different priority — (a) wants a fast checkable verdict and
  crawlable content, (b) wants feature depth and no analytics, (c) wants retention and accounts. The code optimised for
  none of them: routing was hash-based so nothing was crawlable, and there was no analytics at all.
- **Assumption**: none — answered.
- **Answer**: It is a **portfolio for hiring**: the reader is a recruiter or hiring manager deciding whether to
  shortlist, and the site itself is the evidence (engines, tests, CI, federation) `[user]`. Success is
  **≥ 1 inbound contact per month attributable to the site**, measured 3 months out `[user]`. The owner chose
  **"rework the concept"** rather than "fix what ships", because the current build cannot produce that contact: it is a
  hash-router SPA with no meta tags, no Open Graph, no contact path and no analytics `[user]`.


## OQ-02 — Which of the four visual directions is the product's design system?

- **Status**: answered
- **Raised**: 2026-10-23 by `adf-adopt`
- **Blocks**: was: every UI story; now blocks only the typeface substitution
- **Context**: Four directions coexisted while three were documented as current — amber-on-black pixel terminal (the only
  one actually rendering, `packages/shell/src/index.css:34-52`), warm cream + coral editorial (`DESIGN.md:301-400`, its
  tokens dead in `:root`), flat monochrome (`docs/superpowers/specs/2026-05-30-flat-mono-redesign-design.md`), and
  daisyUI defaults. Keeping four meant every new component chose one arbitrarily and the doc set could not name a
  design system.
- **Assumption**: none — answered.
- **Answer**: **Warm cream + coral editorial** becomes the single canonical system (`bg #F5F1EA`, `fg #1A1A1A`,
  accent `#CC785C`, serif display + clean sans) `[user]`. The amber `@theme` block and every `--color-cozy-*` token are
  retired; `DESIGN.md` stops being dead documentation and becomes the reference the tokens are generated from. The
  user explicitly rejected the hybrid option, so **one** system governs the whole site.
  Consequence to settle: the three game MFEs inherit the shell's amber CSS today
  (`packages/*/src/index.css` are dead files; the games import `../../shell/src/index.css`), so honouring a single system
  restyles three separate repositories. Carried into OQ-11.
- **Typefaces**: `DESIGN.md` names Copernicus and StyreneB, both licensed and never loaded; no font licence exists in the
  repo. Free substitutes are chosen by `adf-docs` and recorded as an accepted decision, not an open question.


## OQ-03 — Is Supabase cloud sync in scope, and who owns the project, table, and RLS policies?

- **Status**: answered
- **Raised**: 2026-10-23 by `adf-adopt`
- **Blocks**: was: every auth/sync story; now blocks nothing
- **Context**: Cloud sync was fully implemented in code — auth modal, `SupabaseProgressRepository`, field-timestamp
  merge — and CI carried `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, yet neither `README.md` nor `AGENTS.md`
  mentioned it, and the repository contained **no SQL**: no migration, no RLS policy, no `.env.example`. The table
  `user_progress(user_id, state jsonb)` and its "own row only" policy existed only inside a design spec, so an outsider
  could not stand the backend up, and nobody could verify whether the live project matched the spec — if RLS were
  missing, the public anon key would expose every user's progress.
- **Assumption**: none — answered.
- **Answer**: **Accounts and cloud sync are cut from the product** `[user]`. Deleted: `CloudSyncModal`, the auth helper
  `packages/shell/src/utils/supabase.ts`, `packages/shared/src/repository/SupabaseProgressRepository.ts`, the
  `@supabase/supabase-js` dependency and the `VITE_SUPABASE_*` build secrets. Kept: the `ProgressRepository` port and
  `LocalProgressRepository`, so a server-side adaptor can return later without redesigning the seam. Consequence: the
  role model collapses to one anonymous role, the site collects no personal data at all, and the schema question
  disappears rather than being answered out-of-band.


## OQ-04 — Are the three game submodules in product scope, and where do game defects get fixed?

- **Status**: open
- **Raised**: 2026-10-23 by `adf-adopt`
- **Blocks**: the three game epics; any bug reported against a puzzle
- **Context**: `shikaku`, `sokoban`, and `slitherlink` are real git submodules pointing at separate GitHub repositories,
  each with its own `build.yml` that builds, cuts a release, and dispatches a host redeploy
  (`.gitmodules`, `.github/workflows/deploy.yml:5-11`). The host CI does not compile them — it downloads their release
  `dist.tar.gz` (`scripts/build-static.sh:14-21`). Consequences: a story touching a puzzle cannot be shipped from this
  repo alone, and a fix inside a submodule is invisible here until the pointer bumps. The docs and the backlog must know
  where each kind of change lives. Recommended: keep all three in product scope, document the "change in submodule repo
  → release → bump pointer" loop in the doc set, and put it in `AGENTS.md`.
- **Assumption**: The three games ship with the product; defects are triaged in their own repos
  (`docs/00-source/adopt-report.md` assumption #1).
- **Answer**: —

## OQ-05 — Sokoban `hack-06` and `hack-10` fail the solvability test — replace the levels, fix the solver, or relax the assertion?

- **Status**: answered
- **Raised**: 2026-10-23 by `adf-adopt` (found by running the suite)
- **Blocks**: was: one Sokoban content story; now blocks nothing
- **Context**: two tests assert that every shipped level is solvable, and both fail against the project's own BFS solver:

  ```
  Level hack-10 (Buffer Overflow) is mathematically unsolvable (explored only 66605 states)
  Level hack-06 (Stack Overflow)   is mathematically unsolvable (explored only 46973 states)
  ```

  Three readings: the levels are genuinely broken (players cannot finish them, so the star targets and the 100-level
  count are wrong); the solver has a state-space cap that truncates before finding the solution (the "explored only N
  states" wording suggests a cap, which would make the assertion unreliable rather than the level bad); or the assertion
  is too strict for a shipped puzzle set. Only the owner can say which. The answer decides whether the fix is data, an
  algorithm, or a test.
- **Assumption**: none — answered.
- **Answer**: **Fix the two levels** `[user]`. Investigation settled the ambiguity: `packages/sokoban/src/solver/solver.ts:93`
  sets `maxStates = 100000` and `:134` returns early only when that cap is reached — both levels stopped at roughly half
  the cap, so the reachable state space was **exhausted**, not truncated. With 98 of 100 levels passing, the solver's
  move generation is sound and the level data is wrong. Adjust the two levels so a solution exists, re-run the solver,
  release in the sokoban repository and bump the submodule pointer. The assertion stays as-is and becomes the regression
  guard; `hack-06` / `hack-10` are not whitelisted and the level count stays at 100.

## OQ-06 — Is npm or pnpm the canonical package manager?

- **Status**: answered
- **Raised**: 2026-10-23 by `adf-adopt`
- **Blocks**: was: build/CI stories and any fix for the red typecheck
- **Context**: The repo is contradictory: root `package.json` declares npm `workspaces` and `README.md` says
  `npm install`, but `pnpm-lock.yaml` and a pnpm-shaped `node_modules` are what exist — there is no `package-lock.json`.
  This is not cosmetic: under pnpm the workspace dependency `"shared": "*"` resolves to the **unrelated published npm
  package `shared@0.2.0`** (a MongoDB/BSON helper), which produces
  `TS2306: File 'node_modules/.pnpm/shared@0.2.0/node_modules/shared/lib/shared.d.ts' is not a module` and cascades into
  12 `tsc` errors and 102 lint warnings. Fixing the manager means also changing `"shared": "*"` to `workspace:*` (or a
  `file:` path) in all four `package.json` files, removing the `external: ["mongodb","bson"]` workaround from the three
  game Vite configs, and committing exactly one lockfile. Recommended: pnpm + `workspace:*`.
- **Assumption**: none — answered.
- **Answer**: **pnpm is canonical** `[user]`, decided after the CI evidence came in: the committed lockfile is
  `pnpm-lock.yaml` (root, plus a stray nested `packages/shell/pnpm-lock.yaml`), no `package-lock.json` exists, yet
  `.github/workflows/deploy.yml:29` and `packages/sokoban/.github/workflows/build.yml:42` both run `npm install` — so
  deploys resolve fresh versions every run. Actions: switch both workflows to `pnpm install --frozen-lockfile`, delete
  the nested lockfile, replace `"shared": "*"` with `workspace:*` in every manifest (which also retires the
  `external: ["mongodb","bson"]` workaround and the `TS2306` cascade), and keep exactly one lockfile.

## OQ-07 — What are the non-functional targets, and may the CRT aesthetic override `prefers-reduced-motion`?

- **Status**: answered
- **Raised**: 2026-10-23 by `adf-adopt`
- **Blocks**: was: the accessibility story and all animation/audio work; now blocks nothing
- **Context**: No NFR target was recorded anywhere. The shipped UI used a pixel webfont at small sizes, amber on black,
  continuous animations, unconditional WebAudio synthesis and keyboard-only puzzle controls, with no
  `prefers-reduced-motion` query. For a retro aesthetic those could be deliberate or accidental — the answer changed the
  acceptance criteria of every UI story.
- **Assumption**: none — answered.
- **Answer**: **WCAG 2.2 AA by construction, enforced by an automated gate in CI** `[user]`: contrast, visible focus,
  keyboard-only play, reduced-motion variants, semantic landmarks, responsive 360px → 1920px, last two versions of
  evergreen browsers. There is **no CRT exception**, because the CRT palette itself was retired in OQ-02 — the question
  of whether the aesthetic may override `prefers-reduced-motion` no longer applies.


## OQ-08 — What is the public URL and base path, and is there a release cadence or deadline?

- **Status**: answered
- **Raised**: 2026-10-23 by `adf-adopt`
- **Blocks**: the deploy story; any absolute URL, canonical link, or social-preview work
- **Context**: CI publishes `./dist` to GitHub Pages on every push to `main`
  (`.github/workflows/deploy.yml:44-52`), but no file records the resulting URL or whether the site is served from a
  subpath. This matters because a project site at `https://prxxie.github.io/<repo>/` requires
  `base: "/<repo>/"` in the shell's Vite config, and **the shell config sets no `base`** — while each MFE hardcodes
  `base: "/mfe/<name>/"` and the host resolves `/mfe/<name>/assets/remoteEntry.js` absolutely, which only works at a
  domain root. Either the CI rewrites paths at assembly time, or the deployment target is a root-served domain. The
  deadline question is separate: nothing in the repo states one, and the answer changes whether the backlog is
  "fix what is red" or "ship new features".
- **Assumption**: none — answered.
- **Answer**: **Root user site at `https://prxxie.github.io/`** `[user]` — the repository is renamed to
  `prxxie.github.io` and served from the domain root, which is exactly what the absolute `/mfe/<name>/` remote paths and
  the shell's missing `base` already assume, so no asset path is rewritten and no per-MFE `base` changes. The repo is
  renamed during the launch phase, before canonical URLs, OG tags and `sitemap.xml` are written, because all three embed
  the origin. No deadline: the build is solo and deadline-free `[user]`.

## OQ-09 — Should `DESIGN.md` and the 48 `docs/superpowers/` files be kept or archived?

- **Status**: answered
- **Raised**: 2026-10-23 by `adf-adopt`
- **Blocks**: nothing hard — but ADF's `docs/00-source/` must not silently contradict the new doc set
- **Context**: `DESIGN.md` (589 lines, Claude-style cream/coral system) and `docs/superpowers/{specs,plans}/` (48 files,
  2026-05-28 → 2026-06-03) are the only written record of *why* the code looks the way it does — several specs explain
  decisions that were later reversed (flat-mono → amber CRT → daisyUI). Two of them remain load-bearing today: the
  Supabase backend design (the only schema documentation that exists, see OQ-03) and the pet-evolution spec. Retiring
  the whole corpus would delete the only record of the backend; keeping it as-is leaves four design directions in play
  (OQ-02). Options: (a) keep the two load-bearing specs, archive the rest under `docs/00-source/legacy/`; (b) keep
  everything and mark it historical in `docs/00-source/`; (c) delete what the code contradicts. Recommended: (a).
- **Assumption**: none — answered.
- **Answer**: **Delete what the code contradicts** `[user]` — the corpus is removed rather than archived, so the tree
  contains one design direction and no reversed decisions. Because three facts in it are irreplaceable, `adf-docs`
  extracts them into the live doc set **before** deleting anything: the cream/coral token values and typography rules
  from `DESIGN.md:301-400` (the chosen system, OQ-02), the BFS solver's deadlock/state-cap rationale from
  `docs/superpowers/specs/2026-06-01-sokoban-solver-deadlock-fix-design.md` (it explains `solver.ts:93`/`:134`, the
  exact lines OQ-05 turns on), and the evolution-stage table from the pet spec
  (`packages/shared/src/pet/evolution.ts:1-8` remains the executable source — thresholds 0/10/30/60/100 for stages 1–5).
  The Supabase schema spec goes with the backend it described (OQ-03). `AGENTS.md` is refreshed by the same pass.

## OQ-10 — Is the current posts pipeline (2 inline entries + runtime markdown fetch) the intended content model?

- **Status**: answered
- **Raised**: 2026-10-23 by `adf-adopt`
- **Blocks**: the posts epic
- **Context**: `PostsApp` carries two complete posts as a hardcoded array, and it also `fetch`es markdown from
  `public/posts/` at runtime and renders it through a hand-written Markdown-to-HTML converter. The same
  `public/posts/` folder is copied into two different builds by `scripts/build-static.sh`. So there are two content
  paths and no authoring story: adding a post means editing a component and redeploying the whole site. Options: (a) keep
  the inline array as the model and drop the markdown fetcher (it is dead weight today); (b) move fully to markdown
  files loaded at build time via `import.meta.glob` so a post is data, not code; (c) keep both. Recommended: (b) — it
  makes the two existing markdown files the source of truth and removes the hardcoded copy.
- **Assumption**: none — answered.
- **Answer**: **Markdown at build time** `[user]` — `/devlog` reads the files under `public/posts/` (the root `public/`
  directory, which `packages/shell/vite.config.ts:21` mounts as the shell's `publicDir`) through `import.meta.glob`
  (eager, `?raw`) and renders them at build time, so a post is data rather than code. The two inline entries in
  `packages/posts/src/PostsApp.tsx:29-36` are migrated into files, and the runtime `fetch` plus the hand-written
  Markdown→HTML converter (`packages/posts/src/utils/markdown.ts`) are deleted. This also gives prerendering one static
  page per slug for free, which is what § 14 SEO needs.

## OQ-11 — Do the three game MFEs get restyled, and who owns the change?

- **Status**: answered
- **Raised**: 2026-10-23 by `adf-interview` (Round 3)
- **Blocks**: was: the game-restyle stories and the visual consistency of the whole site
- **Context**: The concept changed from amber CRT to warm cream + coral, and the four existing palettes/rules sets are
  being replaced by one design system. The games live in separate repositories mounted as submodules, each with its own
  CI, so a restyle is three separate PRs, three releases and three pointer bumps, not one commit. Skipping them leaves
  the funnel's exhibit in the old palette.
- **Assumption**: none — answered.
- **Answer**: **All three games are restyled** `[user]` — shikaku, slitherlink and sokoban move to the new token set,
  each shipped through its own repository's CI plus a submodule pointer bump in this repo. Their engines, level data and
  stores stay untouched: only presentation changes, so the engine test suites remain the regression guard.

## OQ-12 — Which router and prerender toolchain produce real paths with prerendered HTML?

- **Status**: answered
- **Raised**: 2026-10-23 by `adf-docs`
- **Blocks**: — (answered before the backlog was written)
- **Context**: The shell today has no router dependency at all — `packages/shell/src/hooks/useHashRouter.ts:4-32` reads
  `window.location.hash` and the six tabs are a `switch` in `packages/shell/src/App.tsx:138-151`. Real paths plus
  prerendered HTML (brief § 4, § 14 SEO) need two things the repo has never had: a routing layer that works when a
  static host serves `/devlog/some-post.html`, and a build step that emits one HTML file per route with the shell chrome
  already rendered. Module Federation constrains the second: the remotes are fetched over HTTP at runtime from
  `/mfe/<name>/assets/remoteEntry.js` (`packages/shell/vite.config.ts:27-32`), so a prerender can only render shell
  chrome and the game containers, never a game's own DOM. Options: (a) React Router 7 in `createStaticHandler` mode plus
  a Vite SSR prerender script called from `scripts/build-static.sh`; (b) TanStack Router with file-based route
  generation and the same prerender script; (c) adopt Vike, which owns routing, SSR and prerendering but restructures
  the shell; (d) keep a hand-rolled router and post-render the built SPA with a headless browser (`react-snap` style).
  Recommended: (a) — one new dependency, a prerender step that fits the existing build script, and no restructuring of
  the federation setup.
- **Assumption**: React Router 7 with a Vite SSR prerender step, documented in ADR-0009 and tagged
  `[assumption: OQ-12]` wherever the doc set depends on it.
- **Answer**: **React Router 7 in `createStaticHandler` mode, plus a Vite SSR prerender step** `[user]` — option (a).
  `scripts/prerender.mjs` emits one HTML file per route from a route manifest, called from `scripts/build-static.sh`;
  no restructuring of the federation setup. ADR-0009 moves to `accepted`. The routes are enumerated in
  `docs/03-stories/EPIC-02-site-shell/`.
