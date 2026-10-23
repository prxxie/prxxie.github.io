---
name: Cozy OS — prxxie home page
tier: standard
project_types: [web-app]
status: confirmed
updated: 2026-10-24
---

# Project brief — Cozy OS (prxxie home page)

> Reconstructed from the code by `adf-adopt` on 2026-10-23, then completed in `adf-interview` on 2026-10-24.
> Every fact carries a source tag: `[user]`, `[user: delegated]`, `[spec: <file>#<section>]`, `[inferred]`, or
> `[assumption: OQ-nn]`. A section with nothing to say reads `_not applicable_ — <reason>`.
>
> `[user]` marks a decision the owner made in the interview; `[inferred]` marks a fact read from the code and shown to
> the owner without being corrected. Questions still open live in `docs/04-decisions/open-questions.md`, not here.

## 1. Problem

The site exists to get its owner hired `[user]`. Its reader is a recruiter or hiring manager who must decide, in a
few minutes and without running anything, whether this person can engineer software `[user]`. The site is itself the
evidence: hand-written puzzle engines with solvers, a 293-test suite, CI that assembles six independently released
micro-frontends, and a real progress/sync layer `[inferred]` — `docs/00-source/adopt-report.md`.

The reader's alternative today is a CV, a LinkedIn profile, or the GitHub profile `[inferred]` — stated in the
interview and not corrected. The rework's job is to beat it, which is why the front page must deliver a verdict in one
scroll *before* the reader bounces back to LinkedIn.


## 2. Users

| User type | Needs to get done | Notes |
|-----------|-------------------|-------|
| **Recruiter / hiring manager (primary)** | Decide within minutes whether to shortlist this person, then find a way to make contact | Primary reader `[user]`. Needs the engineering claims to be *checkable*, not asserted — the games, tests and CI are the proof `[inferred]` |
| Curious visitor / peer developer | Play a puzzle, see how it was built | Anonymous, no account, no sign-up anywhere `[user]` |
| Owner / author | Build, publish, and now also receive the inbound contacts the measure counts | Solo `[user]` |

## 3. Goals and success measures

| Goal | Measure | Target |
|------|---------|--------|
| The site produces hiring conversations | Inbound contacts attributable to the site | **≥ 1 per month** `[user]` |
| A hiring reader reaches a verdict fast | Time from landing to "shortlist or not" | Beat a CV; the front page must deliver the verdict in one scroll `[user]` |
| The claims are checkable | A visitor can run, read or inspect the evidence the site points at | Engine sources, tests and CI reachable from the front page `[inferred]` |

Constraint that follows from the measure and is **not** satisfied by the current build: the site is a hash-router SPA
with no meta description, no Open Graph tags and no contact path `[inferred]` — `packages/shell/index.html`,
`packages/shell/src/hooks/useHashRouter.ts:12-80`. Discoverability is therefore on the critical path of the rework, not
an optional extra.

Locally recorded behaviour that exists but is not a goal: per-game stars, per-level best moves and times, play counts,
XP and evolution stage `[inferred]` — `packages/shared/src/progress/types.ts:1-21`,
`packages/shared/src/progress/evolution.ts:20-41`.

## 4. Scope

**The first release is a concept rework, not a repair** `[user]`: the six shipped capabilities are raw material for a
new experience whose job is to turn a hiring reader into a contact. This supersedes the "grown organically" shape the
code currently has.

**In scope (first release)**

- A rebuilt front-of-site whose shape is **one-page proof**: a single scroll carrying who I am, what I build, an
  embedded playable puzzle, the engineering proof (tests, CI, federation), how it is built, and contact `[user]`
- The three puzzle engines, the pet/progress system and the six existing capabilities, reused as evidence rather than
  as tabs to be visited `[user]`
- A **warm cream + coral editorial design system** as the single canonical system, replacing the amber terminal, with
  the dead token set deleted and one token source alive `[user]`
- Real routes with prerendered HTML: `/`, `/games`, `/devlog`, `/devlog/:slug` (plus a route per game) — hash routing
  dropped `[user]`
- A crawler-visible surface (per-page title/description/OG image, `sitemap.xml`, `robots.txt`) and a contact path
  (mailto + LinkedIn + GitHub, no backend, no cookie banner) `[user]`
- Making the engineering claims checkable: green test/lint/typecheck, WCAG 2.2 AA by construction with an automated
  a11y gate in CI, architecture documentation that matches the code `[user]`
- **Full restyle of all three games** into the editorial system — header, controls, board, level select and win modal
  per game, in each game's own repository, released and pointer-bumped `[user]` (see OQ-11)
- The virtual pet retired from navigation and reborn as a small live widget at the foot of `/` `[user]`
- Removal of accounts: the cloud-sync UI, the Supabase adaptor, the auth helper and the `VITE_SUPABASE_*` build vars are
  deleted; `ProgressRepository` and `LocalProgressRepository` remain `[user]` (see OQ-03)

**Out of scope**

- A content management system, post authoring UI, comments, tags filtering, RSS `[user: delegated]`
- **Any account, login or cloud sync** — no auth screen, no server-side progress, no cross-device merge `[user]`
- Any analytics or telemetry, and therefore any cookie/consent banner `[user]`
- A fourth game, new puzzle mechanics, or new content beyond re-authoring the bio and posts `[user: delegated]`
- Server-side infrastructure of any kind: no API, no contact form backend, no custom auth provider `[user]`
- Native apps, i18n, offline/service-worker support `[user: delegated]`
- Retrofitting the old amber palette as an alternative theme `[user]` — one system only

## 5. Constraints

- **Deadline**: _not stated anywhere in the repo_
- **Team**: _not stated; commit history shows a single author identity_
- **Budget**: _not stated_
- **Mandated technology**: Module Federation for MFE consumption is structurally mandatory — the host resolves remotes
  from `/mfe/<name>/assets/remoteEntry.js` at runtime `[inferred]` — `packages/shell/vite.config.ts` (`federation`
  remotes), `packages/shell/src/types/remotes.d.ts:1-42`
- **Compliance**: _not stated_. No licence file exists; the third-party font `Zpix` is loaded from jsDelivr and
  `DESIGN.md` names licensed Anthropic fonts (never loaded) `[inferred]` — `packages/shell/index.html`,
  `DESIGN.md:301-400`
- **Package manager**: **pnpm, canonical everywhere** `[user]` — one frozen lockfile, `workspace:*` in every manifest
- **Runtime constraint, discovered**: the workspace dependency `"shared": "*"` is ambiguous — a workspace link exists at
  `node_modules/shared -> ../packages/shared` while pnpm's virtual store also holds the unrelated published npm package
  `shared@0.2.0` (deps `bson`, `mongodb`), which is the root cause of the 12 `tsc` errors and 102 of the 109 lint
  problems `[inferred]` — `packages/shell/package.json`, `packages/shell/vite.config.ts`,
  `node_modules/.pnpm/shared@0.2.0/node_modules/shared/package.json`. Resolved by `workspace:*` + one lockfile (OQ-06)
- **Constraint, discovered**: the committed lockfile is pnpm's, but both CI workflows install with `npm install` and no
  npm lockfile is committed, so deploys resolve fresh versions every run `[inferred]` —
  `.github/workflows/deploy.yml:29`, `packages/sokoban/.github/workflows/build.yml:42`. Aligned to pnpm as part of the
  foundations phase (OQ-06)

## 6. Tech stack

| Layer | Choice | Source | Rationale |
|-------|--------|--------|-----------|
| Language | TypeScript 5.9, `strict` with `noUnusedLocals`/`noUnusedParameters` | `tsconfig.json`, `packages/*/tsconfig.json` | `[inferred]` — no stated reason |
| UI | React 18, `React.lazy` + `Suspense` per MFE | `packages/shell/src/App.tsx:30-55` | `[inferred]` |
| Routing | Hand-rolled `useHashRouter` over `location.hash`; **no router dependency** | `packages/shell/src/hooks/useHashRouter.ts:12-80` | `[inferred]` — hash routing is what makes static GitHub Pages hosting work without rewrites |
| Micro-frontends | `@originjs/vite-plugin-federation` 1.3.5, `react`/`react-dom`/`zustand`/(shell also `@tanstack/react-query`) shared as singletons | `packages/*/vite.config.ts` | `[inferred]` |
| State | Zustand (2 stores in shell, both currently unused) + a `ProgressService` over a repository interface | `packages/shell/src/store/petStore.ts:17-77`, `packages/shared/src/progress/ProgressService.ts:9-87` | `[inferred]` |
| Content | **Markdown files loaded at build time** via `import.meta.glob`; a post is data, not code | `packages/posts/public/posts/` | `[user]` — the inline array and the runtime markdown fetcher are both removed (OQ-10) |
| Persistence | **`localStorage` only**, behind the `ProgressRepository` port | `packages/shared/src/repository/index.ts`, `packages/shared/src/repository/LocalProgressRepository.ts:12` | `[user]` — the port stays so a server-side adaptor can return later |
| Auth | **None** — no accounts, no login | `[user]` — the existing Supabase auth UI and adaptor are deleted |
| Styling | Tailwind 4 + daisyUI 5, with **one** token source: the warm cream + coral editorial system | `packages/shell/src/index.css:5-32` (cream/coral tokens), `DESIGN.md:301-400` | `[user]` — chosen as canonical over the amber terminal currently rendering |
| Typefaces | Display serif + clean UI sans, free-licensed substitutes for the Copernicus/StyreneB pair named in `DESIGN.md` | `DESIGN.md:301-400` | `[inferred]` — the repo contains no font licence and the licensed pair is never loaded; substitutes are an `adf-docs` decision |
| Audio | WebAudio API, per-MFE `RetroSynth` class | `packages/shikaku/src/engine/synth.ts:31`, `packages/slitherlink/src/engine/synth.ts:81` | `[inferred]` |
| Tests | Vitest 3 + Testing Library, `jsdom`, remotes aliased to `MockMfe` | `vitest.config.ts`, `packages/shell/src/components/MockMfe.tsx` | `[inferred]` |
| Build / CI | Vite 6, `tsc -b` per composite project, GitHub Actions, `site:build:static`; installs via `pnpm install --frozen-lockfile` | `.github/workflows/deploy.yml`, `scripts/build-static.sh` | `[user]` — the committed lockfile is pnpm's, so CI must not use npm |

## 7. Data

- **Envelope**: one JSON document per browser, versioned and whole-document —
  `{ version: 1, pets: PetState, games: Record<GameId, GameProgress>, totalPlays, totalXp }`
  `[inferred]` — `packages/shared/src/progress/types.ts:1-21`
- **Storage key**: `cozyos-progress` (single JSON document, whole-document write on every change)
  `[inferred]` — `packages/shared/src/repository/LocalProgressRepository.ts:12`
- **Game ids**: `shikaku`, `sokoban`, `slitherlink` `[inferred]` — `packages/shared/src/progress/types.ts`
- **Per-level record**: best stars, best moves, best time, play count; completion is keyed by level id
  `[inferred]` — `packages/shared/src/progress/types.ts:1-21`
- **Cloud table**: **none** — the `user_progress` table is removed from scope along with accounts `[user]`; the only
  schema that ever described it lives in `docs/superpowers/specs/2026-06-03-supabase-backend-design.md` and is now
  historical
- **Migration / schema files**: none, and none needed `[user]`
- **Seed data**: 50 Shikaku levels, 100 Sokoban levels, 10 Slitherlink levels, all literal arrays
  `[inferred]` — `packages/shikaku/src/levels.ts:3`, `packages/sokoban/src/levels.ts`,
  `packages/slitherlink/src/engine/levels.ts`. Two of the 100 Sokoban levels are unsolvable and are to be fixed
  `[user]` — see OQ-05
- **Content**: 2 posts inline + 2 markdown files under `packages/posts/public/posts/`
  `[inferred]` — `packages/posts/src/PostsApp.tsx:14-36`
- **Retention / privacy**: **no personal data at all** — progress never leaves the browser, so there is no retention
  rule, no data-subject request, and no consent banner to build `[user]`

## 8. Identity and roles

| Role | Can do | Cannot do |
|------|--------|-----------|
| Anonymous visitor (the only end-user role) | Read all content, play all games, accumulate progress locally, earn stars/XP/evolutions | Nothing is gated — there is no account, no login and no server-side data `[user]` |
| Owner / author | Everything, plus push code, edit posts in source, release game remotes from their own repositories | Nothing is role-gated in the UI — there is no admin surface `[inferred]` — `packages/shell/src/App.tsx:186-218` |


## 9. Non-functional requirements

| Area | Requirement | Source |
|------|-------------|--------|
| Performance | The proof page must render its first meaningful screen as prerendered HTML, not wait for a remote bundle; each game remote is a separate chunk fetched only when its route is opened | `[user]` + `[inferred]` — `packages/shell/src/App.tsx:30-55` (lazy + Suspense per tab) |
| Availability | Whatever GitHub Pages provides; no SLA, no uptime monitoring | `[inferred]` — `.github/workflows/deploy.yml` |
| Security / privacy | **No personal data is collected at all** — no account, no email, no server-side row; progress lives only in the visitor's `localStorage` | `[user]` |
| Accessibility | **WCAG 2.2 AA by construction**, with automated a11y checks as a required CI gate: contrast, focus states, keyboard-only puzzle play, reduced-motion variants, semantic landmarks; responsive 360px → 1920px | `[user]` — the amber terminal currently rendering is replaced, so its contrast/pixel-font problems do not carry over |
| Localization | None; all copy is English and inline in components | `[inferred]` — `packages/about/src/AboutApp.tsx:6-25` |
| Audit / logging | None; no logging library, no event pipeline | `[inferred]` — no logger appears in any `package.json` |

## 10. Integrations

| System | Direction | Purpose | Auth | Docs / sandbox | Owner |
|--------|-----------|---------|------|----------------|-------|
| GitHub Pages | deploy target | Serves the assembled static `dist/` | Deploy key / `GITHUB_TOKEN` in Actions | `.github/workflows/deploy.yml` | Repo owner |
| GitHub Releases (per game repo) | inbound at build time | Supply pre-built `dist.tar.gz` for shikaku, sokoban, slitherlink | `GITHUB_TOKEN` (public read) | `.github/workflows/deploy.yml:24-40` | Each submodule repo — OQ-04 |
| GitHub `repository_dispatch` | inbound webhook | Trigger a host redeploy when a game repo releases | `DISPATCH_TOKEN` secret in each game repo | `.github/workflows/deploy.yml:5-11` | Same — OQ-04 |
| jsDelivr CDN | outbound, browser | Served the `Zpix` pixel webfont | none (public) | `packages/shell/index.html` | Third party — **removed** with the amber palette `[user]` |

There are **no data services**: no auth provider, no database, no third-party API and no PII pipeline, because accounts
and cloud sync are out of scope `[user]` (OQ-03). The Supabase project, its anon key and the `VITE_SUPABASE_*` build
secrets are all retired along with the adaptor.

## 11. Environments and deployment

- **Environments**: `development` (Vite dev server, 7 ports) and `production` (static files). No staging, no preview
  environment `[inferred]` — `package.json#scripts.dev`, `.github/workflows/deploy.yml`
- **Hosting / distribution**: GitHub Pages, artifact `./dist`, built by `scripts/build-static.sh` `[inferred]` —
  `.github/workflows/deploy.yml:44-52`. **Adds a prerender step** so each route ships as real HTML `[user]`
- **Code hosting and CI/CD**: GitHub. Host CI on `push: main` and `repository_dispatch: mfe-updated`; each game repo
  has its own `build.yml` that builds, releases, then dispatches `[inferred]` — `.github/workflows/deploy.yml:1-52`,
  `packages/*/.github/workflows/build.yml`
- **Public URL / base path**: **`https://prxxie.github.io/`**, a root user site — the repo is renamed to
  `prxxie.github.io` and served from the domain root, so the absolute `/mfe/<name>/` remote paths and the shell's
  missing `base` are correct as written and no asset path is rewritten `[user]` — OQ-08 answered
- **Install step**: `pnpm install --frozen-lockfile` in the host workflow and in each game repo's `build.yml`, with the
  stray nested `packages/shell/pnpm-lock.yaml` removed `[user]`
- **Local ports**: shell 3000, about 3001, posts 3002, pets 3003, shikaku 3004, sokoban 3005, slitherlink 3006
  `[inferred]` — `package.json#scripts.dev`, each package's `vite.config.ts#server.port`

## 12. Quality expectations

- **Testing**: Vitest, 36 test files / 293 tests, engines unit-tested directly, shell tests with all remotes replaced by
  `MockMfe` `[inferred]` — `vitest.config.ts`, `packages/shell/src/components/MockMfe.tsx`. Verification on 2026-10-23:
  `290 passed / 3 failed`, `tsc --noEmit` exit 2 with 12 errors, `eslint .` exit 1 with 7 errors / 102 warnings — see
  `docs/00-source/adopt-report.md#commands-run`. Those failures are scope, not background: green gates are an in-scope
  deliverable `[user]`
- **Known defect in shipped content**: Sokoban levels `hack-06` and `hack-10` are unsolvable. The search exhausted its
  state space at 46,973 and 66,605 states against a 100,000 cap, and 98 of 100 levels pass, so the solver is sound and
  the level data is wrong `[inferred]` — `packages/sokoban/src/solver/solver.ts:93`, `:134`. Both levels are to be fixed
  in the sokoban repository `[user]` — OQ-05 answered
- **Definition of Done extras**: green `vitest`, `tsc --noEmit` and `eslint`; the automated a11y check passing; every
  story verified in a browser at 360px and 1440px `[user]`

## 13. Delivery

- **Milestones**: **four phases, foundations first** `[user]` — (1) foundations: pnpm everywhere, green `vitest` /
  `tsc` / `eslint` gates, tokens + free-licensed typefaces, prerendered real-path routes, CI a11y gate; (2) the proof
  page: content, embedded puzzle, proof section, contact; (3) games: full restyle of all three in their own repos,
  releases and pointer bumps, plus the Sokoban level fix; (4) launch: metadata, OG images, `sitemap.xml`, `robots.txt`,
  Lighthouse pass, doc sync. Every phase ends deployable and the token set is locked in phase 1, so nothing is themed
  twice
- **Team and roles**: solo — one owner-developer owns design, implementation, content and release `[inferred]` — commit
  history shows a single author identity
- **Product owner (answers open questions)**: the repository owner `[user]`
- **Cadence**: continuous deploy on merge to `main` `[inferred]` — `.github/workflows/deploy.yml:3-12`
- **Reporting**: **none** `[user]` — solo build, no client and no scheduled status reports; the doc set is the record and
  `adf-report` runs only on request
- **Reporting language**: English, matching the docs and the source `[user]`

## 14. Type-specific

### web-app

- **Rendering**: **prerendered static multi-page output** — each route emitted as real HTML with real path URLs; hash
  routing dropped `[user]`. Today it is a client-only hash-routed SPA `[inferred]` —
  `packages/shell/src/hooks/useHashRouter.ts:12-80`
- **Bundle strategy**: one chunk per tab plus one shared vendor chunk; remotes fetched over HTTP at first visit to that
  tab `[inferred]` — `packages/shell/src/App.tsx:30-55`, `packages/*/vite.config.ts#build.target = "esnext"`
- **Browser support**: no `browserslist`, no `browserslist-to-esbuild`; build target is `esnext` and the CSS uses
  `@theme`, `color-mix`, and `@custom-variant`, so modern-browser only `[inferred]` — `packages/shell/vite.config.ts`,
  `packages/shell/src/index.css:5-44`
- **Screens**: `/` the one-page proof (bio, what-I-build, embedded puzzle, proof, how-it-was-built, contact, and the
  pet widget in the footer); `/games` hub with three tiles; one route per game; `/devlog` index; `/devlog/:slug` `[user]`
  — see § 4. The pet has no route of its own `[user]`
- **SEO / sharing**: **in scope** — per-page `<title>`, description, Open Graph + Twitter card image, `sitemap.xml`,
  `robots.txt` `[user]`. Today: none, no meta description, no OG tags `[inferred]` — `packages/shell/index.html`
- **Offline**: not supported; no service worker, no manifest `[inferred]` — no `public/manifest.json`, no `sw.ts`
- **Analytics / consent**: **none, deliberately** — attribution is a question in the contact reply, so no cookie banner
  is needed `[user]`

## 15. Assumptions and open questions

As of the interview only — later questions live in `docs/04-decisions/open-questions.md`.

| Id | Topic | Assumption in use |
|----|-------|-------------------|
| OQ-01 | Audience and success measure | **Answered** — portfolio for hiring; ≥ 1 inbound contact per month |
| OQ-02 | Canonical design system | **Answered** — warm cream + coral editorial, single system |
| OQ-03 | Cloud sync ownership | **Answered** — accounts and sync are cut; local-only behind the port |
| OQ-04 | Game submodule ownership | The three game MFEs ship with the product; defects are triaged in their own repos |
| OQ-05 | Sokoban `hack-06` / `hack-10` | **Answered** — the solver is sound; both levels are to be fixed in the submodule |
| OQ-06 | Package manager | **Answered** — pnpm is canonical: `workspace:*` everywhere, one frozen lockfile, CI switched off npm |
| OQ-11 | Game restyle scope | **Answered** — all three games are fully restyled in their own repos |
| OQ-07 | NFR targets | **Answered** — WCAG 2.2 AA with a CI gate; no CRT exception |
| OQ-08 | Public URL | **Answered** — root user site at `https://prxxie.github.io/`; no `base`, no path rewrite |
| OQ-09 | `DESIGN.md` + `docs/superpowers/` | **Answered** — deleted, after `adf-docs` extracts the still-true facts (design tokens, solver rationale) into the live doc set |
| OQ-10 | Posts content model | **Answered** — markdown files read at build time via `import.meta.glob`; post is data, not code |
