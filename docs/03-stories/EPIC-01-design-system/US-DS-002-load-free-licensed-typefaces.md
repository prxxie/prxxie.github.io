---
id: US-DS-002
title: Load free-licensed typefaces
epic: EPIC-01-design-system
status: ready
priority: P1
size: M
depends_on: [US-DS-001]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/design-system.md", "04-decisions/adr/ADR-0001-cream-coral-design-system.md", "01-overview/deployment.md"]
---

# US-DS-002 — Load free-licensed typefaces

## 1. Story

**As a** owner-developer
**I want** a display serif, a UI sans and a mono served from the build with no external font request
**so that** typography is licensed, self-contained and does not block the first paint on a third party.

## 2. Context

The token families name Copernicus and StyreneB, which are licensed and never loaded; the only font that actually loads is `Geist Mono` from Google Fonts, and `index.html` also pulls the pixel font `Zpix` from jsDelivr. This story replaces all of it with free-licensed faces served from the artifact.

**NFRs**: NFR-01, NFR-21

| Topic | Reference |
|-------|-----------|
| Design system | [design-system.md](../../02-reference/design-system.md) |
| ADR-0001 | [ADR-0001-cream-coral-design-system.md](../../04-decisions/adr/ADR-0001-cream-coral-design-system.md) |
| Deployment | [deployment.md](../../01-overview/deployment.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the built `dist/` | the HTML is read | it requests no font from a third-party origin |
| AC2 | the token block | the families are read | `--font-display`, `--font-body` and `--font-code` name the shipped faces |
| AC3 | the page | it renders with the network throttled | text is visible before the webfont arrives (`font-display: swap`) |
| AC4 | `packages/shell/index.html` | the head is read | the jsDelivr `Zpix` link and the Google Fonts `@import` are gone |
| AC5 | the repository | licences are read | each shipped font's licence is recorded next to the asset or in the story |

## 4. Contract

Display: a free serif (Cormorant Garamond or similar). Body: Inter. Mono: JetBrains Mono. All three self-hosted or installed from a package that vendors the files, with `font-display: swap` and `unicode-range` left at the foundry default.

## 5. Rules and edge cases

- Ship only the weights the design system uses — every extra weight is a real download.
- Preload the display face only if the LCP element uses it.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- A font-loading strategy beyond swap (FOUT is acceptable here).

## 8. Test notes

Visual check at 360px and 1440px plus a network panel read proving no third-party font request.

## 9. Open questions

None.
