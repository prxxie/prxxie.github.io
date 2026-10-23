---
id: EPIC-00-foundation
code: FND
title: Foundation: reproducible workspace and honest gates
---

# EPIC-00 — Foundation: reproducible workspace and honest gates

The repository is made reproducible and its quality claims true before any visible work starts: one package manager, one lockfile, three gates that pass, a CI that refuses to deploy a red tree, and the cloud-sync code path deleted. Nothing here is visible to a visitor; everything here is what makes the rest verifiable.

## Goal

A clean clone installs reproducibly, `test`, `lint` and `typecheck` pass locally and in CI, the deploy workflow cannot publish a red tree, and no account, key or Supabase import remains in the codebase.

## Stories

Generated from story frontmatter — run `python3 .agents/scripts/verify-docs.py --fix`; do not edit by hand.

<!-- adf:epic-stories -->
| Id | Title | Priority | Size | Status | Depends on |
|---|---|---|---|---|---|
| [US-FND-001](US-FND-001-make-the-workspace-pnpm-canonical.md) | Make the workspace pnpm-canonical | P0 | L | ready | — |
| [US-FND-002](US-FND-002-green-the-type-check-gate.md) | Green the type-check gate | P0 | M | ready | US-FND-001 |
| [US-FND-003](US-FND-003-green-the-lint-gate.md) | Green the lint gate | P0 | M | ready | US-FND-001 |
| [US-FND-004](US-FND-004-delete-the-cloud-sync-code-path.md) | Delete the cloud-sync code path | P1 | M | ready | US-FND-001 |
| [US-FND-005](US-FND-005-make-the-deploy-workflow-refuse-a-red-tree.md) | Make the deploy workflow refuse a red tree | P0 | M | ready | US-FND-001, US-FND-002, US-FND-003 |
| [US-FND-006](US-FND-006-add-the-accessibility-gate-to-ci.md) | Add the accessibility gate to CI | P1 | M | ready | US-FND-005, US-SITE-003 |
| [US-FND-007](US-FND-007-serve-the-site-from-the-user-site-root.md) | Serve the site from the user-site root | P1 | S | ready | US-SITE-004 |
<!-- /adf:epic-stories -->

## Out of scope

- Any visual change — that is EPIC-01 and later.
- Splitting the shared package into new modules.
- Dependency upgrades beyond what a green gate requires.
