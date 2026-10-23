---
id: US-LAUNCH-004
title: Audit and fix accessibility across every route
epic: EPIC-07-launch
status: ready
priority: P1
size: M
depends_on: [US-FND-006, US-GAME-005, US-DEVLOG-003]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/nonfunctional-requirements.md", "04-decisions/adr/ADR-0008-accessibility-gate.md", "02-reference/design-system.md"]
---

# US-LAUNCH-004 — Audit and fix accessibility across every route

## 1. Story

**As a** visitor using assistive technology
**I want** every page to work with a keyboard and a screen reader
**so that** accessibility is a property of the shipped site, not of the components in isolation.

## 2. Context

US-FND-006 makes the automated check a gate; this story is the human pass that the gate cannot do: reading order, focus management across route changes, the game boards, the pet widget, and the dark game surfaces where the contrast risk actually lives.

**NFRs**: NFR-12, NFR-13, NFR-14, NFR-15

| Topic | Reference |
|-------|-----------|
| NFRs | [nonfunctional-requirements.md](../../01-overview/nonfunctional-requirements.md) |
| ADR-0008 | [ADR-0008-accessibility-gate.md](../../04-decisions/adr/ADR-0008-accessibility-gate.md) |
| Design system | [design-system.md](../../02-reference/design-system.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | each of the seven routes | it is audited | no serious or critical violation is reported, and the gate is green |
| AC2 | a route change | it happens while focus is on a link | focus moves to the main landmark and the route is announced |
| AC3 | the three game boards | they are played with the keyboard | a level can be completed with no pointer input |
| AC4 | the dark game surfaces | their text and clue colours are checked | every pair meets the AA contrast ratio |
| AC5 | the whole site | `prefers-reduced-motion` is set | no animation remains and no state becomes invisible |
| AC6 | a screen reader | the footer widget is reached | the stage, hunger and happiness are announced once, in order |

## 4. Contract

The audited surface is the deployed artifact, route by route, using the route manifest; findings are fixed in this story, not deferred.

## 5. Rules and edge cases

- Automated findings are the floor, not the audit: the manual keyboard pass is required evidence.
- Fix in the design tokens where the cause is shared, not with per-screen overrides.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Rewriting the games for screen-reader narration of the board (recorded as a known limitation).

## 8. Test notes

Record the audit result per route in the story; the CI gate (US-FND-006) must stay green afterwards.

## 9. Open questions

None.
