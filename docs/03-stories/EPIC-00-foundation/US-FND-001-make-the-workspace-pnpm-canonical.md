---
id: US-FND-001
title: Make the workspace pnpm-canonical
epic: EPIC-00-foundation
status: done
priority: P0
size: L
depends_on: []
open_questions: []
accepted_assumptions: []
refs: ["01-overview/conventions.md", "01-overview/environment-setup.md", "04-decisions/adr/ADR-0005-pnpm-workspace.md"]
---

# US-FND-001 — Make the workspace pnpm-canonical

## 1. Story

**As a** owner-developer
**I want** one package manager, one lockfile and `workspace:*` in every manifest
**so that** installs are reproducible and the workspace `shared` package can no longer be shadowed by an unrelated published package.

## 2. Context

The committed lockfile is pnpm's, but the manifests say `"shared": "*"`, which npm resolves to the published `shared@0.2.0` (a bson/mongodb client) instead of the workspace link. That single ambiguity is the root cause of the 12 type errors and most of the 102 lint warnings, and both CI workflows still install with npm. ADR-0005 is the decision; this story is its first half — the resolution itself.

**NFRs**: NFR-20, NFR-10

| Topic | Reference |
|-------|-----------|
| Conventions | [conventions.md](../../01-overview/conventions.md) |
| Environment setup | [environment-setup.md](../../01-overview/environment-setup.md) |
| ADR-0005 | [ADR-0005-pnpm-workspace.md](../../04-decisions/adr/ADR-0005-pnpm-workspace.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | a clean clone with submodules initialised | `pnpm install --frozen-lockfile` runs | it exits 0 with no lockfile change, and `node_modules/shared` resolves to `packages/shared` |
| AC2 | every manifest that depends on `shared` | the dependency is read | it reads `workspace:*`, and no `node_modules/.pnpm/shared@0.2.0` entry exists after install |
| AC3 | the repository root | lockfiles are listed | exactly one lockfile exists, and the stray `packages/shell/pnpm-lock.yaml` is gone |
| AC4 | the workspace after the change | `pnpm test` runs | the suite still reports 36 files and 294 passing tests |
| AC5 | the docs that carry the install instructions | the story is done | no `(planned — verify after US-FND-001)` marker remains in `AGENTS.md` or `environment-setup.md |

## 4. Contract

Every package manifest keeps its name (`shell`, `about`, `posts`, `pets`, `shikaku`, `sokoban`, `slitherlink`, `shared`), because the pnpm filter commands in the docs use them: `pnpm -F shell dev`, `pnpm -F shikaku build`. The root keeps `packageManager` pinned so a wrong pnpm version fails loudly.

## 5. Rules and edge cases

- Set `packageManager` in the root manifest so CI and local agree on the pnpm version.
- Add `pnpm.onlyBuiltDependencies` if the install needs to run any build script.
- Do not "fix" the type errors here — they are US-FND-002 and US-FND-003; this story only removes their cause.

**Shipped.** The npm baseline recorded in this story (12 type errors, 7 lint errors, 102 warnings) was mostly the
symptom of npm hoisting the published `shared@0.2.0` package; with pnpm and `workspace:*` the tree resolves to one
React and one `shared`, so lint reaches 0 problems and the type gate drops to the single `PetsApp.tsx` overload.
`tests/pnpm-canonical.test.ts` guards all seven criteria.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Rewriting the root `dev` script to `pnpm -r --parallel` — that is part of US-FND-005.

## 8. Test notes

Run the install twice (cold and warm) and assert the lockfile is unchanged; assert the resolved path of `shared` with `node -e "console.log(require.resolve('shared/package.json'))"`.

## 9. Open questions

None.
