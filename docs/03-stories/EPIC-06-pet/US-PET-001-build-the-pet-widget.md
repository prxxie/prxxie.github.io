---
id: US-PET-001
title: Build the pet widget
epic: EPIC-06-pet
status: ready
priority: P1
size: M
depends_on: [US-DS-003]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/data/README.md", "02-reference/design-system.md", "00-source/brief.md"]
---

# US-PET-001 — Build the pet widget

## 1. Story

**As a** visitor
**I want** a small live companion in the footer that shows its stage, hunger and mood
**so that** the progress I earn somewhere shows up somewhere warm.

## 2. Context

`packages/pets` already receives the shell's pet state as props and renders a stage sprite — it simply lives in a tab. This story turns that into a footer-sized widget: stage, hunger, happiness, sleep, and the two actions, all driven by `ProgressService` rather than by a store of its own.

**NFRs**: NFR-04, NFR-07, NFR-14

| Topic | Reference |
|-------|-----------|
| Data model | [README.md](../../02-reference/data/README.md) |
| Design system | [design-system.md](../../02-reference/design-system.md) |
| Brief § 8 | [brief.md](../../00-source/brief.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the widget | it renders | it shows the current stage, the hunger level and the happiness level as text and glyph |
| AC2 | the stored progress | it is missing or corrupt | the widget renders a default stage-1 pet instead of failing |
| AC3 | the pet | it is sleeping | the sleep state is visible and play is disabled with a reason |
| AC4 | the widget | it is read by a screen reader | the stage, hunger and happiness are announced as text, and the sprite is decorative |
| AC5 | the widget | `prefers-reduced-motion` is set | idle bobbing is removed and the state remains legible |
| AC6 | the widget at 360px | it renders | it fits without pushing the footer columns out of place |

## 4. Contract

Consumes `ProgressService` through the shell hook; the MFE keeps receiving state as props (no direct storage access in the remote). Stage art comes from `getEvolutionStage` thresholds `[0, 10, 30, 60, 100]`.

## 5. Rules and edge cases

- The MFE stays display-only plus two callbacks — it must not read `localStorage` itself.
- A missing pet state is a valid state, not an error.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Placing it on the page — US-PET-003.

## 8. Test notes

Component tests per stage and per sleep state, a corrupt-progress case, and one manual reduced-motion check.

## 9. Open questions

None.
