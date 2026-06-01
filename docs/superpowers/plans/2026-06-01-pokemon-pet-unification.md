# Pokemon Pet Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the Pet MFE and HUD states under the shared persistent ProgressService, implement dynamic hunger and happiness decay (slower during sleep), add Play and Sleep action buttons, and render a Pokemon grass-starter themed evolution chain in 16x16 SVG.

**Architecture:** Extend the `PetState` schema in `shared` to include `happiness`, `lastPlayedAt`, and `isSleeping`. Update `LocalProgressRepository` to support these with backward-compatible defaults. Add dynamic decay logic to `ProgressService` (calculating hunger/happiness based on time elapsed and sleeping status). Redesign `PetSprite.tsx` to render Egg, Leafy Sprout, Budreptile, Florasaur, and Mega Florasaur, and update both UI clients (`PetWidget` and `PetsApp`) to consume the synced progress state.

**Tech Stack:** TypeScript, React, Zustand, Vitest, Tailwind CSS (Vite monorepo).

---

## File Map

### Create
No files need to be created.

### Modify
* `packages/shared/src/progress/types.ts`
* `packages/shared/src/repository/ProgressRepository.ts`
* `packages/shared/src/repository/LocalProgressRepository.ts`
* `packages/shared/src/repository/LocalProgressRepository.test.ts`
* `packages/shared/src/progress/service.ts`
* `packages/shared/src/progress/service.test.ts`
* `packages/shell/src/hooks/useProgressService.ts`
* `packages/shell/src/components/PetSprite.tsx`
* `packages/shell/src/components/PetWidget.tsx`
* `packages/pets/src/PetsApp.tsx`
* `packages/shell/src/App.tsx`

---

### Task 1: Extend Progress Types and Repository Interface

**Files:**
* Modify: `packages/shared/src/progress/types.ts`
* Modify: `packages/shared/src/repository/ProgressRepository.ts`

- [x] **Step 1: Update `PetState` type schema**
  Modify `packages/shared/src/progress/types.ts` to add `happiness`, `lastPlayedAt`, and `isSleeping`:
  ```typescript
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
    happiness: number;     // 0 - 100
    lastPlayedAt: number;  // timestamp
    isSleeping: boolean;
  };

  export type ProgressState = {
    completedLevels: CompletedLevel[];
    foodConsumed: number;
    pet: PetState;
  };
  ```

- [x] **Step 2: Add `playWithPet` and `toggleSleep` to the repository interface**
  Modify `packages/shared/src/repository/ProgressRepository.ts` to define the signatures for play and sleep:
  ```typescript
  import type { ProgressState } from "../progress/types";

  export interface ProgressRepository {
    getState(): Promise<ProgressState>;
    completeLevel(module: string, levelId: string): Promise<boolean>;
    completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean>;
    feedPet(): Promise<void>;
    playWithPet(happiness: number): Promise<void>;
    toggleSleep(): Promise<void>;
    saveState(state: ProgressState): Promise<void>;
  }
  ```

- [x] **Step 3: Run shared tests to ensure compilation**
  Run: `npx vitest run packages/shared/src/pet/evolution.test.ts`
  Expected: PASS

- [x] **Step 4: Commit**
  ```bash
  git add packages/shared/src/progress/types.ts packages/shared/src/repository/ProgressRepository.ts
  git commit -m "feat(shared): extend pet state types and repository interface for play/sleep"
  ```

---

### Task 2: Implement Updates in LocalProgressRepository

**Files:**
* Modify: `packages/shared/src/repository/LocalProgressRepository.ts`
* Modify: `packages/shared/src/repository/LocalProgressRepository.test.ts`

- [x] **Step 1: Write failing tests for repository persistence and actions**
  Open `packages/shared/src/repository/LocalProgressRepository.test.ts`. Replace it with the following code to cover initialization defaults, `playWithPet`, and `toggleSleep`:
  ```typescript
  import { describe, it, expect, beforeEach } from "vitest";
  import { LocalProgressRepository } from "./LocalProgressRepository";

  const STORAGE_KEY = "cozyos.progress.v1";

  describe("LocalProgressRepository", () => {
    let repo: LocalProgressRepository;

    beforeEach(() => {
      localStorage.clear();
      repo = new LocalProgressRepository();
    });

    describe("getState", () => {
      it("returns initial state with defaults when localStorage is empty", async () => {
        const state = await repo.getState();
        expect(state.completedLevels).toEqual([]);
        expect(state.foodConsumed).toBe(0);
        expect(state.pet.xp).toBe(0);
        expect(state.pet.stage).toBe(1);
        expect(state.pet.lastFedAt).toBe(0);
        expect(state.pet.happiness).toBe(50);
        expect(state.pet.lastPlayedAt).toBe(0);
        expect(state.pet.isSleeping).toBe(false);
      });

      it("supplies missing fields for legacy saves", async () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: 1,
          state: {
            completedLevels: [],
            foodConsumed: 0,
            pet: { xp: 5, stage: 1, lastFedAt: 12345 }
          }
        }));
        const state = await repo.getState();
        expect(state.pet.happiness).toBe(50);
        expect(state.pet.lastPlayedAt).toBe(0);
        expect(state.pet.isSleeping).toBe(false);
      });
    });

    describe("playWithPet", () => {
      it("updates happiness and lastPlayedAt", async () => {
        await repo.playWithPet(80);
        const state = await repo.getState();
        expect(state.pet.happiness).toBe(80);
        expect(state.pet.lastPlayedAt).toBeGreaterThan(0);
      });
    });

    describe("toggleSleep", () => {
      it("toggles isSleeping field", async () => {
        const state1 = await repo.getState();
        expect(state1.pet.isSleeping).toBe(false);
        await repo.toggleSleep();
        const state2 = await repo.getState();
        expect(state2.pet.isSleeping).toBe(true);
        await repo.toggleSleep();
        const state3 = await repo.getState();
        expect(state3.pet.isSleeping).toBe(false);
      });
    });
  });
  ```

- [x] **Step 2: Run test to verify it fails**
  Run: `npx vitest run packages/shared/src/repository/LocalProgressRepository.test.ts`
  Expected: FAIL (missing methods and defaults)

- [x] **Step 3: Implement new fields and methods in `LocalProgressRepository.ts`**
  Modify `packages/shared/src/repository/LocalProgressRepository.ts` to implement defaults and actions:
  ```typescript
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
      pet: {
        xp: 0,
        stage: 1,
        lastFedAt: 0,
        happiness: 50,
        lastPlayedAt: 0,
        isSleeping: false,
      },
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
        
        // Fill defaults for backward compatibility
        const state = data.state;
        if (state.pet.happiness === undefined) state.pet.happiness = 50;
        if (state.pet.lastPlayedAt === undefined) state.pet.lastPlayedAt = 0;
        if (state.pet.isSleeping === undefined) state.pet.isSleeping = false;
        
        return state;
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
          ...state.pet,
          xp: newXp,
          stage: getEvolutionStage(newXp),
          lastFedAt: Date.now(),
          isSleeping: false, // Auto-wakes up when fed
        },
      });
    }

    async playWithPet(happiness: number): Promise<void> {
      const state = await this.getState();
      await this.saveState({
        ...state,
        pet: {
          ...state.pet,
          happiness,
          lastPlayedAt: Date.now(),
        },
      });
    }

    async toggleSleep(): Promise<void> {
      const state = await this.getState();
      await this.saveState({
        ...state,
        pet: {
          ...state.pet,
          isSleeping: !state.pet.isSleeping,
        },
      });
    }
  }
  ```

- [x] **Step 4: Verify repository tests pass**
  Run: `npx vitest run packages/shared/src/repository/LocalProgressRepository.test.ts`
  Expected: PASS

- [x] **Step 5: Commit**
  ```bash
  git add packages/shared/src/repository/LocalProgressRepository.ts packages/shared/src/repository/LocalProgressRepository.test.ts
  git commit -m "feat(shared): implement play and sleep methods in LocalProgressRepository with backward-compatible defaults"
  ```

---

### Task 3: Implement Actions and Dynamic Decay in ProgressService

**Files:**
* Modify: `packages/shared/src/progress/service.ts`
* Modify: `packages/shared/src/progress/service.test.ts`

- [x] **Step 1: Open and replace `packages/shared/src/progress/service.test.ts`**
  Write tests for dynamic decay logic (awake vs sleep hunger/happiness decay rates), `playWithPet`, and `toggleSleep`:
  ```typescript
  import { describe, it, expect, vi, beforeEach } from "vitest";
  import { ProgressService, HUNGER_COOLDOWN, HAPPINESS_COOLDOWN } from "./service";
  import type { ProgressRepository } from "../repository/ProgressRepository";
  import type { ProgressState } from "./types";

  function makeState(overrides?: Partial<ProgressState>): ProgressState {
    return {
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false },
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
      playWithPet: vi.fn().mockResolvedValue(undefined),
      toggleSleep: vi.fn().mockResolvedValue(undefined),
    };
  }

  describe("ProgressService", () => {
    describe("getHungryLevel", () => {
      it("returns 0 when fed just now", async () => {
        const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now(), happiness: 50, lastPlayedAt: 0, isSleeping: false } });
        const service = new ProgressService(makeMockRepo(state));
        expect(await service.getHungryLevel()).toBe(0);
      });

      it("decays at normal rate when awake", async () => {
        const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN * 3, happiness: 50, lastPlayedAt: 0, isSleeping: false } });
        const service = new ProgressService(makeMockRepo(state));
        expect(await service.getHungryLevel()).toBe(3);
      });

      it("decays at 2x slower rate when sleeping", async () => {
        const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN * 4, happiness: 50, lastPlayedAt: 0, isSleeping: true } });
        const service = new ProgressService(makeMockRepo(state));
        expect(await service.getHungryLevel()).toBe(2); // 4 elapsed / 2 = 2
      });
    });

    describe("getHappiness", () => {
      it("decays at normal rate when awake", async () => {
        const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 100, lastPlayedAt: Date.now() - HAPPINESS_COOLDOWN * 4, isSleeping: false } });
        const service = new ProgressService(makeMockRepo(state));
        expect(await service.getHappiness()).toBe(80); // Decays 5% per interval: 100 - (4 * 5) = 80
      });

      it("decays at 4x slower rate when sleeping", async () => {
        const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 100, lastPlayedAt: Date.now() - HAPPINESS_COOLDOWN * 8, isSleeping: true } });
        const service = new ProgressService(makeMockRepo(state));
        expect(await service.getHappiness()).toBe(90); // 8 intervals -> 2 intervals of decay: 100 - (2 * 5) = 90
      });
    });

    describe("playWithPet", () => {
      it("does not allow playing when sleeping", async () => {
        const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: true } });
        const repo = makeMockRepo(state);
        const service = new ProgressService(repo);
        await service.playWithPet();
        expect(repo.playWithPet).not.toHaveBeenCalled();
      });

      it("calculates decay and increments happiness up to 100", async () => {
        const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 70, lastPlayedAt: Date.now(), isSleeping: false } });
        const repo = makeMockRepo(state);
        const service = new ProgressService(repo);
        await service.playWithPet();
        expect(repo.playWithPet).toHaveBeenCalledWith(90); // 70 + 20 = 90
      });
    });
  });
  ```

- [x] **Step 2: Run test to verify failures**
  Run: `npx vitest run packages/shared/src/progress/service.test.ts`
  Expected: FAIL

- [x] **Step 3: Update `service.ts` to implement actions and dynamic decay**
  Modify `packages/shared/src/progress/service.ts` to add actions and formulas:
  ```typescript
  import type { ProgressRepository } from "../repository/ProgressRepository";
  import type { ProgressState } from "./types";

  export const HUNGER_COOLDOWN = 10 * 60 * 1000;
  export const HAPPINESS_COOLDOWN = 10 * 60 * 1000;

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
      const isHungry = await this.isPetHungry();
      const foodAvailable = await this.getFoodAvailable();
      if (!isHungry || foodAvailable <= 0) return;
      await this.repo.feedPet();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
      }
    }

    async playWithPet(): Promise<void> {
      const state = await this.repo.getState();
      if (state.pet.isSleeping) return; // Can't play if asleep!
      const currentHappiness = await this.getHappiness();
      const newHappiness = Math.min(100, currentHappiness + 20);
      await this.repo.playWithPet(newHappiness);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
      }
    }

    async toggleSleep(): Promise<void> {
      await this.repo.toggleSleep();
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
      const level = await this.getHungryLevel();
      return level >= 1;
    }

    async getHungryLevel(): Promise<number> {
      const state = await this.repo.getState();
      if (state.pet.lastFedAt === 0) return 6; // Maximum hunger if never fed
      const elapsed = Date.now() - state.pet.lastFedAt;
      const divisor = state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
      return Math.min(6, Math.floor(elapsed / divisor));
    }

    async getHappiness(): Promise<number> {
      const state = await this.repo.getState();
      if (state.pet.lastPlayedAt === 0) return Math.max(0, state.pet.happiness - Math.floor(Date.now() / HAPPINESS_COOLDOWN) * 5);
      const elapsed = Date.now() - state.pet.lastPlayedAt;
      const divisor = state.pet.isSleeping ? HAPPINESS_COOLDOWN * 4 : HAPPINESS_COOLDOWN;
      const decay = Math.floor(elapsed / divisor) * 5;
      return Math.max(0, state.pet.happiness - decay);
    }

    async getPetStage(): Promise<number> {
      const state = await this.repo.getState();
      return state.pet.stage;
    }
  }
  ```

- [x] **Step 4: Verify ProgressService tests pass**
  Run: `npx vitest run packages/shared/src/progress/service.test.ts`
  Expected: PASS

- [x] **Step 5: Commit**
  ```bash
  git add packages/shared/src/progress/service.ts packages/shared/src/progress/service.test.ts
  git commit -m "feat(shared): implement dynamic hunger/happiness decay and play/sleep actions in ProgressService"
  ```

---

### Task 4: Expose Play and Sleep in Shell Hook

**Files:**
* Modify: `packages/shell/src/hooks/useProgressService.ts`

- [x] **Step 1: Expose play, sleep, and happiness in hook**
  Modify `packages/shell/src/hooks/useProgressService.ts` to wire up new getters and triggers:
  ```typescript
  import { useState, useEffect, useCallback } from "react";
  import { ProgressService, LocalProgressRepository } from "shared";
  import type { ProgressState } from "shared";

  const progressService = new ProgressService(new LocalProgressRepository());

  const EMPTY_STATE: ProgressState = {
    completedLevels: [],
    foodConsumed: 0,
    pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false },
  };

  export function useProgressService() {
    const [state, setState] = useState<ProgressState>(EMPTY_STATE);
    const [isHungry, setIsHungry] = useState(false);
    const [foodAvailable, setFoodAvailable] = useState(0);
    const [hungryLevel, setHungryLevel] = useState(0);
    const [happiness, setHappiness] = useState(50);

    const refresh = useCallback(async () => {
      const [s, hungry, food, level, happy] = await Promise.all([
        progressService.getState(),
        progressService.isPetHungry(),
        progressService.getFoodAvailable(),
        progressService.getHungryLevel(),
        progressService.getHappiness(),
      ]);
      setState(s);
      setIsHungry(hungry);
      setFoodAvailable(food);
      setHungryLevel(level);
      setHappiness(happy);
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

    const playWithPet = useCallback(async () => {
      await progressService.playWithPet();
    }, []);

    const toggleSleep = useCallback(async () => {
      await progressService.toggleSleep();
    }, []);

    return {
      state,
      isHungry,
      foodAvailable,
      hungryLevel,
      happiness,
      isSleeping: state.pet.isSleeping,
      feedPet,
      playWithPet,
      toggleSleep,
    };
  }
  ```

- [x] **Step 2: Commit**
  ```bash
  git add packages/shell/src/hooks/useProgressService.ts
  git commit -m "feat(shell): expose actions and happiness/sleeping state in useProgressService hook"
  ```

---

### Task 5: Redesign PetSprite to Render Pokemon Evolutions in SVG

**Files:**
* Modify: `packages/shell/src/components/PetSprite.tsx`

- [x] **Step 1: Write Pokemon SVG render rules inside `PetSprite.tsx`**
  Modify `packages/shell/src/components/PetSprite.tsx` to dynamically render distinct Pokemon shapes based on `stage` (1–5) and status:
  ```typescript
  import React from "react";

  export type PetStatus = "idle" | "eating" | "playing" | "sleeping" | "moving";
  export type PetDirection = "down" | "up" | "left" | "right";

  interface PetSpriteProps {
    size?: number;
    stage?: number;
    status?: PetStatus;
    isSleeping?: boolean;
    direction?: PetDirection;
    animationFrame?: number;
    className?: string;
  }

  export default function PetSprite({
    size = 16,
    stage = 1,
    status = "idle",
    isSleeping = false,
    direction = "down",
    animationFrame = 0,
    className = "",
  }: PetSpriteProps): React.ReactElement {
    const isEating = status === "eating";
    const isPlaying = status === "playing";
    const isMoving = status === "moving";

    // Playful bounce animation class
    const bounceClass = isPlaying || isMoving ? "animate-bounce" : "";
    
    // Slight wiggling/wobbling transformation for idle/moving frames
    const wiggleStyle = isMoving || (status === "idle" && animationFrame === 1)
      ? { transform: "rotate(3deg)", transformOrigin: "bottom center" }
      : {};

    const renderStageSprite = () => {
      switch (stage) {
        case 1: // POKEMON EGG
          return (
            <>
              <!-- Egg Outline -->
              <rect x="5" y="3" width="6" height="10" rx="3" fill="#eeeecc" />
              <rect x="4" y="5" width="8" height="7" rx="2" fill="#eeeecc" />
              <!-- Green Spots (wiggles when eating) -->
              <rect x={isEating && animationFrame === 0 ? "7" : "6"} y="5" width="2" height="2" fill="#44aa44" />
              <rect x={isEating && animationFrame === 0 ? "8" : "9"} y="8" width="2" height="2" fill="#44aa44" />
              <rect x="5" y="10" width="2" height="1" fill="#44aa44" />
            </>
          );

        case 2: // LEAFY SPROUT (Baby grass-reptile)
          return (
            <>
              <!-- Body -->
              <rect x="5" y="7" width="7" height="6" rx="2" fill="#88cc88" />
              <rect x="4" y="9" width="9" height="3" fill="#88cc88" />
              <!-- Legs (wiggle when moving) -->
              <rect x={isMoving && animationFrame === 0 ? "4" : "5"} y="13" width="2" height="1" fill="#448844" />
              <rect x={isMoving && animationFrame === 1 ? "11" : "10"} y="13" width="2" height="1" fill="#448844" />
              <!-- Leaf on head (flaps/wobbles) -->
              <rect x="8" y={animationFrame === 0 ? "5" : "6"} width="2" height="2" fill="#33aa33" />
              <rect x="9" y={animationFrame === 0 ? "4" : "5"} width="2" height="2" fill="#33aa33" />
              <rect x="8" y="7" width="1" height="1" fill="#448844" /> <!-- stem -->
              <!-- Eyes & Mouth -->
              {!isSleeping ? (
                <>
                  <rect x="6" y="8" width="2" height="2" fill="#ffffff" />
                  <rect x="6.5" y="8.5" width="1" height="1" fill="#ff4444" />
                  <rect x="10" y="8" width="2" height="2" fill="#ffffff" />
                  <rect x="10.5" y="8.5" width="1" height="1" fill="#ff4444" />
                  <rect x="8" y="11" width="2" height="1" fill="#448844" />
                </>
              ) : (
                <>
                  <rect x="6" y="9" width="2" height="1" fill="#448844" />
                  <rect x="10" y="9" width="2" height="1" fill="#448844" />
                </>
              )}
            </>
          );

        case 3: // BUDREPTILE (Mid stage, bud on back)
          return (
            <>
              <!-- Bud on back (wiggles/pulses when eating/happy) -->
              <rect x="7" y={isEating && animationFrame === 0 ? "2" : "3"} width="3" height="3" rx="1" fill="#ff66aa" />
              <rect x="6" y="5" width="5" height="1" fill="#338833" />
              <!-- Body -->
              <rect x="4" y="6" width="9" height="7" rx="2" fill="#55aaaa" />
              <rect x="3" y="8" width="11" height="4" fill="#55aaaa" />
              <!-- Feet -->
              <rect x={isMoving && animationFrame === 0 ? "3" : "4"} y="13" width="2" height="1" fill="#227777" />
              <rect x={isMoving && animationFrame === 1 ? "12" : "11"} y="13" width="2" height="1" fill="#227777" />
              <!-- Tail -->
              <rect x="1" y="9" width="3" height="2" fill="#55aaaa" />
              <!-- Eyes & determined look -->
              {!isSleeping ? (
                <>
                  <rect x="8" y="7" width="2" height="2" fill="#ffffff" />
                  <rect x="9" y="7.5" width="1" height="1" fill="#ff2222" />
                  <rect x="5" y="7" width="2" height="2" fill="#ffffff" />
                  <rect x="5" y="7.5" width="1" height="1" fill="#ff2222" />
                  <rect x="7" y="10" width="3" height="1" fill="#227777" />
                </>
              ) : (
                <>
                  <rect x="5" y="8" width="2" height="1" fill="#227777" />
                  <rect x="9" y="8" width="2" height="1" fill="#227777" />
                </>
              )}
            </>
          );

        case 4: // FLORASAUR (Full bloom beast)
          return (
            <>
              <!-- Large blossomed flower on back (pulses) -->
              <rect x="4" y="5" width="9" height="1" fill="#226622" />
              <rect x="5" y={animationFrame === 0 ? "2" : "3"} width="7" height="3" fill="#ff4488" />
              <rect x="7" y={animationFrame === 0 ? "1" : "2"} width="3" height="1" fill="#ffcc00" />
              <!-- Body -->
              <rect x="3" y="6" width="11" height="7" rx="2" fill="#2d6a6a" />
              <!-- Tail (wags when playing) -->
              <rect x="13" y="8" width="2" height="2" fill="#2d6a6a" />
              <rect x="14" y={isPlaying && animationFrame === 0 ? "5" : "6"} width="2" height="2" fill="#226622" />
              <!-- Feet -->
              <rect x="4" y="13" width="2" height="1" fill="#124a4a" />
              <rect x="11" y="13" width="2" height="1" fill="#124a4a" />
              <!-- Fierce Eyes -->
              {!isSleeping ? (
                <>
                  <rect x="5" y="8" width="2" height="2" fill="#ffffff" />
                  <rect x="5" y="8" width="1" height="1" fill="#ff0000" />
                  <rect x="10" y="8" width="2" height="2" fill="#ffffff" />
                  <rect x="11" y="8" width="1" height="1" fill="#ff0000" />
                  <rect x="7" y="11" width="3" height="1" fill="#124a4a" />
                </>
              ) : (
                <>
                  <rect x="5" y="9" width="2" height="1" fill="#124a4a" />
                  <rect x="10" y="9" width="2" height="1" fill="#124a4a" />
                </>
              )}
            </>
          );

        case 5: // MEGA FLORASAUR (Wings, Halo, floating spores)
          const floatOffset = animationFrame === 0 ? -1 : 1;
          return (
            <g style={{ transform: `translateY(${floatOffset}px)` }}>
              <!-- Glowing Spores -->
              <rect x="2" y="11" width="1" height="1" fill="#ffff99" opacity={animationFrame === 0 ? 0.3 : 0.8} />
              <rect x="14" y="4" width="1" height="1" fill="#ffff99" opacity={animationFrame === 0 ? 0.8 : 0.3} />
              <rect x="13" y="11" width="1" height="1" fill="#ffff99" opacity={animationFrame === 0 ? 0.4 : 0.9} />
              <!-- Foliage Wings (flaps) -->
              <path d={animationFrame === 0 ? "M 3,6 L 0,2 L 1,7 Z" : "M 3,6 L 0,4 L 1,8 Z"} fill="#33aa33" />
              <path d={animationFrame === 0 ? "M 13,6 L 16,2 L 15,7 Z" : "M 13,6 L 16,4 L 15,8 Z"} fill="#33aa33" />
              <!-- Mega crest / Crown -->
              <rect x="6" y="0" width="5" height="2" fill="#ffff33" />
              <!-- Flower -->
              <rect x="4" y="4" width="9" height="1" fill="#226622" />
              <rect x="5" y="2" width="7" height="2" fill="#ff0066" />
              <rect x="7" y="1" width="3" height="1" fill="#ffff33" />
              <!-- Body -->
              <rect x="3" y="5" width="11" height="7" rx="2" fill="#2d6a6a" />
              <!-- Eyes -->
              {!isSleeping ? (
                <>
                  <rect x="5" y="7" width="2" height="2" fill="#ffffff" />
                  <rect x="5" y="7" width="1" height="1" fill="#ff0000" />
                  <rect x="10" y="7" width="2" height="2" fill="#ffffff" />
                  <rect x="11" y="7" width="1" height="1" fill="#ff0000" />
                </>
              ) : (
                <>
                  <rect x="5" y="8" width="2" height="1" fill="#124a4a" />
                  <rect x="10" y="8" width="2" height="1" fill="#124a4a" />
                </>
              )}
            </g>
          );

        default:
          return null;
      }
    };

    return (
      <svg
        viewBox="0 0 16 16"
        className={`${bounceClass} ${className}`}
        style={{ width: size, height: size, ...wiggleStyle }}
      >
        {renderStageSprite()}

        {/* Floating ZZZs when sleeping */}
        {isSleeping && (
          <g className="animate-pulse" style={{ fill: "var(--color-cozy-border)", opacity: 0.8 }}>
            <text x="11" y="4" style={{ fontSize: "4px", fontFamily: "monospace" }}>Z</text>
            <text x="13" y="2" style={{ fontSize: "3px", fontFamily: "monospace" }}>z</text>
          </g>
        )}
      </svg>
    );
  }
  ```

- [x] **Step 2: Commit**
  ```bash
  git add packages/shell/src/components/PetSprite.tsx
  git commit -m "feat(shell): implement Pokemon evolution visual stages and animations in PetSprite SVG"
  ```

---

### Task 6: Refactor Sidebar HUD (PetWidget)

**Files:**
* Modify: `packages/shell/src/components/PetWidget.tsx`

- [x] **Step 1: Simplify HUD to display Pokemon stats and direct feed action**
  Open `packages/shell/src/components/PetWidget.tsx`. Replace its contents with a clean compact layout reading from `useProgressService()`:
  ```typescript
  import React, { useState, useCallback, useEffect, useRef } from "react";
  import PetSprite from "./PetSprite";
  import { useProgressService } from "../hooks/useProgressService";
  import type { PetStatus } from "../types";

  export default function PetWidget(): React.ReactElement {
    const { state, isHungry, foodAvailable, feedPet, isSleeping } = useProgressService();
    const [spriteStatus, setSpriteStatus] = useState<PetStatus>("idle");
    const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (resetTimerRef.current !== null) {
          clearTimeout(resetTimerRef.current);
        }
      };
    }, []);

    const handleFeed = useCallback(async () => {
      await feedPet();
      setSpriteStatus("eating");
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setSpriteStatus("idle"), 2000);
    }, [feedPet]);

    const canFeed = isHungry && foodAvailable > 0 && !isSleeping;

    // Get evolution stage name
    const getStageName = (stage: number) => {
      switch (stage) {
        case 1: return "EGG";
        case 2: return "LEAFY SPROUT";
        case 3: return "BUDREPTILE";
        case 4: return "FLORASAUR";
        case 5: return "MEGA FLORASAUR";
        default: return "UNKNOWN";
      }
    };

    return (
      <div className="flex flex-col items-center gap-2 p-2 text-cozy-text">
        <div className="border border-cozy-border p-2 bg-black flex items-center justify-center relative w-20 h-20">
          <PetSprite
            size={64}
            stage={state.pet.stage}
            status={isSleeping ? "sleeping" : spriteStatus}
            isSleeping={isSleeping}
          />
        </div>

        <div className="w-full flex flex-col gap-1 font-mono text-[9px]">
          <div className="flex justify-between">
            <span className="font-press">STAGE:</span>
            <span>{getStageName(state.pet.stage)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-press">XP:</span>
            <span>{state.pet.xp}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-press">FOOD:</span>
            <span>★ {foodAvailable}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-press">STATUS:</span>
            <span>{isSleeping ? "SLEEPING" : isHungry ? "HUNGRY" : "FULL"}</span>
          </div>
        </div>

        <button
          onClick={() => { void handleFeed(); }}
          disabled={!canFeed}
          className="w-full pixel-btn text-[8px] disabled:opacity-40 disabled:pointer-events-none"
        >
          {isSleeping ? "AWAKE TO FEED" : canFeed ? "FEED PET" : isHungry ? "NO FOOD" : "NOT HUNGRY"}
        </button>
      </div>
    );
  }
  ```

- [x] **Step 2: Commit**
  ```bash
  git add packages/shell/src/components/PetWidget.tsx
  git commit -m "feat(shell): refactor PetWidget to support the simplified compact Pokemon stats and feeding logic"
  ```

---

### Task 7: Update Pet MFE Page (PetsApp) and App Host integration

**Files:**
* Modify: `packages/pets/src/PetsApp.tsx`
* Modify: `packages/shell/src/App.tsx`

- [x] **Step 1: Update Pet MFE Page to consume progressState prop**
  Open `packages/pets/src/PetsApp.tsx`. Replace its contents with the unified layout showing meters and the full action console (FEED, PLAY, SLEEP):
  ```typescript
  import React, { useEffect, useState } from "react";
  import PetSprite, { type PetStatus } from "../../shell/src/components/PetSprite";
  import { PixelChickenIcon, PixelBearIcon, PixelMoonIcon, PixelSunIcon } from "./Icons";

  interface PetsAppProps {
    progressState?: {
      state: {
        pet: {
          xp: number;
          stage: number;
          isSleeping: boolean;
        };
      };
      isHungry: boolean;
      foodAvailable: number;
      hungryLevel: number;
      happiness: number;
      isSleeping: boolean;
      feedPet: () => Promise<void>;
      playWithPet: () => Promise<void>;
      toggleSleep: () => Promise<void>;
    };
  }

  const getAsciiBar = (value: number): string => {
    const totalSegments = 12;
    const filledSegments = Math.round((value / 100) * totalSegments);
    const emptySegments = totalSegments - filledSegments;
    return `[${"█".repeat(filledSegments)}${"░".repeat(emptySegments)}] ${value}%`;
  };

  const getStageName = (stage: number) => {
    switch (stage) {
      case 1: return "SPOTTED EGG";
      case 2: return "LEAFY SPROUT";
      case 3: return "BUDREPTILE";
      case 4: return "FLORASAUR";
      case 5: return "MEGA FLORASAUR";
      default: return "UNKNOWN";
    }
  };

  const getStageLore = (stage: number) => {
    switch (stage) {
      case 1: return "A quiet, green-spotted egg. It shakes with anticipation when you tap it.";
      case 2: return "A tiny, cute green dinosaur starter with a sprouting leaf on its head.";
      case 3: return "The sprout has turned into a pink flower bud on its back. Very determined!";
      case 4: return "A magnificent forest dinosaur with a fully blossomed jungle flower.";
      case 5: return "Mega-Evolved Legend! Emits a glowing aura and flies on leaf wings.";
      default: return "A mysterious digital creature.";
    }
  };

  export default function PetsApp({
    progressState,
  }: PetsAppProps): React.ReactElement {
    // If progressState is not passed, use safe defaults for standalone development
    const hasProgress = !!progressState;
    const petState = progressState?.state.pet || { xp: 0, stage: 1, isSleeping: false };
    const foodAvailable = progressState?.foodAvailable ?? 0;
    const isHungry = progressState?.isHungry ?? false;
    const hungryLevel = progressState?.hungryLevel ?? 0;
    const happiness = progressState?.happiness ?? 50;
    const isSleeping = progressState?.isSleeping ?? false;

    const [spriteStatus, setSpriteStatus] = useState<PetStatus>("idle");
    const [animationFrame, setAnimationFrame] = useState(0);

    useEffect(() => {
      const timer = setInterval(() => {
        setAnimationFrame((f) => (f + 1) % 2);
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const handleFeed = async () => {
      if (!hasProgress) return;
      await progressState.feedPet();
      setSpriteStatus("eating");
      setTimeout(() => setSpriteStatus("idle"), 2000);
    };

    const handlePlay = async () => {
      if (!hasProgress) return;
      await progressState.playWithPet();
      setSpriteStatus("playing");
      setTimeout(() => setSpriteStatus("idle"), 2000);
    };

    const handleSleepToggle = async () => {
      if (!hasProgress) return;
      await progressState.toggleSleep();
    };

    const canFeed = isHungry && foodAvailable > 0 && !isSleeping;
    const canPlay = !isSleeping;

    // Map 0-6 hunger level to 100% full down to 0% full
    const hungerPct = Math.max(0, 100 - Math.round((hungryLevel / 6) * 100));

    return (
      <div className="flex flex-col items-center justify-between h-full py-4 px-2 box-border text-cozy-text font-mono">
        <div className="w-full border-b border-dashed border-cozy-border pb-2 mb-4 text-center">
          <h2 className="font-press text-xs text-cozy-text">PET STATUS CONSOLE</h2>
          <p className="text-[8px] text-cozy-accent mt-1">SYSTEM SYNC: ACTIVE</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full items-center justify-center flex-1">
          {/* Pet Screen Frame */}
          <div className="flex flex-col items-center gap-2">
            <div className="p-4 border border-cozy-border bg-black rounded flex items-center justify-center w-36 h-36 relative overflow-hidden">
              <span className="absolute top-1 left-2 text-[10px] text-cozy-text font-mono select-none">+</span>
              <span className="absolute top-1 right-2 text-[10px] text-cozy-text font-mono select-none">+</span>
              <span className="absolute bottom-1 left-2 text-[10px] text-cozy-text font-mono select-none">+</span>
              <span className="absolute bottom-1 right-2 text-[10px] text-cozy-text font-mono select-none">+</span>

              <div style={{ filter: "sepia(1) saturate(5) hue-rotate(5deg) brightness(1.2)" }}>
                <PetSprite
                  size={112}
                  stage={petState.stage}
                  status={isSleeping ? "sleeping" : spriteStatus}
                  isSleeping={isSleeping}
                  animationFrame={animationFrame}
                />
              </div>
            </div>
            <div className="text-center">
              <span className="font-press text-[9px] block text-cozy-accent">{getStageName(petState.stage)}</span>
              <span className="text-[8px] max-w-[150px] block mt-1 leading-normal text-cozy-text opacity-85">
                "{getStageLore(petState.stage)}"
              </span>
            </div>
          </div>

          {/* Stats and Action Buttons */}
          <div className="flex-1 flex flex-col gap-4 max-w-xs w-full">
            <div className="flex flex-col gap-2 text-[10px]">
              <div className="flex justify-between items-center">
                <span>XP PROGRESS:</span>
                <span>{petState.xp} XP</span>
              </div>
              <div className="border border-cozy-border h-2.5 bg-black p-0.5">
                <div
                  className="bg-cozy-accent h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, petState.xp)}%` }}
                />
              </div>

              <div className="flex justify-between items-center mt-1">
                <span>HUNGER (FULLNESS):</span>
                <span>{getAsciiBar(hungerPct)}</span>
              </div>

              <div className="flex justify-between items-center mt-1">
                <span>HAPPINESS:</span>
                <span>{getAsciiBar(happiness)}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-cozy-border pt-4 flex flex-col gap-2">
              <div className="flex justify-between text-[9px] mb-1">
                <span>AVAILABLE FOOD:</span>
                <span className="text-cozy-accent">★ x {foodAvailable}</span>
              </div>

              <button
                onClick={() => { void handleFeed(); }}
                disabled={!canFeed || !hasProgress}
                className="pixel-btn text-[8px] py-1.5 w-full flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text disabled:opacity-40 disabled:pointer-events-none"
              >
                {isSleeping ? "WAKE UP TO FEED" : canFeed ? "FEED STAR-FOOD" : isHungry ? "NO STAR-FOOD" : "NOT HUNGRY"}
                <PixelChickenIcon className="w-3.5 h-3.5" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => { void handlePlay(); }}
                  disabled={!canPlay || !hasProgress}
                  className="pixel-btn text-[8px] py-1.5 flex-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text disabled:opacity-40 disabled:pointer-events-none"
                >
                  PLAY <PixelBearIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { void handleSleepToggle(); }}
                  disabled={!hasProgress}
                  className="pixel-btn text-[8px] py-1.5 flex-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text"
                >
                  {isSleeping ? (
                    <>
                      WAKE <PixelSunIcon className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      SLEEP <PixelMoonIcon className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

- [x] **Step 2: Inject progressState prop from App host**
  Open `packages/shell/src/App.tsx`. Call `useProgressService()` inside the root component and pass the returned values to `PetsApp`:
  Modify the `renderMainContent()` case for `pets` around line 95 to:
  ```typescript
  // Around line 58 inside export default function App()
  const progressService = useProgressService();

  // In renderMainContent around line 90:
  case "pets":
    return <PetsApp progressState={progressService} />;
  ```
  Also, remove the import of `usePetStore` from line 4 since it is no longer used.

- [x] **Step 3: Run full monorepo test suite**
  Run: `npm test`
  Expected: PASS

- [x] **Step 4: Commit**
  ```bash
  git add packages/pets/src/PetsApp.tsx packages/shell/src/App.tsx
  git commit -m "feat(shell,pets): wire PetsApp page MFE directly to the shared progress hook"
  ```
