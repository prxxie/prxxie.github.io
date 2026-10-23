---
id: US-HOME-001
title: Build the proof page
epic: EPIC-03-home
status: done
priority: P1
size: M
depends_on: [US-SITE-003, US-DS-003]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/screens/README.md", "00-source/brief.md", "02-reference/design-system.md"]
---

# US-HOME-001 — Build the proof page

## 1. Story

**As a** visitor
**I want** the front page to say who I am, what I build and how this site is made, in that order
**so that** I understand what this person does within one screen.

## 2. Context

The current front page is a tab strip and a welcome panel. The brief fixes the front-page structure: a headline, a short positioning paragraph, a "what I build" section, an embedded puzzle (US-HOME-002), a proof section (US-HOME-003) and the contact block (US-SITE-006) — assembled here as prerendered copy, not a client-rendered splash.

**NFRs**: NFR-01, NFR-15, NFR-16

| Topic | Reference |
|-------|-----------|
| Screens | [README.md](../../02-reference/screens/README.md) |
| Brief § 1–§ 4 | [brief.md](../../00-source/brief.md) |
| Design system | [design-system.md](../../02-reference/design-system.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the home route | it is prerendered | the HTML contains the headline, the positioning paragraph and the section headings |
| AC2 | the page | it is read top to bottom | the order is headline → what I build → puzzle → proof → contact |
| AC3 | any copy paragraph | it is read | it is inline in the component, in English, with no i18n lookup |
| AC4 | the page | it is viewed at 360px | the headline is not clipped and the reading order is unchanged |
| AC5 | the page | a screen reader reads it | there is exactly one `h1` and the sections have headings in order |

## 4. Contract

Section components: `Headline`, `WhatIBuild`, `PuzzleSlot`, `Proof`, `ContactBlock` — in that order, with `PuzzleSlot` and `Proof` filled by the next two stories.

## 5. Rules and edge cases

- Copy is the product here: plain sentences, no superlatives, no skill badge wall.
- Every section must survive with JavaScript off (it is prerendered text).

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- The embedded puzzle and the proof figures — US-HOME-002 and US-HOME-003.

## 8. Test notes

Prerender assertion on the built HTML plus a component test for the heading structure.

## 9. Open questions

None.

## 10. Outcome

Commit `5677817`. `packages/shell/src/screens/HomePage.tsx` is now the proof page in one reading order: headline, "What I build", "Try one" (the puzzle slot US-HOME-002 fills), "The proof" (figures from the build, US-HOME-003), "Say hello" (the contact block). One `h1`, four `h2`, no skipped level. Proven by `packages/shell/src/screens/homePage.test.tsx` (6 tests).
