---
id: US-FND-006
title: Add the accessibility gate to CI
epic: EPIC-00-foundation
status: done
priority: P1
size: M
depends_on: [US-FND-005, US-SITE-003]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/nonfunctional-requirements.md", "04-decisions/adr/ADR-0008-accessibility-gate.md"]
---

# US-FND-006 — Add the accessibility gate to CI

## 1. Story

**As a** owner-developer
**I want** an automated accessibility check over every prerendered route, failing the build on a serious violation
**so that** the WCAG 2.2 AA claim is enforced by the pipeline instead of trusted to review.

## 2. Context

ADR-0008 makes accessibility a gate, not an audit. The prerender step (US-SITE-003) gives the checker one HTML file per route, which is the cheapest possible input: no browser automation needed for the first pass.

**NFRs**: NFR-12

| Topic | Reference |
|-------|-----------|
| NFRs | [nonfunctional-requirements.md](../../01-overview/nonfunctional-requirements.md) |
| ADR-0008 | [ADR-0008-accessibility-gate.md](../../04-decisions/adr/ADR-0008-accessibility-gate.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the built `dist/` | the gate runs | every route in the route manifest is checked and a report artifact is uploaded |
| AC2 | a route with a seeded contrast violation | the gate runs | the build fails and the failing node is named |
| AC3 | a clean tree | the gate runs | it passes and the count of checked routes is printed |
| AC4 | the route manifest | a route is added | the gate checks it without a workflow change |

## 4. Contract

The gate reads the same route manifest the prerender step uses; a route missing from `dist/` is a failure, not a skip.

## 5. Rules and edge cases

- Serious and critical violations fail; moderate and minor are reported and triaged.
- Check both the light theme and any inverted surface the route renders.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Fixing the violations it finds — that is US-LAUNCH-004.

## 8. Test notes

The gate is its own test: seeded violation must fail.

## 9. Open questions

None.

## 10. Outcome

Commit `6b17640`. `scripts/a11y-gate.mjs` runs axe-core in jsdom over every entry of `dist/route-manifest.json` and measures the declared contrast pairs; `pnpm run a11y` fails the build with the rule, the route and the node. First run found a real violation (unlabelled GFM task-list checkboxes in the sample post), fixed in `renderPostBody`. Now reports `a11y gate: checked 9 routes and 21 contrast pairs`.
