---
id: US-SITE-005
title: Land the old hash links on their pages
epic: EPIC-02-site-shell
status: done
priority: P2
size: S
depends_on: [US-SITE-001]
open_questions: []
accepted_assumptions: []
refs: ["04-decisions/adr/ADR-0009-router-and-prerender-toolchain.md"]
---

# US-SITE-005 — Land the old hash links on their pages

## 1. Story

**As a** visitor with an old bookmark
**I want** the fragment URL to open the page it used to open
**so that** an old link keeps working after the routing change.

## 2. Context

The current site addresses pages as `#about`, `#posts`, `#shikaku` and so on. Those links exist in the wild — in the previous site, in shared messages, in the devlog posts themselves. This small story maps them once so nothing silently 404s.

| Topic | Reference |
|-------|-----------|
| ADR-0009 | [ADR-0009-router-and-prerender-toolchain.md](../../04-decisions/adr/ADR-0009-router-and-prerender-toolchain.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | an old URL such as `/#shikaku` | it is opened | the shikaku game route renders and the address bar shows the new path |
| AC2 | an old URL with an unknown fragment | it is opened | the not-found screen renders, not a loop |
| AC3 | the mapping | it is read | it covers `about`, `posts`, `shikaku`, `sokoban`, `slitherlink`, `pets` and the empty fragment |
| AC4 | any page after the redirect | the back button is pressed | the browser returns to the previous page without re-triggering the redirect |

## 4. Contract

One table of legacy fragment → path, applied once on mount when a fragment is present, using a replace navigation so the history has no duplicate entry.

## 5. Rules and edge cases

- `#pets` maps to `/` — the pet has no route of its own (US-PET-001).

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Keeping the hash router for any live use.

## 8. Test notes

Router test: each legacy value resolves to the expected path; a second navigation does not loop.

## 9. Open questions

None.

## 10. Outcome

Commit `66388a0`. `packages/shell/src/hooks/useLegacyHashRedirect.ts` maps every pre-router fragment (`#posts` → `/devlog`, `#pets` → `/`, each game's tab → `/games/<slug>`) and redirects with `replace`, so the back button does not bounce; an unmapped fragment falls through to the catch-all page once. Mounted once in `AppShell`. Proven by its test file.
