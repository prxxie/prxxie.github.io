---
id: ADR-0004
title: Keep progress local to the browser behind the ProgressRepository port
status: accepted
date: 2026-06-14
supersedes: []
---

# ADR-0004 — Keep progress local to the browser behind the ProgressRepository port

## Context

The shell wires a Supabase client, an OAuth modal and a cloud adaptor (`packages/shell/src/utils/supabase.ts`,
`packages/shell/src/components/CloudSyncModal.tsx`, `packages/shared/src/repository/SupabaseProgressRepository.ts`)
beside a `localStorage` adaptor, and picks between them at runtime in
`packages/shell/src/hooks/useProgressService.tsx:47-52`. Accounts bring a login surface, a data store, RLS policies and
a privacy statement to a portfolio that needs none of them, and the pet is becoming a footer widget rather than a
destination (brief § 4, OQ-03).

## Decision

Progress is local only. `ProgressRepository` stays as the port, `LocalProgressRepository` as the sole adaptor, and
everything cloud-related is deleted: the modal, the auth helper, the Supabase adaptor, the `@supabase/supabase-js`
dependency and the `VITE_SUPABASE_*` build variables.

## Options considered

| Option | Pros | Cons |
|--------|------|------|
| **Local-only behind the port** | No auth, no data store, no consent banner, no privacy policy; the port keeps a swap cheap | Progress does not follow a visitor between devices |
| Keep cloud sync for signed-in users | Cross-device progress | The whole account surface exists to sync a game's star count |
| Drop persistence entirely | Simplest | The pet's evolution and the level progress are what make the exhibit feel alive |

## Consequences

- The progress document lives in `localStorage` under `cozyos.progress.v1`
  (`packages/shared/src/repository/LocalProgressRepository.ts:5`), so a schema change needs a new key or a migration.
- The repository has no personal data to protect, which is also what makes the no-consent-banner decision (ADR-0007)
  defensible.
- Two test files and the `SupabaseProgressRepository` module are deleted with the adaptor.
