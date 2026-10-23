---
id: US-LAUNCH-003
title: Meet a performance budget on a cold load
epic: EPIC-07-launch
status: ready
priority: P2
size: M
depends_on: [US-HOME-002, US-DS-002]
open_questions: []
accepted_assumptions: []
refs: ["01-overview/nonfunctional-requirements.md", "01-overview/deployment.md"]
---

# US-LAUNCH-003 — Meet a performance budget on a cold load

## 1. Story

**As a** visitor on a phone
**I want** the page to be readable and usable quickly on a slow connection
**so that** the first impression is not a blank screen.

## 2. Context

Prerendered HTML (US-SITE-003), a deferred remote (US-HOME-002) and self-hosted fonts (US-DS-002) are the ingredients; this story sets the budget and enforces it, because "fast" without a number is a feeling.

**NFRs**: NFR-01, NFR-21

| Topic | Reference |
|-------|-----------|
| NFRs | [nonfunctional-requirements.md](../../01-overview/nonfunctional-requirements.md) |
| Deployment | [deployment.md](../../01-overview/deployment.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the home page | it is loaded on a throttled connection | the prerendered text is visible before the game remote is requested |
| AC2 | the built bundle | its assets are listed | no render-blocking third-party request and no font from another origin |
| AC3 | a cold load | it is measured | LCP, CLS and total transferred size stay inside the budget recorded in the story |
| AC4 | a game route | it is loaded | the game remote is the largest deferred chunk and nothing else is preloaded |
| AC5 | the budget | a change exceeds it | the check fails in CI with the offending asset named |

## 4. Contract

The budget is a table in this story and in `docs/01-overview/nonfunctional-requirements.md`: LCP under 2.5s on a simulated slow 4G phone, CLS under 0.1, home payload under 200KB gzipped excluding game remotes.

## 5. Rules and edge cases

- Measure with a throttled device profile, not on a fast laptop.
- Third-party fonts and analytics are already excluded by ADR-0007 and US-DS-002.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- A performance dashboard or synthetic monitoring.

## 8. Test notes

A scripted run of the build through a Lighthouse-like measurement on the three heaviest routes, recorded in the story with the numbers.

## 9. Open questions

None.
