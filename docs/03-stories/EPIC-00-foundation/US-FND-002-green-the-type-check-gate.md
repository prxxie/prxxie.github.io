---
id: US-FND-002
title: Green the type-check gate
epic: EPIC-00-foundation
status: ready
priority: P0
size: M
depends_on: [US-FND-001]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/conventions.md", "04-decisions/adr/ADR-0005-pnpm-workspace.md"]
---

# US-FND-002 — Green the type-check gate

## 1. Story

**As a** owner-developer
**I want** `pnpm typecheck` to exit 0 with no suppressions
**so that** the claim that the code is typed is true and the gate can be trusted.

## 2. Context

Twelve `tsc --noEmit` errors stand between the repository and an honest type gate; the first is `packages/pets/src/PetsApp.tsx(91,20): error TS2769`, a `Timeout | null` passed where `clearTimeout` wants a `Timeout | undefined`. Most of the rest follow from the shadowed `shared` package fixed in US-FND-001, so this story is the remainder plus the proof that the gate is green.

**NFRs**: NFR-18

| Topic | Reference |
|-------|-----------|
| Conventions | [conventions.md](../../01-overview/conventions.md) |
| ADR-0005 | [ADR-0005-pnpm-workspace.md](../../04-decisions/adr/ADR-0005-pnpm-workspace.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | a tree with US-FND-001 done | `pnpm typecheck` runs | it exits 0 and prints no error |
| AC2 | the same tree | the remaining errors are fixed | none of them is silenced with `as any`, `@ts-ignore` or a widened `any` |
| AC3 | `packages/pets/src/PetsApp.tsx` | the timer ref is typed | it holds `ReturnType<typeof setTimeout> | null` and the clear path narrows before use |
| AC4 | `AGENTS.md` and `environment-setup.md` | the story is done | their type-check rows state the passing result instead of the old 12 errors |

## 4. Contract

The timer type is `ReturnType<typeof setTimeout> | null`; no DOM/Node `Timeout` type is imported into app code.

## 5. Rules and edge cases

- A real fix beats a suppression: if a type is wrong, correct the shape in `packages/shared/src/progress/types.ts`.
- Keep `strict`, `noUnusedLocals` and `noUnusedParameters` on.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Changing the test setup to make types pass.

## 8. Test notes

The gate itself is the test: `pnpm typecheck` in CI. Add one unit test only if a type fix changes runtime behaviour.

## 9. Open questions

None.
