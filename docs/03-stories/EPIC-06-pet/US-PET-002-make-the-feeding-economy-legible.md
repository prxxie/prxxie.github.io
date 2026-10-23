---
id: US-PET-002
title: Make the feeding economy legible
epic: EPIC-06-pet
status: done
priority: P2
size: M
depends_on: [US-PET-001]
open_questions: []
accepted_assumptions: []
refs: ["02-reference/data/README.md", "00-source/brief.md"]
---

# US-PET-002 — Make the feeding economy legible

## 1. Story

**As a** visitor
**I want** to understand what a star is worth and why the feed button is disabled
**so that** feeding feels fair instead of arbitrary.

## 2. Context

The economy already exists in code: food available is `totalStars − foodConsumed`, feeding adds 1 XP and 1 consumed food, feeding and playing share a ten-minute cooldown, and play adds 20 happiness capped at 100. None of it is explained on screen, so a disabled button looks broken.

**NFRs**: NFR-04

| Topic | Reference |
|-------|-----------|
| Data model | [README.md](../../02-reference/data/README.md) |
| Brief § 7 | [brief.md](../../00-source/brief.md) |

## 3. Acceptance criteria

| # | Given | When | Then |
|---|-------|------|------|
| AC1 | the widget | it renders | it shows food available out of the stars earned, and the cost of one feed |
| AC2 | the feed action | it is used | one food is consumed, XP rises by one, and the figure updates immediately |
| AC3 | the feed action | it is used twice inside the cooldown | the second attempt is disabled and states the wait in minutes |
| AC4 | the food count | it reaches zero | feeding is disabled with an explanation of how to earn more |
| AC5 | the play action | the pet is asleep | it is disabled with a reason, and no happiness is added |
| AC6 | any state change | another tab is open | both tabs show the same numbers without a reload |

## 4. Contract

All numbers come from `ProgressService`; the widget renders them and never recomputes a rule. Cooldown is ten minutes for feed and play; happiness decays by five per cooldown and four times slower while asleep.

## 5. Rules and edge cases

- Explain by proximity: the number next to the button, not a help page.
- Never show a negative food count or a happiness above 100.

## 6. Implementation notes

- No special constraints.

## 7. Out of scope

- Rewriting the economy or rebalancing thresholds.

## 8. Test notes

Unit tests over the service are already there; add component tests for disabled states, the cooldown copy and the cross-tab listener.

## 9. Open questions

None.

## 10. Outcome

| # | Criterion | Where it is proven |
|---|-----------|--------------------|
| AC1 | food shown out of the stars earned, and the cost of one feed | `PetWidget` computes `starsEarned` from `completedLevels` and renders `"{available} of {earned} stars"`; the hint line says "Feed costs one star." |
| AC2 | one feed consumes one food and adds one XP, immediately | `ProgressService.feedPet` does both; the widget re-reads `state` through the hook. `PetWidget.test.tsx` › offers feed, play and sleep |
| AC3 | a second feed inside the cooldown is disabled with the wait in minutes | `cooldownMinutes(lastFedAt, now, HUNGER_COOLDOWN)` and the disabled Feed button; `PetWidget.test.tsx` › disables feeding inside the cooldown |
| AC4 | zero food disables feeding and explains how to earn more | the "No stars to spend — finish a level to earn one." hint |
| AC5 | asleep blocks play with a reason and adds no happiness | Play disabled, "Sleeping: play is paused until the pet wakes." |
| AC6 | other tabs agree without a reload | `LocalProgressRepository` re-reads on the `storage` event (`packages/shared/src/repository/LocalProgressRepository.ts:36`), covered by its own tests |

Notes: the widget renders rules, it does not restate them — the cooldown constant is imported from `shared`, so a change there moves the copy with it.
