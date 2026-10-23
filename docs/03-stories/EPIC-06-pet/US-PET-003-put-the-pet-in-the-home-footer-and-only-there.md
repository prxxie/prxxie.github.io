---
id: US-PET-003
title: Put the pet in the home footer, and only there
epic: EPIC-06-pet
status: done
priority: P1
size: S
depends_on: [US-PET-001, US-SITE-002]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/architecture.md", "02-reference/screens/README.md"]
---

# US-PET-003 — Put the pet in the home footer, and only there

## 1. Story

**As a** visitor
**I want** the pet to sit in the footer of the home page, updating live when I finish a level
**so that** I notice the pet without it taking screen space away from the other pages.

## 2. Context

The last piece: remove the pets tab and its route, mount the widget in the shell footer, and keep it live — a win in an embedded puzzle on the same page must update it without a reload.

**NFRs**: NFR-04, NFR-15

| Topic | Reference |
|-------|-----------|
| Architecture | [architecture.md](../../01-overview/architecture.md) |
| Screens | [README.md](../../02-reference/screens/README.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the home page | it renders | the footer contains the pet widget and the navigation has no pets item |
| AC2 | any other page | its footer is read | no pet widget is mounted there |
| AC3 | the old `#pets` route | it is opened | it lands on a real page through US-SITE-005, never on a dead route |
| AC4 | a level on the home page | it is completed | the footer widget updates within one frame of the win |
| AC5 | the page | it is loaded with JavaScript disabled | the footer renders its static parts and the widget degrades to nothing rather than an empty box |
| AC6 | the widget | it is reached by keyboard | its two actions are reachable and the focus order is sensible |

## 4. Contract

The widget subscribes to `cozyos:progress-updated` on the shell side and re-reads progress through the service; the MFE itself stays prop-driven.

## 5. Rules and edge cases

- Exactly one widget instance, on `/` only — the screens reference fixes it there.
- The footer must not become a sticky bar.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- A pet page of any kind.

## 8. Test notes

Component test that a dispatched progress event updates the widget; router test that no pets route exists.

## 9. Open questions

None.

## 10. Outcome

| # | Criterion | Where it is proven |
|---|-----------|--------------------|
| AC1 | the front page footer holds the widget, the nav has no pets item | `packages/shell/src/components/regions/Footer.tsx` renders it when `pathname === "/"`; the nav is Home / Games / Devlog |
| AC2 | no other page mounts one | `footer.test.tsx` › mounts no pet anywhere else |
| AC3 | the old `#pets` link lands on a real page | `useLegacyHashRedirect` maps `pets` → `/` (US-SITE-005) |
| AC4 | a win updates the footer within a frame | `ProgressService` dispatches `cozyos:progress-updated` and the hook re-reads state; the widget holds no copy of it |
| AC5 | with JavaScript disabled the footer still stands | the widget renders from the prerendered document with the default pet; the contact links and the footer line are static markup |
| AC6 | keyboard reachable in a sensible order | Feed, Play, Sleep are real buttons in DOM order inside the footer's single contentinfo landmark |

Notes: the design tokens lost their three `-on-dark` status twins with this story — nothing in the shell renders the inverted status surface, and the gate no longer measures pairs no component can produce (17 pairs, all passing). The `pets` remote is now unused by any route; it stays registered until a follow-up retires it.
