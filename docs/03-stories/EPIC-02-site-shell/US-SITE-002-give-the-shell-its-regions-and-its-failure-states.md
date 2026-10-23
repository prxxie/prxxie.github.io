---
id: US-SITE-002
title: Give the shell its regions and its failure states
epic: EPIC-02-site-shell
status: ready
priority: P0
size: M
depends_on: [US-SITE-001]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/screens/README.md", "01-overview/architecture.md", "04-decisions/adr/ADR-0008-accessibility-gate.md"]
---

# US-SITE-002 — Give the shell its regions and its failure states

## 1. Story

**As a** visitor
**I want** a header, a main region, a footer and a named failure state on every page
**so that** I can navigate and orient myself on any page, and one broken part does not take the page down.

## 2. Context

The shell has a header and a main region but no footer, no skip link and no route-level error boundary; the existing `MfeLoader`/`Fallback` pair covers a failing remote import only. This story completes the layout so the pages in later epics can be assembled from regions rather than reinvented.

**NFRs**: NFR-06, NFR-14, NFR-15

| Topic | Reference |
|-------|-----------|
| Screens | [README.md](../../02-reference/screens/README.md) |
| Architecture | [architecture.md](../../01-overview/architecture.md) |
| ADR-0008 | [ADR-0008-accessibility-gate.md](../../04-decisions/adr/ADR-0008-accessibility-gate.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | any page | a keyboard user presses Tab from the top | the skip link is the first focusable element and jumps to the main region |
| AC2 | any page | it is read by a screen reader | the document exposes exactly one `banner`, one `main` and one `contentinfo` landmark |
| AC3 | the navigation | it is rendered | it lists three items — home, games, devlog — and the current page is marked `aria-current="page" |
| AC4 | a route component that throws | it is opened | an error boundary renders a named message and a way back, and the header and footer stay |
| AC5 | a game remote that cannot be fetched | its route is opened | the existing fallback renders inside the page, and the rest of the page stays interactive |
| AC6 | a route change | it completes | focus lands on the main region and the scroll position resets to the top |

## 4. Contract

Regions are fixed: `Header`, `Main`, `Footer`, `ErrorBoundary`, `SkipLink`. The footer is where the pet widget eventually mounts (US-PET-003) and where the contact links live (US-SITE-006).

## 5. Rules and edge cases

- The nav is three items — the pet tab is removed by US-PET-001, and the game tabs collapse into `/games`.
- An error boundary never replaces the whole document; it replaces the failing subtree.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Building a design-system component library — the primitives are US-DS-003.

## 8. Test notes

Component tests: skip-link target exists, landmarks are unique, the error boundary catches a thrown child, the nav marks the active route.

## 9. Open questions

None.
