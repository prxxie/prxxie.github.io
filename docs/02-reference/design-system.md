# Design system

Warm cream and coral editorial is the only design system (ADR-0001). It is declared once, in
`packages/shell/src/index.css`, and consumed by class in components and by token in game styles. Nothing else is a design
source.

## Current state, in one paragraph

`packages/shell/src/index.css` declares the system exactly once, in a `@theme` block that carries the eighteen colour
tokens, the six radius tokens and the three families below; Tailwind reads that block, so `bg-canvas`, `text-ink`,
`border-hairline`, `rounded-lg` and `font-display` exist as utilities and hand-written rules use `var(--token)`. The
stylesheet also holds the component recipes (`.panel`, `.panel-dark`, `.panel-header`, `.panel-body`, `.btn`,
`.btn-primary`), the prose rules for rendered markdown, and the three motion keyframes that survive (`blink`,
`slideIn`, `fade-in`). The amber terminal palette, the `--color-cozy-*` tokens, the `--font-pixel`/`--font-press`
aliases, the pixel classes and the daisyUI import are gone, and `body` is painted with `--color-canvas` on
`--color-body`. `tests/design-tokens.test.ts` is the enforcement: it fails if a legacy class or amber value returns, and
it fails if a declared token is never used.

## Colour

| Token | Value | Role |
|-------|-------|------|
| `--color-primary` | `#cc785c` | the single action colour: primary button, active nav, the pet's highlight |
| `--color-primary-active` | `#a9583e` | pressed/hover state of primary |
| `--color-primary-disabled` | `#e6dfd8` | disabled primary, same value as the hairline |
| `--color-canvas` | `#faf9f5` | page background |
| `--color-surface-card` | `#efe9de` | raised card, board frame, footer widget |
| `--color-surface-dark` | `#181715` | inverted surface: the game board, code blocks |
| `--color-surface-dark-elevated` | `#252320` | inverted surface, one step up |
| `--color-ink` | `#141413` | headings and primary text on light |
| `--color-body` | `#3d3d3a` | body copy on light |
| `--color-muted` | `#6c6a64` | secondary text, metadata, captions |
| `--color-on-dark` | `#faf9f5` | text on `--color-surface-dark` |
| `--color-on-dark-soft` | `#a09d96` | secondary text on dark |
| `--color-accent-teal` | `#5db8a6` | the one non-coral accent, for success-adjacent emphasis |
| `--color-accent-amber` | `#e8a55a` | star ratings, earned XP |
| `--color-success` | `#5db872` | solved state |
| `--color-warning` | `#d4a017` | the pet's hunger warning |
| `--color-error` | `#c64545` | errors, invalid moves |
| `--color-hairline` | `#e6dfd8` | every 1px rule and border |

Rules: coral is the only action colour and appears once per view; a second coral element means one of the two is not an
action. Contrast pairs are fixed — `--color-ink` on `--color-canvas`, `--color-on-dark` on `--color-surface-dark` — and a
new pairing must be checked before it ships (NFR-12).

## Typography

| Role | Family tokens | Use |
|------|---------------|-----|
| Display | `--font-display` (`Copernicus`, `Tiempos Headline`, `Cormorant Garamond`, serif) | page and section headings only |
| Body | `--font-body` (`StyreneB`, `Inter`, system sans) | all interface and prose text |
| Code | `--font-code` (`JetBrains Mono`, monospace) | code, level ids, telemetry numbers |

The scale, from the spec in `DESIGN.md` § typography: display-xl 64/1.05 with −1.5px tracking, display-lg 48/1.1, display-md
36/1.15, display-sm 28/1.2; title-lg 22/1.3, title-md 18/1.4, title-sm 16/1.4; body-md 16/1.55, body-sm 14. Display sizes
are serif at weight 400; titles and body are sans, 500 and 400 respectively. Nothing renders below 14px except the
telemetry numerals, which are 11px monospace and never carry meaning alone (NFR-12).

The licensed Anthropic families in the token fallbacks are **not loaded** — the stack degrades to `Cormorant Garamond`,
`Inter` and system faces, and `@import` fetches only `Geist Mono`
(`packages/shell/src/index.css:1`). A licensed webfont is a content/licensing decision, not a code one.

## Space and shape

Spacing scale, from `DESIGN.md` § spacing: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 96px` (section rhythm is the 96px step).
Radius tokens: `--radius-xs 4px`, `--radius-sm 6px`, `--radius-md 8px` (default for controls and cards),
`--radius-lg 12px` (modal), `--radius-xl 16px` (page-level surfaces), `--radius-pill 9999px` (tags, the star counter).
The rounding is the deliberate break from the pixel chrome: no 0-radius box and no `pixel-border` class survives.

## Component recipes

| Component | Recipe |
|-----------|--------|
| Primary button | `--color-primary` fill, `--color-canvas` label, `--radius-md`, 12px vertical padding, hover to `--color-primary-active`, visible focus ring in `--color-primary` |
| Secondary button | transparent fill, `--color-hairline` border, `--color-ink` label |
| Card | `--color-surface-card` fill, 1px `--color-hairline`, `--radius-md`, no shadow |
| Puzzle frame | `--color-surface-dark` fill, `--color-on-dark` labels, `--radius-lg`, the board inset by one spacing step |
| Star rating | three glyphs, earned in `--color-accent-amber`, unearned as `--color-hairline` |
| Pet widget | `--color-surface-card`, one line of copy, the sprite at 1×, actions beside it |

## What the games inherit

Each game MFE imports the same tokens and re-skins its header, controls, board, level select and win modal (OQ-11). The
boards keep a dark surface — a puzzle grid on cream loses its edge — so a game screen reads as an inverted card inside
the cream page rather than as a second design system. Level select and win modal follow the card and primary-button
recipes above, and the accessibility rules of ADR-0008 apply identically inside the remote.

## Enforcement

`docs/01-overview/conventions.md` fixes the naming rules (`--color-<role>` etc., no raw hex in components). The effect of
the collapse is asserted, not counted by hand: `tests/design-tokens.test.ts` fails on any `text-cozy-*`, `font-press`,
`retro-window` or `pixel-` reference outside `index.css`, on any amber hex, and on any declared token that no file
consumes. `DESIGN.md` remains the raw spec until the restyle finishes, at which point it is deleted (OQ-09).
