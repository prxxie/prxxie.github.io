# Project overview

## Purpose

A personal site that exists to turn a hiring reader into a contact. It carries three playable logic puzzles, a virtual
pet that grows from play, and a devlog — not as separate destinations, but as the evidence behind an engineering claim:
one person builds, tests, ships and versions this inside a Module Federation monorepo with three independently released
game repositories. Read recursively, the site is the proof that the site could be built.

The current code is the raw material, not the plan. The first release is a concept rework (brief § 4): the six shipped
capabilities are reused as evidence, the amber CRT presentation is replaced by a warm cream and coral editorial system
(ADR-0001), and the SPA is replaced by prerendered real routes (ADR-0002).

## Users and actors

| Actor | Description | What they need |
|-------|-------------|----------------|
| Hiring reader (the only end-user role) | A recruiter, engineering manager or peer spending two minutes deciding whether to reach out | A first screen that says what this person builds, a puzzle that responds immediately, and a contact link within reach |
| Visitor who plays | The same person, going deeper into a game or the devlog | Progress that survives a reload, a board that responds to keyboard and pointer, and no signup |
| Owner / author | The single maintainer | Edit content in source, ship a game from its own repository, deploy without ceremony |

## Goals and success measures

| Goal | Measure | Source |
|------|---------|--------|
| Convert a reader into a contact | One inbound contact per month | brief § 2 |
| The proof is checkable, not asserted | Green test, lint and typecheck on every deploy; an automated accessibility gate; architecture docs that match the code | brief § 4, § 9 |
| The exhibit works on first touch | A puzzle is playable on the first screen without a navigation step | brief § 4, § 14 |
| The engineering claim is visible to a crawler too | Real routes, prerendered HTML, per-page title, description and OG image, `sitemap.xml`, `robots.txt` | brief § 4, § 14 |

## In scope (first release)

| Area | What ships | Source |
|------|-----------|--------|
| One-page proof | A single scroll on `/`: who I am, what I build, a playable puzzle, the engineering evidence, how it is built, contact | brief § 4 |
| Design system | Cream and coral editorial tokens as the only system, declared once in `packages/shell/src/index.css`; amber CRT, pixel chrome and the daisyUI theme removed | ADR-0001 |
| Real routes | `/`, `/games`, `/games/shikaku`, `/games/sokoban`, `/games/slitherlink`, `/devlog`, `/devlog/<slug>` — prerendered, hash routing deleted | ADR-0002, ADR-0009 |
| Crawler surface | Per-route metadata, OG image, `sitemap.xml`, `robots.txt` | brief § 14 |
| Games | Shikaku, Sokoban and Slitherlink restyled into the token set inside their own repositories, released, pointer bumped | OQ-11 |
| Pet | Retired from navigation, reborn as a live widget at the foot of `/` | brief § 4 |
| Progress | Local-only star/XP progress behind `ProgressRepository`; accounts, cloud sync and `VITE_SUPABASE_*` deleted | ADR-0004 |
| Content | Devlog posts as markdown compiled at build time; bio and posts re-authored for a hiring reader | ADR-0006 |
| Contact | `mailto:` plus LinkedIn and GitHub links, no form and no backend | ADR-0007 |

## Out of scope

A CMS, an authoring UI, comments, tag filtering and RSS (delegated); any account, login, cloud sync or cross-device
merge; analytics, telemetry and therefore any cookie or consent banner; a fourth game, new puzzle mechanics or content
beyond re-authoring the bio and posts; server-side infrastructure of any kind, including a contact-form backend; native
apps, internationalisation and offline/service-worker support; retrofitting the amber palette as an alternative theme.
Sources: brief § 4, ADR-0004, ADR-0007.

## Constraints

| Constraint | Detail |
|------------|--------|
| Integration mechanism | Module Federation is structurally mandatory: the host resolves `/mfe/<name>/assets/remoteEntry.js` at runtime, so games cannot become ordinary imports without changing the exhibit |
| Package manager | pnpm only, one frozen lockfile (ADR-0005) |
| Hosting | GitHub Pages user site at `https://prxxie.github.io/`, static artifact, no server runtime (ADR-0002, OQ-08) |
| Team | One author; no reviewer other than the author's own gates |
| Deadline and budget | Not stated |
| Accessibility | WCAG 2.2 AA with an automated gate (ADR-0008) |

## Key numbers

| Kind | Count | Detail |
|------|-------|--------|
| Packages | 8 | `shell`, `about`, `posts`, `pets`, 3 game remotes, `shared` |
| Module Federation remotes | 6 | each exposing one `./XxxApp` from `remoteEntry.js` |
| Routes after rework | 7 declared | `/`, `/games`, 3 game routes, `/devlog`, `/devlog/<slug>` |
| Puzzles | 3 engines | Shikaku, Sokoban, Slitherlink |
| Baked levels | 160 | 50 Shikaku + 100 Sokoban + 10 Slitherlink |
| Devlog posts | 2 today | 2 inline entries plus 2 markdown files, consolidating to files (ADR-0006) |
| External integrations | 1 | GitHub Pages and GitHub Releases, both via the deploy workflow |
| Persistent data stores | 1 | the browser's `localStorage`, no server-side store |
