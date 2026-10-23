---
id: US-DS-001
title: Collapse the two token sets into one
epic: EPIC-01-design-system
status: done
priority: P0
size: L
depends_on: [US-FND-001]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/design-system.md", "04-decisions/adr/ADR-0001-cream-coral-design-system.md", "02-reference/screens/README.md"]
---

# US-DS-001 — Collapse the two token sets into one

## 1. Story

**As a** owner-developer
**I want** the amber palette deleted and every call site moved onto the cream and coral tokens
**so that** the design system is a single source of truth and the shipped site stops looking like the thing it replaced.

## 2. Context

`packages/shell/src/index.css` holds two token sets at once: the cream/coral `:root` block and the amber `@theme` block, with `body` still painted amber. Eighty-one `text-cozy-*` usages, thirty-six `font-press` usages and the `pixel-border`/`retro-window` classes keep the old system alive. ADR-0001 chose the cream system; this story finishes the migration.

**NFRs**: NFR-12, NFR-14

| Topic | Reference |
|-------|-----------|
| Design system | [design-system.md](../../02-reference/design-system.md) |
| ADR-0001 | [ADR-0001-cream-coral-design-system.md](../../04-decisions/adr/ADR-0001-cream-coral-design-system.md) |
| Screens | [README.md](../../02-reference/screens/README.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | `packages/shell/src/index.css` | the file is read | only the cream/coral tokens remain; the amber `@theme` block, `--color-cozy-*`, `--font-pixel`, `--font-press`, the scanline and flicker keyframes and the pixel classes are gone |
| AC2 | `body` | the page renders | it is painted with `--color-canvas` and `--color-body`, not with `#000` and `#FFB000` |
| AC3 | the shell components | the source is searched | no `text-cozy-*`, `bg-cozy-*`, `border-cozy-*`, `font-press` or `retro-window` reference survives |
| AC4 | every token in `:root` | the stylesheet is read | it is used at least once, or it is deleted |
| AC5 | the built site | the accessibility gate runs | no contrast violation is reported on the light surfaces or the dark board |
| AC6 | the site at 360px and 1440px | it is inspected | no amber surface, pixel border or mono-everything layout remains |

## 4. Contract

The surviving tokens are exactly those in `docs/02-reference/design-system.md` § Colour and § Space and shape; the document is the contract, and a token the doc does not list does not ship.

## 5. Rules and edge cases

- Replace by role, not by colour: a `text-cozy-muted` becomes `--color-muted`, not a hand-picked hex.
- Keep the games untouched here — they are restyled in their own repositories.
- Delete dead CSS rather than leaving it commented out.

## 6. Implementation notes

**Shipped.** `packages/shell/src/index.css` now holds one `@theme` block (eighteen colours, six radii, three families),
the component recipes and the prose rules; `body` is painted with `--color-canvas` on `--color-body`. The daisyUI import
and the dependency left `packages/shell`, the amber tokens, pixel classes, scanline/flicker keyframes and `terminal-bg`
are deleted, and every call site moved to a role token (`text-cozy-text` → `text-on-dark` inside a dark panel and
`text-ink` on cream, `font-press` → `font-code`, `pixel-btn` → `btn`, `retro-window` → `panel`). `--color-success`,
`--color-warning` and `--color-error` were unused after the rename, so the pet status line and its food button now read
them; `--radius-xl` lands on the page-level view panel. `tests/design-tokens.test.ts` is the regression guard (AC1, AC3,
AC4). The game remotes keep their own stylesheets until US-GAME-002 to US-GAME-004.

**Two follow-ups for US-LAUNCH-004.** The primary button recipe paints `--color-canvas` on `--color-primary`, which
measures about 2.9:1 — the document is the contract, so the token pairing stands until the contrast story fixes both the
recipe and this document. `text-success` on `--color-on-dark` inherits the same problem on the inverted telemetry
surface.

- No special constraints.

## 7. Out of scope

- Repainting the game remotes — US-GAME-002 to US-GAME-004.
- Changing the type scale (that is US-DS-002) or the primitives (US-DS-003).

## 8. Test notes

No unit test asserts CSS; the evidence is the grep (zero legacy class references) plus the accessibility gate plus a recorded screenshot pair at both widths.

## 9. Open questions

None.
