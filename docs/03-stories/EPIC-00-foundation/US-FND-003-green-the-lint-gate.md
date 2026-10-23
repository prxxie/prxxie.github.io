---
id: US-FND-003
title: Green the lint gate
epic: EPIC-00-foundation
status: ready
priority: P0
size: M
depends_on: [US-FND-001]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/conventions.md", "01-overview/conventions.md"]
---

# US-FND-003 — Green the lint gate

## 1. Story

**As a** owner-developer
**I want** `pnpm lint` to exit 0 with zero errors and zero warnings
**so that** a red lint gate stops being background noise and starts protecting the code.

## 2. Context

Lint currently reports 7 errors and 102 warnings. Most warnings come from the shadowed `shared` package; the rest are real signals — unused imports, `any` in tests, missing hook dependencies. The story ends with a gate that fails only on a genuine new problem.

**NFRs**: NFR-18, NFR-19

| Topic | Reference |
|-------|-----------|
| Conventions | [conventions.md](../../01-overview/conventions.md) |
| Rule 01 | [conventions.md](../../01-overview/conventions.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | a tree with US-FND-001 done | `pnpm lint` runs | it exits 0 and reports 0 problems |
| AC2 | any rule that had to change | the configuration is read | the change is a documented, narrow override with a comment — not a repo-wide disable |
| AC3 | the engine test suites | lint runs | they are still linted, not excluded |
| AC4 | `AGENTS.md` and `environment-setup.md` | the story is done | their lint rows state the passing result |

## 4. Contract

No new lint rule is added in this story; the existing configuration is honoured or narrowed with a recorded reason.

## 5. Rules and edge cases

- Prefer deleting dead code over silencing a rule.
- `packages/*/src/engine/**` must stay linted — it is the code with the most logic per line.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Adopting a new lint preset or formatter.

## 8. Test notes

The gate itself: `pnpm lint` in CI.

## 9. Open questions

None.
