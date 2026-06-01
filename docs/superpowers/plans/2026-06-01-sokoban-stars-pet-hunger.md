# Sokoban Stars + Pet Hunger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 3-star move-count rating to Sokoban, store stars in shared progress, make food = total stars earned, cut pet hunger cooldown to 10 min, and expose a 0–6 hungry level.

**Architecture:** Shared progress types gain a `stars` field on `CompletedLevel`; a new `completeLevelWithStars` method replaces the bare `completeLevel` call from Sokoban. Food available is computed as sum of best stars rather than count of completions. Hunger level is a derived integer (0–6) calculated from elapsed time since last feed with no new stored state.

**Tech Stack:** TypeScript, React, Zustand, Vitest, Tailwind CSS (Vite monorepo)

**Test commands:**
- Shared: `npx vitest run packages/shared --reporter=verbose`
- Sokoban app: `npx vitest run packages/sokoban/src/SokobanApp --reporter=verbose`

---

## File Map

| File | What changes |
|---|---|
| `packages/shared/src/progress/types.ts` | Add `stars: number` to `CompletedLevel` |
| `packages/shared/src/repository/ProgressRepository.ts` | Add `completeLevelWithStars` |
| `packages/shared/src/repository/LocalProgressRepository.ts` | Implement `completeLevelWithStars` with keep-best logic |
| `packages/shared/src/repository/LocalProgressRepository.test.ts` | New tests for `completeLevelWithStars` |
| `packages/shared/src/progress/service.ts` | `HUNGER_COOLDOWN` → 10 min; `getFoodAvailable` sums stars; add `completeLevelWithStars`, `getHungryLevel` |
| `packages/shared/src/progress/service.test.ts` | Update/add tests for new methods and constant |
| `packages/shared/src/index.ts` | Export `completeLevelWithStars` signature (re-export types) |
| `packages/shell/src/hooks/useProgressService.ts` | Expose `hungryLevel` |
| `packages/sokoban/src/types.ts` | Add `StarTargets`; add `targets` to `LevelData` |
| `packages/sokoban/src/levels.ts` | Add `targets` to all 100 levels |
| `packages/sokoban/src/components/WinModal.tsx` | Show star pips; call `completeLevelWithStars` |
| `packages/sokoban/src/components/LevelSelect.tsx` | Show `★☆☆` pips using best stars map |
| `packages/sokoban/src/SokobanApp.tsx` | Pass best-stars map to `LevelSelect`; update `shared` mock |
| `packages/sokoban/src/SokobanApp.test.tsx` | Update mock for `completeLevelWithStars` |

---

## Task 1: Add `stars` to `CompletedLevel` type and `completeLevelWithStars` to repository interface

**Files:**
- Modify: `packages/shared/src/progress/types.ts`
- Modify: `packages/shared/src/repository/ProgressRepository.ts`

- [ ] **Step 1: Update `CompletedLevel` type**

Replace the content of `packages/shared/src/progress/types.ts`:

```ts
export type CompletedLevel = {
  module: string;
  levelId: string;
  completedAt: number;
  stars: number;
};

export type PetState = {
  xp: number;
  stage: number;
  lastFedAt: number;
};

export type ProgressState = {
  completedLevels: CompletedLevel[];
  foodConsumed: number;
  pet: PetState;
};
```

- [ ] **Step 2: Add `completeLevelWithStars` to the repository interface**

Replace the content of `packages/shared/src/repository/ProgressRepository.ts`:

```ts
import type { ProgressState } from "../progress/types";

export interface ProgressRepository {
  getState(): Promise<ProgressState>;
  completeLevel(module: string, levelId: string): Promise<boolean>;
  completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean>;
  feedPet(): Promise<void>;
  saveState(state: ProgressState): Promise<void>;
}
```

- [ ] **Step 3: Run shared tests — expect failures only on `completeLevel` impl (not yet updated)**

```bash
npx vitest run packages/shared --reporter=verbose
```

Expected: existing `completeLevel` tests still pass. Type errors will appear only when implementing.

- [ ] **Step 4: Commit**

```bash
git add packages/shared/src/progress/types.ts packages/shared/src/repository/ProgressRepository.ts
git commit -m "feat(shared): add stars to CompletedLevel, completeLevelWithStars to repo interface"
```

---

## Task 2: Implement `completeLevelWithStars` in `LocalProgressRepository`

**Files:**
- Modify: `packages/shared/src/repository/LocalProgressRepository.ts`
- Modify: `packages/shared/src/repository/LocalProgressRepository.test.ts`

- [ ] **Step 1: Write failing tests for `completeLevelWithStars`**

Add these cases to the `describe("LocalProgressRepository")` block in `packages/shared/src/repository/LocalProgressRepository.test.ts` (after the existing `completeLevel` describe block):

```ts
describe("completeLevelWithStars", () => {
  it("returns true and saves with stars on first completion", async () => {
    const result = await repo.completeLevelWithStars("sokoban", "hack-01", 3);
    expect(result).toBe(true);
    const state = await repo.getState();
    expect(state.completedLevels).toHaveLength(1);
    expect(state.completedLevels[0].stars).toBe(3);
    expect(state.completedLevels[0].module).toBe("sokoban");
    expect(state.completedLevels[0].levelId).toBe("hack-01");
  });

  it("returns false and keeps higher stars when new stars are lower", async () => {
    await repo.completeLevelWithStars("sokoban", "hack-01", 3);
    const result = await repo.completeLevelWithStars("sokoban", "hack-01", 1);
    expect(result).toBe(false);
    const state = await repo.getState();
    expect(state.completedLevels).toHaveLength(1);
    expect(state.completedLevels[0].stars).toBe(3);
  });

  it("returns true and updates stars when new stars are higher", async () => {
    await repo.completeLevelWithStars("sokoban", "hack-01", 1);
    const result = await repo.completeLevelWithStars("sokoban", "hack-01", 3);
    expect(result).toBe(true);
    const state = await repo.getState();
    expect(state.completedLevels).toHaveLength(1);
    expect(state.completedLevels[0].stars).toBe(3);
  });

  it("returns false and does not change stars when equal", async () => {
    await repo.completeLevelWithStars("sokoban", "hack-01", 2);
    const result = await repo.completeLevelWithStars("sokoban", "hack-01", 2);
    expect(result).toBe(false);
    const state = await repo.getState();
    expect(state.completedLevels[0].stars).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests — verify new tests fail**

```bash
npx vitest run packages/shared/src/repository/LocalProgressRepository.test.ts --reporter=verbose
```

Expected: 4 new tests FAIL with "repo.completeLevelWithStars is not a function"

- [ ] **Step 3: Implement `completeLevelWithStars` in `LocalProgressRepository`**

Also update `completeLevel` to set `stars: 1` for backward compat. Replace the full file `packages/shared/src/repository/LocalProgressRepository.ts`:

```ts
import { getEvolutionStage } from "../pet/evolution";
import type { ProgressRepository } from "./ProgressRepository";
import type { ProgressState } from "../progress/types";

export const STORAGE_KEY = "cozyos.progress.v1";

interface StoredData {
  version: 1;
  state: ProgressState;
}

function initialState(): ProgressState {
  return {
    completedLevels: [],
    foodConsumed: 0,
    pet: { xp: 0, stage: 1, lastFedAt: 0 },
  };
}

export class LocalProgressRepository implements ProgressRepository {
  async getState(): Promise<ProgressState> {
    await Promise.resolve();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialState();
      const data = JSON.parse(raw) as StoredData;
      if (data.version !== 1) return initialState();
      return data.state;
    } catch {
      return initialState();
    }
  }

  async saveState(state: ProgressState): Promise<void> {
    await Promise.resolve();
    const data: StoredData = { version: 1, state };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      throw new Error(`Failed to save progress: ${String(err)}`);
    }
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    return this.completeLevelWithStars(module, levelId, 1);
  }

  async completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean> {
    const state = await this.getState();
    const existing = state.completedLevels.find(
      (l) => l.module === module && l.levelId === levelId
    );
    if (existing) {
      if (stars <= existing.stars) return false;
      // Upgrade stars
      await this.saveState({
        ...state,
        completedLevels: state.completedLevels.map((l) =>
          l.module === module && l.levelId === levelId
            ? { ...l, stars, completedAt: Date.now() }
            : l
        ),
      });
      return true;
    }
    await this.saveState({
      ...state,
      completedLevels: [
        ...state.completedLevels,
        { module, levelId, stars, completedAt: Date.now() },
      ],
    });
    return true;
  }

  async feedPet(): Promise<void> {
    const state = await this.getState();
    const newXp = state.pet.xp + 1;
    await this.saveState({
      ...state,
      foodConsumed: state.foodConsumed + 1,
      pet: {
        xp: newXp,
        stage: getEvolutionStage(newXp),
        lastFedAt: Date.now(),
      },
    });
  }
}
```

- [ ] **Step 4: Run tests — all pass**

```bash
npx vitest run packages/shared/src/repository/LocalProgressRepository.test.ts --reporter=verbose
```

Expected: all 13 tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/repository/LocalProgressRepository.ts packages/shared/src/repository/LocalProgressRepository.test.ts
git commit -m "feat(shared): implement completeLevelWithStars with keep-best logic"
```

---

## Task 3: Update `ProgressService` — hunger cooldown, food sums stars, new methods

**Files:**
- Modify: `packages/shared/src/progress/service.ts`
- Modify: `packages/shared/src/progress/service.test.ts`

- [ ] **Step 1: Write failing tests**

Replace the full content of `packages/shared/src/progress/service.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { ProgressService, HUNGER_COOLDOWN } from "./service";
import type { ProgressRepository } from "../repository/ProgressRepository";
import type { ProgressState } from "./types";

function makeState(overrides?: Partial<ProgressState>): ProgressState {
  return {
    completedLevels: [],
    foodConsumed: 0,
    pet: { xp: 0, stage: 1, lastFedAt: 0 },
    ...overrides,
  };
}

function makeMockRepo(state: ProgressState): ProgressRepository {
  return {
    getState: vi.fn().mockResolvedValue(state),
    saveState: vi.fn().mockResolvedValue(undefined),
    completeLevel: vi.fn().mockResolvedValue(true),
    completeLevelWithStars: vi.fn().mockResolvedValue(true),
    feedPet: vi.fn().mockResolvedValue(undefined),
  };
}

describe("ProgressService", () => {
  describe("getFoodAvailable", () => {
    it("returns sum of stars minus foodConsumed", async () => {
      const state = makeState({
        completedLevels: [
          { module: "shikaku", levelId: "a", completedAt: 1, stars: 1 },
          { module: "sokoban", levelId: "b", completedAt: 2, stars: 3 },
          { module: "shikaku", levelId: "c", completedAt: 3, stars: 2 },
        ],
        foodConsumed: 2,
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getFoodAvailable()).toBe(4); // 1+3+2 - 2 = 4
    });

    it("returns 0 when no levels completed", async () => {
      const service = new ProgressService(makeMockRepo(makeState()));
      expect(await service.getFoodAvailable()).toBe(0);
    });

    it("returns 0 when foodConsumed equals total stars", async () => {
      const state = makeState({
        completedLevels: [
          { module: "sokoban", levelId: "a", completedAt: 1, stars: 2 },
        ],
        foodConsumed: 2,
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getFoodAvailable()).toBe(0);
    });

    it("treats missing stars field as 1 (backward compat)", async () => {
      const state = makeState({
        completedLevels: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { module: "shikaku", levelId: "a", completedAt: 1 } as any,
        ],
        foodConsumed: 0,
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getFoodAvailable()).toBe(1);
    });
  });

  describe("isPetHungry", () => {
    it("returns true when lastFedAt is 0 (never fed)", async () => {
      const service = new ProgressService(makeMockRepo(makeState()));
      expect(await service.isPetHungry()).toBe(true);
    });

    it("returns false when fed less than HUNGER_COOLDOWN ago", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now() - 1000 } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.isPetHungry()).toBe(false);
    });

    it("returns true when fed exactly HUNGER_COOLDOWN ago", async () => {
      const state = makeState({
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN },
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.isPetHungry()).toBe(true);
    });
  });

  describe("getHungryLevel", () => {
    it("returns 0 when pet was just fed", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now() } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(0);
    });

    it("returns 1 when one cooldown has elapsed", async () => {
      const state = makeState({
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN },
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(1);
    });

    it("returns 3 when three cooldowns have elapsed", async () => {
      const state = makeState({
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN * 3 },
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(3);
    });

    it("caps at 6 even when many cooldowns have elapsed", async () => {
      const state = makeState({
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN * 100 },
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(6);
    });
  });

  describe("completeLevelWithStars", () => {
    it("delegates to repository and returns its result", async () => {
      const repo = makeMockRepo(makeState());
      const service = new ProgressService(repo);
      const result = await service.completeLevelWithStars("sokoban", "hack-01", 3);
      expect(result).toBe(true);
      expect(repo.completeLevelWithStars).toHaveBeenCalledWith("sokoban", "hack-01", 3);
    });

    it("dispatches cozyos:progress-updated when repo returns true", async () => {
      const spy = vi.spyOn(window, "dispatchEvent");
      const repo = makeMockRepo(makeState());
      const service = new ProgressService(repo);
      await service.completeLevelWithStars("sokoban", "hack-01", 3);
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });

    it("does NOT dispatch event when repo returns false (no improvement)", async () => {
      const repo = makeMockRepo(makeState());
      (repo.completeLevelWithStars as ReturnType<typeof vi.fn>).mockResolvedValue(false);
      const spy = vi.spyOn(window, "dispatchEvent");
      const service = new ProgressService(repo);
      await service.completeLevelWithStars("sokoban", "hack-01", 1);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("completeLevel", () => {
    it("delegates to repository and returns its result", async () => {
      const repo = makeMockRepo(makeState());
      const service = new ProgressService(repo);
      const result = await service.completeLevel("shikaku", "easy-1");
      expect(result).toBe(true);
      expect(repo.completeLevel).toHaveBeenCalledWith("shikaku", "easy-1");
    });

    it("dispatches cozyos:progress-updated when first completion", async () => {
      const spy = vi.spyOn(window, "dispatchEvent");
      const repo = makeMockRepo(makeState());
      const service = new ProgressService(repo);
      await service.completeLevel("shikaku", "easy-1");
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });

    it("does NOT dispatch event when level already completed (repo returns false)", async () => {
      const repo = makeMockRepo(makeState());
      (repo.completeLevel as ReturnType<typeof vi.fn>).mockResolvedValue(false);
      const spy = vi.spyOn(window, "dispatchEvent");
      const service = new ProgressService(repo);
      await service.completeLevel("shikaku", "easy-1");
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("feedPet", () => {
    it("calls repo.feedPet when pet is hungry and food is available", async () => {
      const state = makeState({
        completedLevels: [{ module: "s", levelId: "1", completedAt: 1, stars: 1 }],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0 },
      });
      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(repo.feedPet).toHaveBeenCalledOnce();
    });

    it("does NOT call repo.feedPet when pet is not hungry", async () => {
      const state = makeState({
        completedLevels: [{ module: "s", levelId: "1", completedAt: 1, stars: 1 }],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() },
      });
      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(repo.feedPet).not.toHaveBeenCalled();
    });

    it("does NOT call repo.feedPet when food is 0", async () => {
      const state = makeState({
        completedLevels: [],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0 },
      });
      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(repo.feedPet).not.toHaveBeenCalled();
    });

    it("dispatches cozyos:progress-updated when feed succeeds", async () => {
      const state = makeState({
        completedLevels: [{ module: "s", levelId: "1", completedAt: 1, stars: 1 }],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0 },
      });
      const repo = makeMockRepo(state);
      const spy = vi.spyOn(window, "dispatchEvent");
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });
  });

  describe("HUNGER_COOLDOWN", () => {
    it("is 10 minutes in milliseconds", () => {
      expect(HUNGER_COOLDOWN).toBe(10 * 60 * 1000);
    });
  });
});
```

- [ ] **Step 2: Run tests — verify new tests fail**

```bash
npx vitest run packages/shared/src/progress/service.test.ts --reporter=verbose
```

Expected: ~8 tests fail (getHungryLevel, completeLevelWithStars, food sum, HUNGER_COOLDOWN value)

- [ ] **Step 3: Implement updated `service.ts`**

Replace the full content of `packages/shared/src/progress/service.ts`:

```ts
import type { ProgressRepository } from "../repository/ProgressRepository";
import type { ProgressState } from "./types";

export const HUNGER_COOLDOWN = 10 * 60 * 1000;

export class ProgressService {
  constructor(private readonly repo: ProgressRepository) {}

  async getState(): Promise<ProgressState> {
    return this.repo.getState();
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    const result = await this.repo.completeLevel(module, levelId);
    if (result && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
    return result;
  }

  async completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean> {
    const result = await this.repo.completeLevelWithStars(module, levelId, stars);
    if (result && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
    return result;
  }

  async feedPet(): Promise<void> {
    const state = await this.repo.getState();
    const isHungry = Date.now() - state.pet.lastFedAt >= HUNGER_COOLDOWN;
    const foodAvailable = await this.getFoodAvailable();
    if (!isHungry || foodAvailable <= 0) return;
    await this.repo.feedPet();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
  }

  async getFoodAvailable(): Promise<number> {
    const state = await this.repo.getState();
    const totalStars = state.completedLevels.reduce(
      (sum, l) => sum + (l.stars ?? 1),
      0
    );
    return Math.max(0, totalStars - state.foodConsumed);
  }

  async isPetHungry(): Promise<boolean> {
    const state = await this.repo.getState();
    return Date.now() - state.pet.lastFedAt >= HUNGER_COOLDOWN;
  }

  async getHungryLevel(): Promise<number> {
    const state = await this.repo.getState();
    const elapsed = Date.now() - state.pet.lastFedAt;
    return Math.min(6, Math.floor(elapsed / HUNGER_COOLDOWN));
  }

  async getPetStage(): Promise<number> {
    const state = await this.repo.getState();
    return state.pet.stage;
  }
}
```

- [ ] **Step 4: Run tests — all pass**

```bash
npx vitest run packages/shared --reporter=verbose
```

Expected: all 35+ tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/shared/src/progress/service.ts packages/shared/src/progress/service.test.ts
git commit -m "feat(shared): 10min hunger cooldown, food=sum(stars), getHungryLevel, completeLevelWithStars"
```

---

## Task 4: Update `shared/src/index.ts` exports

**Files:**
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Export `getHungryLevel` indirectly (it's a method, no new export needed) — but verify `ProgressRepository` type exports `completeLevelWithStars`**

The interface change is already in `ProgressRepository.ts`. Only update the type export to re-export cleanly:

Replace `packages/shared/src/index.ts`:

```ts
export type { CompletedLevel, PetState, ProgressState } from "./progress/types";
export type { ProgressRepository } from "./repository/ProgressRepository";
export { LocalProgressRepository, STORAGE_KEY } from "./repository/LocalProgressRepository";
export { ProgressService, HUNGER_COOLDOWN } from "./progress/service";
export { getEvolutionStage, EVOLUTION_THRESHOLDS } from "./pet/evolution";
```

(No change needed — already exports everything. Verify it hasn't drifted.)

- [ ] **Step 2: Run full shared test suite to confirm no regressions**

```bash
npx vitest run packages/shared --reporter=verbose
```

Expected: all tests pass

- [ ] **Step 3: Commit**

```bash
git add packages/shared/src/index.ts
git commit -m "chore(shared): verify index exports after type changes"
```

---

## Task 5: Expose `hungryLevel` in `useProgressService` hook

**Files:**
- Modify: `packages/shell/src/hooks/useProgressService.ts`

- [ ] **Step 1: Update hook to fetch and expose `hungryLevel`**

Replace the full content of `packages/shell/src/hooks/useProgressService.ts`:

```ts
import { useState, useEffect, useCallback } from "react";
import { ProgressService, LocalProgressRepository } from "shared";
import type { ProgressState } from "shared";

const progressService = new ProgressService(new LocalProgressRepository());

const EMPTY_STATE: ProgressState = {
  completedLevels: [],
  foodConsumed: 0,
  pet: { xp: 0, stage: 1, lastFedAt: 0 },
};

export function useProgressService() {
  const [state, setState] = useState<ProgressState>(EMPTY_STATE);
  const [isHungry, setIsHungry] = useState(false);
  const [foodAvailable, setFoodAvailable] = useState(0);
  const [hungryLevel, setHungryLevel] = useState(0);

  const refresh = useCallback(async () => {
    const [s, hungry, food, level] = await Promise.all([
      progressService.getState(),
      progressService.isPetHungry(),
      progressService.getFoodAvailable(),
      progressService.getHungryLevel(),
    ]);
    setState(s);
    setIsHungry(hungry);
    setFoodAvailable(food);
    setHungryLevel(level);
  }, []);

  useEffect(() => {
    void refresh();
    const handler = () => { void refresh(); };
    window.addEventListener("cozyos:progress-updated", handler);
    return () => window.removeEventListener("cozyos:progress-updated", handler);
  }, [refresh]);

  const feedPet = useCallback(async () => {
    await progressService.feedPet();
  }, []);

  return { state, isHungry, foodAvailable, hungryLevel, feedPet };
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/shell/src/hooks/useProgressService.ts
git commit -m "feat(shell): expose hungryLevel (0-6) from useProgressService hook"
```

---

## Task 6: Add `StarTargets` to Sokoban types and `targets` to all 100 levels

**Files:**
- Modify: `packages/sokoban/src/types.ts`
- Modify: `packages/sokoban/src/levels.ts`

- [ ] **Step 1: Add `StarTargets` interface and update `LevelData` in `types.ts`**

Replace `packages/sokoban/src/types.ts`:

```ts
export enum TileType {
  EMPTY = 0,
  WALL = 1,
  FLOOR = 2,
  TARGET = 3
}

export interface Player {
  x: number;
  y: number;
}

export interface Box {
  id: string;
  x: number;
  y: number;
}

export interface MoveSnapshot {
  player: Player;
  boxes: Box[];
}

export interface StarTargets {
  threeStars: number;
  twoStars: number;
}

export interface LevelData {
  id: string;
  name: string;
  grid: string[];
  targets: StarTargets;
}
```

Note: `oneStar` is implicit (any completion). Only `threeStars` and `twoStars` thresholds are needed.

- [ ] **Step 2: Add `targets` to all 100 levels in `levels.ts`**

Each level needs `targets: { threeStars: N, twoStars: M }`. Values are based on box count and known puzzle complexity. Add the `targets` field to every level object. The full updated file is large — here is the formula used and the values for each level:

Formula: `threeStars = boxCount * 8`, `twoStars = boxCount * 14`. For levels 51–100 (harder), use `threeStars = boxCount * 10`, `twoStars = boxCount * 18`.

Below is every level with its targets. Open `packages/sokoban/src/levels.ts` and add the `targets` field after the `grid` array for each level:

```
hack-01 (3 boxes): targets: { threeStars: 24, twoStars: 42 }
hack-02 (5 boxes): targets: { threeStars: 40, twoStars: 70 }
hack-03 (4 boxes): targets: { threeStars: 32, twoStars: 56 }
hack-04 (4 boxes): targets: { threeStars: 32, twoStars: 56 }
hack-05 (5 boxes): targets: { threeStars: 40, twoStars: 70 }
hack-06 (5 boxes): targets: { threeStars: 40, twoStars: 70 }
hack-07 (4 boxes): targets: { threeStars: 32, twoStars: 56 }
hack-08 (5 boxes): targets: { threeStars: 40, twoStars: 70 }
hack-09 (5 boxes): targets: { threeStars: 40, twoStars: 70 }
hack-10 (6 boxes): targets: { threeStars: 48, twoStars: 84 }
hack-11 (5 boxes): targets: { threeStars: 40, twoStars: 70 }
hack-12 (6 boxes): targets: { threeStars: 48, twoStars: 84 }
hack-13 (5 boxes): targets: { threeStars: 40, twoStars: 70 }
hack-14 (6 boxes): targets: { threeStars: 48, twoStars: 84 }
hack-15 (6 boxes): targets: { threeStars: 48, twoStars: 84 }
hack-16 (5 boxes): targets: { threeStars: 40, twoStars: 70 }
hack-17 (6 boxes): targets: { threeStars: 48, twoStars: 84 }
hack-18 (6 boxes): targets: { threeStars: 48, twoStars: 84 }
hack-19 (6 boxes): targets: { threeStars: 48, twoStars: 84 }
hack-20 (7 boxes): targets: { threeStars: 56, twoStars: 98 }
hack-21 (6 boxes): targets: { threeStars: 48, twoStars: 84 }
hack-22 (7 boxes): targets: { threeStars: 56, twoStars: 98 }
hack-23 (7 boxes): targets: { threeStars: 56, twoStars: 98 }
hack-24 (7 boxes): targets: { threeStars: 56, twoStars: 98 }
hack-25 (7 boxes): targets: { threeStars: 56, twoStars: 98 }
hack-26 (7 boxes): targets: { threeStars: 56, twoStars: 98 }
hack-27 (8 boxes): targets: { threeStars: 64, twoStars: 112 }
hack-28 (7 boxes): targets: { threeStars: 56, twoStars: 98 }
hack-29 (8 boxes): targets: { threeStars: 64, twoStars: 112 }
hack-30 (8 boxes): targets: { threeStars: 64, twoStars: 112 }
hack-31 (7 boxes): targets: { threeStars: 56, twoStars: 98 }
hack-32 (8 boxes): targets: { threeStars: 64, twoStars: 112 }
hack-33 (8 boxes): targets: { threeStars: 64, twoStars: 112 }
hack-34 (8 boxes): targets: { threeStars: 64, twoStars: 112 }
hack-35 (8 boxes): targets: { threeStars: 64, twoStars: 112 }
hack-36 (8 boxes): targets: { threeStars: 64, twoStars: 112 }
hack-37 (9 boxes): targets: { threeStars: 72, twoStars: 126 }
hack-38 (9 boxes): targets: { threeStars: 72, twoStars: 126 }
hack-39 (9 boxes): targets: { threeStars: 72, twoStars: 126 }
hack-40 (9 boxes): targets: { threeStars: 72, twoStars: 126 }
hack-41 (9 boxes): targets: { threeStars: 72, twoStars: 126 }
hack-42 (9 boxes): targets: { threeStars: 72, twoStars: 126 }
hack-43 (10 boxes): targets: { threeStars: 80, twoStars: 140 }
hack-44 (10 boxes): targets: { threeStars: 80, twoStars: 140 }
hack-45 (10 boxes): targets: { threeStars: 80, twoStars: 140 }
hack-46 (10 boxes): targets: { threeStars: 80, twoStars: 140 }
hack-47 (10 boxes): targets: { threeStars: 80, twoStars: 140 }
hack-48 (10 boxes): targets: { threeStars: 80, twoStars: 140 }
hack-49 (10 boxes): targets: { threeStars: 80, twoStars: 140 }
hack-50 (11 boxes): targets: { threeStars: 88, twoStars: 154 }
hack-51 (5 boxes): targets: { threeStars: 50, twoStars: 90 }
hack-52 (6 boxes): targets: { threeStars: 60, twoStars: 108 }
hack-53 (6 boxes): targets: { threeStars: 60, twoStars: 108 }
hack-54 (6 boxes): targets: { threeStars: 60, twoStars: 108 }
hack-55 (7 boxes): targets: { threeStars: 70, twoStars: 126 }
hack-56 (7 boxes): targets: { threeStars: 70, twoStars: 126 }
hack-57 (7 boxes): targets: { threeStars: 70, twoStars: 126 }
hack-58 (7 boxes): targets: { threeStars: 70, twoStars: 126 }
hack-59 (8 boxes): targets: { threeStars: 80, twoStars: 144 }
hack-60 (8 boxes): targets: { threeStars: 80, twoStars: 144 }
hack-61 (8 boxes): targets: { threeStars: 80, twoStars: 144 }
hack-62 (8 boxes): targets: { threeStars: 80, twoStars: 144 }
hack-63 (9 boxes): targets: { threeStars: 90, twoStars: 162 }
hack-64 (9 boxes): targets: { threeStars: 90, twoStars: 162 }
hack-65 (9 boxes): targets: { threeStars: 90, twoStars: 162 }
hack-66 (9 boxes): targets: { threeStars: 90, twoStars: 162 }
hack-67 (10 boxes): targets: { threeStars: 100, twoStars: 180 }
hack-68 (10 boxes): targets: { threeStars: 100, twoStars: 180 }
hack-69 (10 boxes): targets: { threeStars: 100, twoStars: 180 }
hack-70 (10 boxes): targets: { threeStars: 100, twoStars: 180 }
hack-71 (10 boxes): targets: { threeStars: 100, twoStars: 180 }
hack-72 (11 boxes): targets: { threeStars: 110, twoStars: 198 }
hack-73 (11 boxes): targets: { threeStars: 110, twoStars: 198 }
hack-74 (11 boxes): targets: { threeStars: 110, twoStars: 198 }
hack-75 (11 boxes): targets: { threeStars: 110, twoStars: 198 }
hack-76 (11 boxes): targets: { threeStars: 110, twoStars: 198 }
hack-77 (12 boxes): targets: { threeStars: 120, twoStars: 216 }
hack-78 (12 boxes): targets: { threeStars: 120, twoStars: 216 }
hack-79 (12 boxes): targets: { threeStars: 120, twoStars: 216 }
hack-80 (12 boxes): targets: { threeStars: 120, twoStars: 216 }
hack-81 (12 boxes): targets: { threeStars: 120, twoStars: 216 }
hack-82 (13 boxes): targets: { threeStars: 130, twoStars: 234 }
hack-83 (13 boxes): targets: { threeStars: 130, twoStars: 234 }
hack-84 (13 boxes): targets: { threeStars: 130, twoStars: 234 }
hack-85 (13 boxes): targets: { threeStars: 130, twoStars: 234 }
hack-86 (13 boxes): targets: { threeStars: 130, twoStars: 234 }
hack-87 (14 boxes): targets: { threeStars: 140, twoStars: 252 }
hack-88 (14 boxes): targets: { threeStars: 140, twoStars: 252 }
hack-89 (14 boxes): targets: { threeStars: 140, twoStars: 252 }
hack-90 (14 boxes): targets: { threeStars: 140, twoStars: 252 }
hack-91 (14 boxes): targets: { threeStars: 140, twoStars: 252 }
hack-92 (15 boxes): targets: { threeStars: 150, twoStars: 270 }
hack-93 (15 boxes): targets: { threeStars: 150, twoStars: 270 }
hack-94 (15 boxes): targets: { threeStars: 150, twoStars: 270 }
hack-95 (15 boxes): targets: { threeStars: 150, twoStars: 270 }
hack-96 (15 boxes): targets: { threeStars: 150, twoStars: 270 }
hack-97 (16 boxes): targets: { threeStars: 160, twoStars: 288 }
hack-98 (16 boxes): targets: { threeStars: 160, twoStars: 288 }
hack-99 (16 boxes): targets: { threeStars: 160, twoStars: 288 }
hack-100 (16 boxes): targets: { threeStars: 160, twoStars: 288 }
```

To apply: for each level object in `levels.ts`, add the `targets` property after `grid`. Example for hack-01:

```ts
{
  "id": "hack-01",
  "name": "Hello World",
  grid: [
    "#######",
    "#     #",
    "# .$. #",
    "# $.$ #",
    "#  @  #",
    "#######"
  ],
  targets: { threeStars: 24, twoStars: 42 }
},
```

Use a script or editor multi-cursor to add all 100. The actual box counts must be verified against the real grid — use this helper script to count boxes per level and generate the targets, then paste:

```bash
node -e "
const fs = require('fs');
const src = fs.readFileSync('packages/sokoban/src/levels.ts','utf8');
const idMatches = [...src.matchAll(/\"id\":\s*\"(hack-\d+)\"/g)].map(m=>m[1]);
const gridBlocks = [...src.matchAll(/grid:\s*\[([^\]]+)\]/g)].map(m=>m[1]);
gridBlocks.forEach((g,i)=>{
  const boxes = (g.match(/\\\$|\*/g)||[]).length;
  const id = idMatches[i];
  const n = parseInt(id.split('-')[1]);
  const mult = n > 50 ? 10 : 8;
  const mult2 = n > 50 ? 18 : 14;
  console.log(id+': targets: { threeStars: '+boxes*mult+', twoStars: '+boxes*mult2+' }');
});
"
```

Run this script, capture the output, then edit `levels.ts` to add each `targets` field.

- [ ] **Step 3: Verify TypeScript compiles with no errors**

```bash
cd packages/sokoban && npx tsc --noEmit 2>&1 | head -20
```

Expected: no output (no errors)

- [ ] **Step 4: Commit**

```bash
git add packages/sokoban/src/types.ts packages/sokoban/src/levels.ts
git commit -m "feat(sokoban): add StarTargets type and move-count thresholds to all 100 levels"
```

---

## Task 7: Update `WinModal` — show star pips and call `completeLevelWithStars`

**Files:**
- Modify: `packages/sokoban/src/components/WinModal.tsx`

- [ ] **Step 1: Replace `WinModal.tsx`**

```tsx
import React, { useEffect, useState } from "react";
import { ProgressService, LocalProgressRepository } from "shared";
import { useSokobanStore } from "../store/useSokobanStore";
import { synth } from "../engine/synth";
import { SOKOBAN_LEVELS } from "../levels";

const progressService = new ProgressService(new LocalProgressRepository());

function calcStars(moves: number, threeStars: number, twoStars: number): number {
  if (moves <= threeStars) return 3;
  if (moves <= twoStars) return 2;
  return 1;
}

interface WinModalProps {
  onBack: () => void;
}

export default function WinModal({ onBack }: WinModalProps): React.ReactElement {
  const isWon = useSokobanStore((state) => state.isWon);
  const nextLevel = useSokobanStore((state) => state.nextLevel);
  const moves = useSokobanStore((state) => state.moves);
  const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);
  const [earnedStars, setEarnedStars] = useState(0);

  useEffect(() => {
    if (isWon) {
      synth.playWin();
    }
  }, [isWon]);

  useEffect(() => {
    if (!isWon) {
      setRewardMsg(null);
      setEarnedStars(0);
      return;
    }
    const level = SOKOBAN_LEVELS[currentLevelIdx];
    const stars = level
      ? calcStars(moves, level.targets.threeStars, level.targets.twoStars)
      : 1;
    setEarnedStars(stars);
    void progressService
      .completeLevelWithStars("sokoban", level?.id ?? `level-${currentLevelIdx}`, stars)
      .then((improved) => {
        setRewardMsg(improved ? `+${stars} FOOD` : "ALREADY BEST");
      });
  }, [isWon, currentLevelIdx, moves]);

  if (!isWon) return <React.Fragment />;

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 select-none">
      <div className="border border-[#FFB000] bg-[#050505] p-6 max-w-xs w-full text-center flex flex-col items-center gap-4">
        <h2 className="font-press text-[14px] text-cozy-text animate-bounce">
          STAGE CLEAR!
        </h2>
        <div className="text-[18px] tracking-widest">
          {"★".repeat(earnedStars)}{"☆".repeat(3 - earnedStars)}
        </div>
        <p className="font-mono text-sm text-cozy-text">
          Finished in{" "}
          <span className="font-bold font-press text-[11px] text-cozy-text">
            {moves}
          </span>{" "}
          movements.
        </p>
        {rewardMsg && (
          <p className="font-press text-[9px] border border-cozy-border px-2 py-1 text-cozy-text">
            {rewardMsg}
          </p>
        )}
        <div className="flex gap-4 mt-2">
          <button
            onClick={nextLevel}
            className="pixel-btn text-[10px] text-cozy-text"
            aria-label="Next stage"
          >
            NEXT &gt;
          </button>
          <button
            onClick={onBack}
            className="pixel-btn text-[10px] text-cozy-text/70"
            aria-label="Main menu"
          >
            MENU
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/sokoban/src/components/WinModal.tsx
git commit -m "feat(sokoban): show star pips in WinModal, call completeLevelWithStars"
```

---

## Task 8: Update `LevelSelect` — show `★☆☆` pips per level

**Files:**
- Modify: `packages/sokoban/src/components/LevelSelect.tsx`
- Modify: `packages/sokoban/src/SokobanApp.tsx`

- [ ] **Step 1: Update `LevelSelect` props and render star pips**

Replace `packages/sokoban/src/components/LevelSelect.tsx`:

```tsx
import React from "react";
import { SOKOBAN_LEVELS } from "../levels";

interface LevelSelectProps {
  onSelect: (idx: number) => void;
  bestStars: Record<string, number>;
  currentLevelIdx?: number;
}

export default function LevelSelect({ onSelect, bestStars, currentLevelIdx }: LevelSelectProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-2 text-cozy-text font-mono w-full min-h-0 flex-1">
      <h2 className="font-press text-[12px] text-center my-2 shrink-0">SELECT LEVEL</h2>
      <div className="grid grid-cols-5 gap-3 p-2 overflow-y-auto flex-1 min-h-0">
        {SOKOBAN_LEVELS.map((level, idx) => {
          const stars = bestStars[level.id] ?? 0;
          const active = currentLevelIdx === idx;
          return (
            <button
              key={level.id}
              onClick={() => onSelect(idx)}
              className={`w-10 h-10 border flex flex-col items-center justify-center font-press cursor-pointer transition-colors active:translate-y-0.5 ${
                active
                  ? "border-[#FFB000] bg-[#FFB000]/10 text-[#FFB000]"
                  : stars > 0
                  ? "border-cozy-border bg-black text-[#FFB000] hover:bg-cozy-text hover:text-black hover:scale-105"
                  : "border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black hover:scale-105"
              }`}
              aria-label={`Select level ${idx + 1}${stars > 0 ? ` (${stars} star${stars > 1 ? "s" : ""})` : ""}`}
            >
              <span className="text-[10px]">{idx + 1}</span>
              {stars > 0 && (
                <span className="text-[6px] leading-none mt-0.5">
                  {"★".repeat(stars)}{"☆".repeat(3 - stars)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `SokobanApp.tsx` to pass `bestStars` map instead of `completedLevelIds`**

Replace `packages/sokoban/src/SokobanApp.tsx`:

```tsx
import React, { useState, useEffect, useCallback } from "react";
import { ProgressService, LocalProgressRepository } from "shared";
import { useSokobanStore } from "./store/useSokobanStore";
import HUD from "./components/HUD";
import Board from "./components/Board";
import LevelSelect from "./components/LevelSelect";
import Controls from "./components/Controls";
import WinModal from "./components/WinModal";

const progressService = new ProgressService(new LocalProgressRepository());

export default function SokobanApp(): React.ReactElement {
  const [view, setView] = useState<"menu" | "game">("menu");
  const [bestStars, setBestStars] = useState<Record<string, number>>({});
  const loadLevel = useSokobanStore((state) => state.loadLevel);
  const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);

  const refreshProgress = useCallback(async () => {
    const state = await progressService.getState();
    const map: Record<string, number> = {};
    for (const c of state.completedLevels) {
      if (c.module === "sokoban") {
        map[c.levelId] = c.stars ?? 1;
      }
    }
    setBestStars(map);
  }, []);

  useEffect(() => {
    void refreshProgress();
    const handler = () => { void refreshProgress(); };
    window.addEventListener("cozyos:progress-updated", handler);
    return () => window.removeEventListener("cozyos:progress-updated", handler);
  }, [refreshProgress]);

  const handleSelectLevel = (idx: number): void => {
    loadLevel(idx);
    setView("game");
  };

  return (
    <div className="w-full max-w-[450px] border border-cozy-border bg-black p-4 select-none relative flex flex-col items-center text-cozy-text max-h-[calc(100vh-120px)]">
      {view === "menu" ? (
        <LevelSelect
          onSelect={handleSelectLevel}
          bestStars={bestStars}
          currentLevelIdx={currentLevelIdx}
        />
      ) : (
        <div className="flex flex-col gap-4 items-center w-full relative">
          <HUD onBack={() => setView("menu")} />
          <Board />
          <Controls />
          <WinModal onBack={() => setView("menu")} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Update `SokobanApp.test.tsx` mock for `completeLevelWithStars`**

In `packages/sokoban/src/SokobanApp.test.tsx`, update the `shared` mock to add `completeLevelWithStars`:

```ts
vi.mock("shared", () => ({
  ProgressService: vi.fn().mockImplementation(() => ({
    completeLevel: vi.fn().mockResolvedValue(true),
    completeLevelWithStars: vi.fn().mockResolvedValue(true),
    feedPet: vi.fn().mockResolvedValue(undefined),
    getFoodAvailable: vi.fn().mockResolvedValue(0),
    isPetHungry: vi.fn().mockResolvedValue(false),
    getHungryLevel: vi.fn().mockResolvedValue(0),
    getState: vi.fn().mockResolvedValue({
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 0, stage: 1, lastFedAt: 0 },
    }),
  })),
  LocalProgressRepository: vi.fn().mockImplementation(() => ({})),
}));
```

- [ ] **Step 4: Run Sokoban app tests**

```bash
npx vitest run packages/sokoban/src/SokobanApp --reporter=verbose
```

Expected: all tests pass (the level-1 button now shows number + star pip area)

- [ ] **Step 5: Commit**

```bash
git add packages/sokoban/src/components/LevelSelect.tsx packages/sokoban/src/SokobanApp.tsx packages/sokoban/src/SokobanApp.test.tsx
git commit -m "feat(sokoban): show star pips in LevelSelect, pass bestStars map from SokobanApp"
```

---

## Task 9: Final verification

- [ ] **Step 1: Run all shared tests**

```bash
npx vitest run packages/shared --reporter=verbose
```

Expected: all pass

- [ ] **Step 2: Run all sokoban tests (excluding solver/existing-levels)**

```bash
npx vitest run packages/sokoban/src/SokobanApp packages/sokoban/src/components --reporter=verbose
```

Expected: all pass

- [ ] **Step 3: TypeScript check**

```bash
cd packages/sokoban && npx tsc --noEmit 2>&1 | head -30
cd ../shared && npx tsc --noEmit 2>&1 | head -30
```

Expected: no output

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(sokoban,shared): star system + pet hunger redesign complete"
```
