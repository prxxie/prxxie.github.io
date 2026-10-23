# Non-functional requirements

Each requirement has an id so a story can cite it. `adf-plan` links stories to these ids; the verifier warns when an
NFR is never referenced. Numbers that the code already fixes are marked `[inferred]` with their location.

## Performance

| Id | Requirement | Measure |
|----|-------------|---------|
| NFR-01 | The first screen is prerendered HTML: the front page's headline, the puzzle container and the contact block are readable before any JavaScript executes (ADR-0002) | the prerendered `/` document contains those three regions without running scripts |
| NFR-02 | A game remote is fetched only when its route is opened, never on first paint | no `/mfe/<game>/assets/remoteEntry.js` request while `/` is displayed |
| NFR-03 | A loading remote never leaves an empty frame: a placeholder renders within one frame of the route change | `MfeLoader` is visible during the import, `Fallback` on failure (`packages/shell/src/App.tsx:15-67`) |
| NFR-04 | The first interaction responds without waiting for a network round trip: pointer and keyboard input on a board is handled locally | no network request between input and board update |

## Availability and resilience

| Id | Requirement | Measure |
|----|-------------|---------|
| NFR-05 | Uptime is whatever GitHub Pages provides; no SLA, no monitoring, no on-call | operational — no code requirement |
| NFR-06 | One unreachable remote degrades to a named placeholder while the rest of the page keeps working | the offline remote's `Fallback` renders and the other regions stay interactive |
| NFR-07 | A corrupted or absent progress document never breaks the page; the visitor starts from a default state | invalid JSON in `localStorage` yields `completedLevels: []` and stage 1 (`packages/shared/src/repository/LocalProgressRepository.ts:75-92`) |

## Security and privacy

| Id | Requirement | Measure |
|----|-------------|---------|
| NFR-08 | No personal data is collected: no account, no email capture, no server-side row, no third-party script that would need consent | zero network requests carrying user data; no consent banner exists (ADR-0007) |
| NFR-09 | Progress never leaves the device | every write goes to `localStorage` under `cozyos.progress.v1` |
| NFR-10 | The build needs no secrets | no `VITE_*` secret remains after the cloud adaptor is deleted (ADR-0004) |
| NFR-11 | No dependency with a known critical advisory ships in the deploy artifact | `pnpm audit --prod` reports no critical advisory |

## Accessibility

| Id | Requirement | Measure |
|----|-------------|---------|
| NFR-12 | Every page meets WCAG 2.2 AA | automated check in CI reports no serious or critical violation on the seven routes (ADR-0008) |
| NFR-13 | All three puzzles are playable with the keyboard alone | a level can be completed with no pointer event |
| NFR-14 | Motion respects the visitor's preference and focus is always visible | `prefers-reduced-motion` variants exist for every animation; a visible focus ring on every interactive element |
| NFR-15 | The layout works from 360px to 1920px wide | no horizontal scroll and no clipped control at either bound |

## Localization

| Id | Requirement | Measure |
|----|-------------|---------|
| NFR-16 | English only; copy stays inline in components; dates render in one fixed format | no i18n library, no locale switch, no `Intl` locale negotiation |

## Audit, logging and observability

| Id | Requirement | Measure |
|----|-------------|---------|
| NFR-17 | No logging library and no telemetry in the shipped bundle; failures surface in the browser console and nowhere else | operational — deliberately nothing to monitor, consistent with NFR-08 |

## Quality gates

| Id | Requirement | Measure |
|----|-------------|---------|
| NFR-18 | A deploy only happens from a tree where test, lint and typecheck passed | the deploy workflow fails on any of `pnpm test`, `pnpm lint`, `pnpm typecheck` |
| NFR-19 | Engine logic is covered by tests that do not need a browser | each game's `engine/` and `solver/` suites run in the node environment |
| NFR-20 | Installs are reproducible | `pnpm install --frozen-lockfile` succeeds with the committed lockfile (ADR-0005) |

## Compatibility

| Id | Requirement | Measure |
|----|-------------|---------|
| NFR-21 | The site targets the last two versions of each evergreen browser on desktop and mobile; no transpilation for legacy browsers beyond Vite's `esnext` target | the built bundle loads in the evergreen set; no polyfill bundle is shipped |
| NFR-22 | Content is reachable with JavaScript disabled up to the prerendered HTML, and the contact path works without scripts | `/` renders its text and its `mailto:` link with scripting off |
