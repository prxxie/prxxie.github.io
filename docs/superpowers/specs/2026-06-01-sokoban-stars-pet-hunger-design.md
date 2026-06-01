# Sokoban Star System + Pet Hunger Redesign

**Date:** 2026-06-01
**Branch:** feat/sokoban-harder-levels

---

## Overview

Four coordinated changes:

1. Add a 3-star rating system to Sokoban (move-count based, mirroring Shikaku's time-based system)
2. Store best star count per level in shared progress; food = total stars earned across all games
3. Reduce pet hunger cooldown to 10 minutes; add a hunger level (0–6) concept
4. Add `targets` thresholds to all 100 Sokoban levels in `levels.ts`

---

## 1. Sokoban Star System

### Metric

Stars are awarded based on **move count** (lower = better), matching Sokoban's natural skill metric.

### Thresholds per level

`LevelData` (in `packages/sokoban/src/types.ts`) gains:

```ts
interface StarTargets {
  threeStars: number; // ≤ this many moves → 3★
  twoStars: number;   // ≤ this many moves → 2★
  oneStar: number;    // always 1★ on completion (no upper bound)
}

interface LevelData {
  id: string;
  name: string;
  grid: string[];
  targets: StarTargets;
}
```

Thresholds are derived per level: 3★ = optimal + 10%, 2★ = optimal + 40%, 1★ = any completion. For levels where optimal isn't computed, use reasonable defaults based on box count and grid size.

### Star calculation at win (WinModal / store)

```ts
function calcStars(moves: number, targets: StarTargets): number {
  if (moves <= targets.threeStars) return 3;
  if (moves <= targets.twoStars) return 2;
  return 1;
}
```

### WinModal

Shows earned stars as `★★★` / `★★☆` / `★☆☆` pips above the move count. Calls `progressService.completeLevelWithStars("sokoban", levelId, stars)`.

### LevelSelect

Each level button shows a `★☆☆` row (best stored stars, or all hollow if not completed) below the level number — same pattern as Shikaku's `LevelSelect`.

---

## 2. Shared Progress — Stars Storage

### `CompletedLevel` type update

```ts
export type CompletedLevel = {
  module: string;
  levelId: string;
  completedAt: number;
  stars: number; // best stars achieved (1–3)
};
```

### `ProgressRepository` — new method

```ts
completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean>;
```

Returns `true` if this is a new completion **or** if stars improved. Updates the existing record if stars are better (keep-best logic). The old `completeLevel` is kept for Shikaku backward compat (it internally calls `completeLevelWithStars` with `stars: 1` if not already completed).

### Food calculation

Food available = **sum of best stars across all completed levels** (not just count of completions):

```ts
// service.ts
async getFoodAvailable(): Promise<number> {
  const state = await this.repo.getState();
  const totalStars = state.completedLevels.reduce((sum, l) => sum + (l.stars ?? 1), 0);
  return Math.max(0, totalStars - state.foodConsumed);
}
```

This means completing a level with 1★ and later improving to 3★ grants +2 extra food.

---

## 3. Pet Hunger System

### Cooldown

`HUNGER_COOLDOWN` in `packages/shared/src/progress/service.ts`:

```ts
export const HUNGER_COOLDOWN = 10 * 60 * 1000; // 10 minutes
```

### Hunger level (0–6)

A derived value — not stored, computed on read:

```ts
function getHungryLevel(lastFedAt: number, now: number): number {
  const elapsed = now - lastFedAt;
  return Math.min(6, Math.floor(elapsed / HUNGER_COOLDOWN));
}
```

- 0 = just fed / satisfied
- 1–5 = progressively hungry
- 6 = maximum hunger

`isPetHungry` = `hungryLevel >= 1`.

### `ProgressService` additions

```ts
async getHungryLevel(): Promise<number>
```

### `useProgressService` hook update

Exposes `hungryLevel: number` (0–6) alongside existing `isHungry` and `foodAvailable`. `PetWidget` can use this to show hunger intensity (e.g., visual indicator).

---

## 4. `levels.ts` Star Targets

All 100 Sokoban levels in `packages/sokoban/src/levels.ts` get a `targets` field. Values are computed using the existing solver where feasible, with a fallback formula:

- `threeStars` = optimal moves (from solver) or `boxCount * 8`
- `twoStars` = `threeStars * 1.5` (rounded)
- `oneStar` = always (any completion)

Levels where solver times out get hand-tuned conservative values based on box count and grid area.

---

## Architecture / Data Flow

```
Win event
  → calcStars(moves, level.targets)
  → WinModal displays ★ pips
  → progressService.completeLevelWithStars("sokoban", id, stars)
      → LocalProgressRepository.completeLevelWithStars()
          → updates CompletedLevel.stars if improved
          → dispatches cozyos:progress-updated
  → SokobanApp (menu) re-reads completedLevelIds + best stars
  → LevelSelect renders updated ★☆☆ pips

Food flow:
  getFoodAvailable() = sum(CompletedLevel.stars) - foodConsumed

Hunger flow:
  hungryLevel = min(6, floor((now - lastFedAt) / 10min))
```

---

## Files Changed

| File | Change |
|---|---|
| `packages/shared/src/progress/types.ts` | Add `stars` to `CompletedLevel` |
| `packages/shared/src/repository/ProgressRepository.ts` | Add `completeLevelWithStars` |
| `packages/shared/src/repository/LocalProgressRepository.ts` | Implement `completeLevelWithStars`, update food calc |
| `packages/shared/src/progress/service.ts` | `HUNGER_COOLDOWN` → 10min, add `getHungryLevel`, update `getFoodAvailable` |
| `packages/shell/src/hooks/useProgressService.ts` | Expose `hungryLevel` |
| `packages/sokoban/src/types.ts` | Add `StarTargets`, update `LevelData` |
| `packages/sokoban/src/levels.ts` | Add `targets` to all 100 levels |
| `packages/sokoban/src/components/WinModal.tsx` | Show star pips, call `completeLevelWithStars` |
| `packages/sokoban/src/components/LevelSelect.tsx` | Show ★☆☆ pips per level |
| `packages/sokoban/src/SokobanApp.tsx` | Pass best stars map to LevelSelect |

---

## Out of Scope

- PetWidget visual hunger-level indicator (hunger level exposed but display unchanged)
- Shikaku star migration to shared progress (Shikaku keeps its own localStorage save)
- Leaderboards or server-side persistence
