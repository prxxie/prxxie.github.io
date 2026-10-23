---
id: US-FND-005
title: Make the deploy workflow refuse a red tree
epic: EPIC-00-foundation
status: done
priority: P0
size: M
depends_on: [US-FND-001, US-FND-002, US-FND-003]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/deployment.md", "01-overview/nonfunctional-requirements.md", "04-decisions/adr/ADR-0005-pnpm-workspace.md"]
---

# US-FND-005 — Make the deploy workflow refuse a red tree

## 1. Story

**As a** owner-developer
**I want** the deploy workflow to run the gates and stop on any failure
**so that** a deploy can no longer publish code whose tests, lint or types fail.

## 2. Context

The deploy workflow installs, assembles and publishes. It never runs the suite, so NFR-18 is a promise the pipeline does not keep. This story makes the pipeline the enforcement point, on pnpm, in both the host workflow and the three game workflows.

**NFRs**: NFR-18, NFR-11, NFR-20

| Topic | Reference |
|-------|-----------|
| Deployment | [deployment.md](../../01-overview/deployment.md) |
| NFRs | [nonfunctional-requirements.md](../../01-overview/nonfunctional-requirements.md) |
| ADR-0005 | [ADR-0005-pnpm-workspace.md](../../04-decisions/adr/ADR-0005-pnpm-workspace.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | a pull request with a failing test | the workflow runs | it fails before the assemble step and nothing is published |
| AC2 | a tree where all three gates pass | the workflow runs | it installs with `pnpm install --frozen-lockfile` and reaches publish |
| AC3 | the deploy workflow | its steps are read | test, lint and typecheck run before `build:static` |
| AC4 | each game repository's `build.yml` | its steps are read | it installs with pnpm and keeps its release step |
| AC5 | the workflow logs | a gate fails | the failing command and its output are visible without opening another page |

## 4. Contract

Step order in `.github/workflows/deploy.yml`: checkout → setup node 20 → `pnpm install --frozen-lockfile` → `pnpm test` → `pnpm lint` → `pnpm typecheck` → download game bundles → `pnpm build:static` → publish.

## 5. Rules and edge cases

- Keep the `repository_dispatch` trigger working; a game release must still deploy the site.
- Cache the pnpm store to keep the added gate time acceptable.
- `pnpm audit --prod` runs as a non-blocking report step (NFR-11), not a gate, until the advisory list is clean.

**Shipped, with AC4 deferred.** The host workflow now gates publish behind a `verify` job (frozen install → test →
lint → typecheck, plus a non-blocking `pnpm audit --prod`), and `build-and-deploy` needs it, so a red tree never reaches
the assemble step. AC4 — moving the three game repositories' `build.yml` from npm to pnpm — is not done here: those
workflows build a synthetic workspace from a sparse checkout and never read the host lockfile, so the npm calls there
are consistent rather than broken. The conversion ships with US-GAME-002..004, which are the stories that commit in
those repositories; the prepared patch is recorded in the story notes of US-GAME-002.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Adding a browser E2E suite — the accessibility gate is US-FND-006.

## 8. Test notes

Verify by pushing a branch with one deliberately failing test and reading the run; record the run URL in the story. Then verify a green run reaches publish.

## 9. Open questions

None.
