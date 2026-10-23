---
id: US-HOME-003
title: Print the proof from the build
epic: EPIC-03-home
status: done
priority: P2
size: M
depends_on: [US-HOME-001, US-FND-005]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/nonfunctional-requirements.md", "01-overview/deployment.md"]
---

# US-HOME-003 — Print the proof from the build

## 1. Story

**As a** skeptical visitor
**I want** the page to state facts about itself that are computed, not typed
**so that** the numbers on the page are true the day they ship.

## 2. Context

The proof section is the quiet argument of the site: test count, gates that run in CI, the number of remote bundles, the number of generated levels. Typed numbers rot within a week, so they are emitted at build time from the same sources the gates read, and the section renders them from that artifact.

**NFRs**: NFR-18

| Topic | Reference |
|-------|-----------|
| NFRs | [nonfunctional-requirements.md](../../01-overview/nonfunctional-requirements.md) |
| Deployment | [deployment.md](../../01-overview/deployment.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the build | it runs | it writes a facts file containing the test count, the gate list and the remote count |
| AC2 | the home page | it is rendered | each figure comes from the facts file and matches what the gates report |
| AC3 | a gate starts failing | the build runs | the proof section cannot claim a passing gate |
| AC4 | the facts file | a value is removed | the build fails or the section degrades to a named placeholder — never to a stale number |
| AC5 | the section | it is read by a screen reader | each figure is a labelled value, and the labels are text |

## 4. Contract

`build-facts.json` in `dist/`, produced by the static build script, shape `{ tests: number, files: number, gates: {name, passing}[], remotes: number, levels: number }`. The home page imports it at build time.

## 5. Rules and edge cases

- A figure with no source is deleted, not estimated.
- The facts file is committed only if it is generated in CI, never hand-edited.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Any live dashboard or historical chart.

## 8. Test notes

Build test: the facts file exists after a build and its test count matches the runner output; component test for the rendering of each figure.

## 9. Open questions

None.

## 10. Outcome

Commit `5677817`. `scripts/build-facts.mjs` runs the typecheck, lint and test gates, reads the counts the runner reported, counts test files and remotes from the tree, and writes `packages/shell/src/generated/build-facts.json` (and `dist/`, once assembled). A failing gate aborts the build before the page can claim it. The proof section prints those numbers, or "not measured yet" where no source exists (the level count lands with US-GAME-001). Proven by `homePage.test.tsx` and the `build:facts` script.
