---
id: US-DS-003
title: Rebuild the chrome and the shared primitives
epic: EPIC-01-design-system
status: ready
priority: P1
size: L
depends_on: [US-DS-001, US-DS-002]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/design-system.md", "02-reference/screens/README.md", "01-overview/roles-and-permissions.md"]
---

# US-DS-003 — Rebuild the chrome and the shared primitives

## 1. Story

**As a** owner-developer
**I want** header, nav, footer, skip link and the shared controls rebuilt from the component recipes
**so that** every screen starts from the same parts and a new screen cannot invent its own button.

## 2. Context

With one token set in place, the visible chrome and the primitives every screen needs — button, card, star rating, tag, pet widget frame — are rebuilt once, here, so the screens in EPIC-03 to EPIC-05 assemble rather than invent.

**NFRs**: NFR-12, NFR-14, NFR-15

| Topic | Reference |
|-------|-----------|
| Design system | [design-system.md](../../02-reference/design-system.md) |
| Screens | [README.md](../../02-reference/screens/README.md) |
| Roles | [roles-and-permissions.md](../../01-overview/roles-and-permissions.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | any interactive element | it receives keyboard focus | a visible focus ring in `--color-primary` is drawn, and it is not clipped |
| AC2 | the layout | it is viewed at 360px and 1920px | no horizontal scroll, no clipped control, the nav collapses cleanly |
| AC3 | the header | it is read by a screen reader | it is a `banner` landmark with a skip link as the first focusable element |
| AC4 | the primary button | it is rendered in every state | default, hover, active, disabled and focus all match the recipe |
| AC5 | any animation in the chrome | `prefers-reduced-motion: reduce` is set | the motion is removed, not merely shortened |
| AC6 | the star rating | it is rendered | the count is available as text and the glyphs are decorative |

## 4. Contract

The primitives and their states are the ones in `docs/02-reference/design-system.md` § Component recipes; a new variant is added to that table before it is added to the code.

## 5. Rules and edge cases

- One coral action per view — the primitives do not decide it, the screen does.
- Primitives live in the shell and are imported by MFEs only through shared CSS tokens, never as a component library.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Building a general-purpose component library or a Storybook.

## 8. Test notes

Component tests for each primitive's states and accessible names; manual keyboard and reduced-motion check.

## 9. Open questions

None.
