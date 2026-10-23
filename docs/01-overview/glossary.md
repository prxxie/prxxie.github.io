# Glossary

Terms the product uses, and the identifier each one has in code. When a doc needs to name a concept, use the code name
column so the code, the docs and the tests agree.

## Domain terms

| Term | Meaning | Code name | Notes |
|------|---------|-----------|-------|
| Progress document | The single JSON object holding everything a visitor has earned on this device | `ProgressState` | `packages/shared/src/progress/types.ts:17-21`; one `localStorage` write replaces the whole object |
| Completed level | One puzzle solution record: which game, which level, when, how well | `CompletedLevel` | `{ module, levelId, completedAt, stars }` |
| Game module | The identifier of the puzzle a level belongs to | `module` (values `shikaku`, `sokoban`, `slitherlink`) | A plain string, not a union: an unknown module still records |
| Level id | The stable id of a level inside its game | `levelId` | Stable ids matter: progress is keyed on `(module, levelId)` |
| Stars | Rating earned on a level, 1–3, kept at the best value ever achieved | `stars` | Re-completing with fewer stars returns `false` and writes nothing |
| XP | Experience the pet has accumulated, one per feed | `pet.xp` | Nothing else raises it |
| Evolution stage | The pet's growth tier, 1–5, derived from XP | `pet.stage` | Thresholds `0, 10, 30, 60, 100` at `packages/shared/src/pet/evolution.ts:1-8`; always recomputed from XP on load |
| Happiness | Affection level, 0–100, decaying over time | `pet.happiness` | `lastPlayedAt` is the decay basis; playing adds 20, capped at 100 |
| Hunger level | How hungry the pet is, 0–5 | result of `getHungryLevel()` | 5 means starved; a pet that was never fed reads 5 |
| Hunger cooldown | Time one unit of hunger takes to accumulate | `HUNGER_COOLDOWN` (10 minutes) | Doubled while the pet sleeps |
| Happiness cooldown | Time one unit of happiness decay takes | `HAPPINESS_COOLDOWN` (10 minutes) | Quadrupled while the pet sleeps |
| Food | Feed charges earned by playing, spent by feeding | `foodConsumed`, result of `getFoodAvailable()` | Available food is total stars minus `foodConsumed` |
| Sleeping | A pet state that slows hunger and happiness decay | `pet.isSleeping` | Feeding wakes the pet; playing is blocked while asleep |
| Pet state | The pet's own sub-document | `PetState` | `{ xp, stage, lastFedAt, happiness, lastPlayedAt, isSleeping }` |
| Progress service | The domain service the UI talks to; validates and derives | `ProgressService` | `packages/shared/src/progress/service.ts:7` |
| Progress repository | The storage port; one implementation survives | `ProgressRepository` | `packages/shared/src/repository/ProgressRepository.ts:3-12` |
| Storage key | The `localStorage` key of the progress document | `cozyos.progress.v1` (`STORAGE_KEY`) | `packages/shared/src/repository/LocalProgressRepository.ts:5`; a schema change needs a new key |
| Progress event | The browser event fired after any successful write | `cozyos:progress-updated` | `CustomEvent` on `window`; the shell listens and re-reads |

## Architecture terms

| Term | Meaning | Code name | Notes |
|------|---------|-----------|-------|
| Shell | The host application: routing, layout, tokens, remote resolution | `shell` (package `shell`, federation name `shell`) | `packages/shell` |
| Remote / MFE | A separately built bundle the host loads at runtime | federation `name`, e.g. `shikaku` | one per package, `remoteEntry.js` as its entry |
| Remote entry | The manifest the host fetches to resolve a remote | `/mfe/<name>/assets/remoteEntry.js` | mapped in `packages/shell/vite.config.ts:27-32` |
| Exposed component | The single module a remote publishes | `./AboutApp`, `./PostsApp`, `./PetsApp`, `./ShikakuApp`, `./SokobanApp`, `./SlitherlinkApp` | declared in each package's `vite.config.ts` |
| MFE base path | The URL prefix a remote's assets resolve against | `/mfe/<name>/` | `packages/about/vite.config.ts:8` |
| Assembly | The step that copies every built package into one deployable `dist/` | `scripts/build-static.sh` | produces `dist/mfe/<name>/` |
| Pointer bump | The commit that advances a game submodule to a new release | git submodule update | the mechanism that ships a restyled game (OQ-11) |
| Prerender | Rendering a route to an HTML file during the build | build step, ADR-0009 | shell chrome only; remotes hydrate client-side |
| Devlog | The posts feature, after the rework | `/devlog`, `/devlog/<slug>` | markdown compiled at build time (ADR-0006) |
| One-page proof | The front page's shape: a single scroll of evidence ending in a contact path | `/` | brief § 4 |

## Allowed values

| Kind | Values | Where |
|------|--------|-------|
| Route | `/`, `/games`, `/games/shikaku`, `/games/sokoban`, `/games/slitherlink`, `/devlog`, `/devlog/<slug>` | routes after ADR-0002; today `#/home`, `#/about`, `#/posts`, `#/shikaku`, `#/sokoban`, `#/slitherlink` |
| Legacy tab | `home`, `about`, `posts`, `shikaku`, `sokoban`, `slitherlink` | `Tab` in `packages/shell/src/types.ts:1`; deleted with hash routing |
| Game id | `shikaku`, `sokoban`, `slitherlink` | progress `module`, federation name |
| Pet status | `idle`, `eating`, `playing`, `sleeping` | `PetStatus` in `packages/shell/src/types.ts:3` |
| Evolution stage | `1`, `2`, `3`, `4`, `5` | `EVOLUTION_THRESHOLDS` |
| Progress event name | `cozyos:progress-updated` | dispatched by `ProgressService`, listened for by the shell |
