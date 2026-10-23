---
id: US-FND-004
title: Delete the cloud-sync code path
epic: EPIC-00-foundation
status: done
priority: P1
size: M
depends_on: [US-FND-001]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/data/README.md", "04-decisions/adr/ADR-0004-local-only-progress.md", "01-overview/deployment.md"]
---

# US-FND-004 — Delete the cloud-sync code path

## 1. Story

**As a** owner-developer
**I want** the accounts and Supabase code path removed from the repository
**so that** the product has no account surface, no key and no dead code that suggests one.

## 2. Context

The shell still ships a cloud-sync modal, a Supabase client helper, a `SupabaseProgressRepository`, an auth helper and two `VITE_SUPABASE_*` build variables. The brief cuts all of it (ADR-0004) while keeping the `ProgressRepository` port so a server-side adaptor can return later. Deleting it removes the last thing that could collect personal data.

**NFRs**: NFR-08, NFR-09, NFR-10

| Topic | Reference |
|-------|-----------|
| Data model | [README.md](../../02-reference/data/README.md) |
| ADR-0004 | [ADR-0004-local-only-progress.md](../../04-decisions/adr/ADR-0004-local-only-progress.md) |
| Deployment | [deployment.md](../../01-overview/deployment.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the shell | the source tree is searched for `supabase` | no import, component, helper or variable remains |
| AC2 | `package.json` files | dependencies are read | `@supabase/supabase-js` appears in none of them |
| AC3 | the workflows and env example | secrets are listed | no `VITE_SUPABASE_*` variable is referenced |
| AC4 | a browser with no Supabase configuration | the site loads and a level is solved | progress persists under `cozyos.progress.v1` through `LocalProgressRepository` |
| AC5 | the test suite | it runs | tests that asserted the cloud adaptor are deleted rather than skipped, and the suite is green |

## 4. Contract

The surviving surface is the port (`packages/shared/src/repository/ProgressRepository.ts`) and the local adaptor (`packages/shared/src/repository/LocalProgressRepository.ts`). Nothing else about progress changes.

## 5. Rules and edge cases

- The port keeps `dispose?()` — the local adaptor implements it as a no-op.
- Do not rename `ProgressService` methods while deleting: the games call them.

**Shipped.** Deleted the modal, the Supabase client helper, the auth effect in `App.tsx`, the HUD cloud button, the
cloud adaptor and its tests, the dependency in both manifests, and the two workflow variables; the provider now builds
`ProgressService` on `LocalProgressRepository`. `tests/no-cloud-sync.test.ts` keeps the path from coming back.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Removing `ProgressRepository` itself, or adding a second adaptor.
- Migrating data out of a cloud row — there is none to migrate (NFR-09).

## 8. Test notes

Assert the deletion with a repository-wide search test or a lint rule; assert persistence with the existing `LocalProgressRepository` suite.

## 9. Open questions

None.
