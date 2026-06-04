# Design Specification: Pet Hunger Adjustment & Shikaku Stars Alignment

This document details the changes to range pet hunger from 0 to 5, implement sequential feeding, and fix the Shikaku level completion to award stars correctly.

## 1. Pet Hunger Updates

### Proposed Behavior
- **Hunger range:** 0 (full) to 5 (maximum hunger/starving).
- **Time per level:** 10 minutes per level (awake) or 20 minutes per level (sleeping).
- **Feeding mechanism:** Each feed consumes 1 food and decreases the hunger level by exactly 1. If the pet is at hunger level 5, the user can feed it sequentially 5 times to make it full.

### Implementation Details
- Update `packages/shared/src/progress/service.ts`:
  - Update `getHungryLevel()` to cap at `5`.
  - In `feedPet()`, retrieve the current `lastFedAt` (if `0`, initialize it as `Date.now() - 5 * divisor`).
  - Calculate `nextLastFed` by adding `divisor` to the current `lastFedAt`, capped at `Date.now()`.
  - Call `repo.feedPet(nextLastFed, nextLastPlayedAt)`.
- Update `packages/shared/src/repository/ProgressRepository.ts` and `LocalProgressRepository.ts`:
  - Modify `feedPet` signature to accept optional `lastFedAt`: `feedPet(lastFedAt?: number, lastPlayedAt?: number)`.
  - Update the repository logic to save the passed `lastFedAt` (defaulting to `Date.now()` if undefined).

---

## 2. Shikaku Stars Alignment

### Current Behavior
- Shikaku currently calls `progressService.completeLevel("shikaku", puzzle.id)`, which only records `stars: 1` in the progress DB.
- The Shikaku HUD and level select save and display the actual stars achieved (1 to 3) in local storage, creating a discrepancy with the pet food received (only 1 food).

### Proposed Behavior
- Update Shikaku level completion to register the actual achieved stars using `completeLevelWithStars` so that the user receives correct food rewards.

### Implementation Details
- Update `packages/shikaku/src/ShikakuApp.tsx`:
  - Retrieve `starsAchieved` from `useShikakuStore`.
  - Replace the call to `completeLevel` with `completeLevelWithStars("shikaku", puzzle.id, starsAchieved)`.
  - Update the display message to show `+${starsAchieved} FOOD` or `"ALREADY BEST"`.
