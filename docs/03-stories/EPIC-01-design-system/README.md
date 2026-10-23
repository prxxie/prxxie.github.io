---
id: EPIC-01-design-system
code: DS
title: One design system, warm cream and coral
---

# EPIC-01 — One design system, warm cream and coral

The amber terminal is retired and the cream/coral editorial system becomes the only visual language, declared once and consumed everywhere — shell chrome, primitives and, later, the three games. The token set is locked here so nothing is themed twice.

## Goal

The site renders in one coherent system: one palette, one type scale, one radius set, no CRT chrome, no second token set, and a contrast-safe baseline that the accessibility gate can enforce.

## Stories

Generated from story frontmatter — run `python3 .agents/scripts/verify-docs.py --fix`; do not edit by hand.

<!-- adf:epic-stories -->
| Id | Title | Priority | Size | Status | Depends on |
|---|---|---|---|---|---|
| [US-DS-001](US-DS-001-collapse-the-two-token-sets-into-one.md) | Collapse the two token sets into one | P0 | L | done | US-FND-001 |
| [US-DS-002](US-DS-002-load-free-licensed-typefaces.md) | Load free-licensed typefaces | P1 | M | done | US-DS-001 |
| [US-DS-003](US-DS-003-rebuild-the-chrome-and-the-shared-primitives.md) | Rebuild the chrome and the shared primitives | P1 | L | ready | US-DS-001, US-DS-002 |
<!-- /adf:epic-stories -->

## Out of scope

- Restyling the games — that is EPIC-04, in their own repositories.
- Any second theme or a dark-mode switch.
