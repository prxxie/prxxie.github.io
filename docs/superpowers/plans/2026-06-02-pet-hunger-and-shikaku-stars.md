# Pet Hunger Adjustment & Shikaku Stars Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the pet hunger levels to cap at 5 with 10 minutes per level, implement incremental sequential feeding where each feed consumes 1 food and decreases hunger by 1, and align Shikaku level completion to award correct stars and food rewards.

**Architecture:** Update `ProgressService` to calculate incremental feeding timestamp adjustments, modify the `ProgressRepository` and its localStorage implementation to persist custom feed timestamps, and update `ShikakuApp` to call `completeLevelWithStars` with its store's `starsAchieved` state.

**Tech Stack:** TypeScript, React, Zustand, Vitest

---

### Task 1: Update ProgressRepository Interface

**Files:**
- Modify: `packages/shared/src/repository/ProgressRepository.ts`

- [ ] **Step 1: Modify feedPet method signature in ProgressRepository**

  Open [ProgressRepository.ts](file:///home/cpt0912/WORKS/CDEV/prxxie-home/packages/shared/src/repository/ProgressRepository.ts) and modify `feedPet` signature to:
  ```typescript
  feedPet(lastFedAt?: number, lastPlayedAt?: number): Promise<void>;
  ```

- [ ] **Step 2: Commit changes**
  ```bash
  git add packages/shared/src/repository/ProgressRepository.ts
  git commit -m "refactor: update feedPet interface to accept custom lastFedAt"
  ```

---

### Task 2: Update LocalProgressRepository

**Files:**
- Modify: `packages/shared/src/repository/LocalProgressRepository.ts`
- Modify: `packages/shared/src/repository/LocalProgressRepository.test.ts`

- [ ] **Step 1: Implement custom lastFedAt saving in LocalProgressRepository**

  Open [LocalProgressRepository.ts](file:///home/cpt0912/WORKS/CDEV/prxxie-home/packages/shared/src/repository/LocalProgressRepository.ts) and modify the `feedPet` method:
  ```typescript
    async feedPet(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
      const state = await this.getState();
      const newXp = state.pet.xp + 1;
      await this.saveState({
        ...state,
        foodConsumed: state.foodConsumed + 1,
        pet: {
          ...state.pet,
          xp: newXp,
          stage: getEvolutionStage(newXp),
          lastFedAt: lastFedAt !== undefined ? lastFedAt : Date.now(),
          isSleeping: false, // Auto-wakes up when fed
          lastPlayedAt: lastPlayedAt !== undefined ? lastPlayedAt : state.pet.lastPlayedAt,
        },
      });
    }
  ```

- [ ] **Step 2: Run repository tests to verify backward compatibility**
  Run: `rtk npm run test -- --run`
  Expected: Repository tests pass.

- [ ] **Step 3: Add test for custom lastFedAt feeding**

  Open [LocalProgressRepository.test.ts](file:///home/cpt0912/WORKS/CDEV/prxxie-home/packages/shared/src/repository/LocalProgressRepository.test.ts) and add a test inside `describe("feedPet", ...)`:
  ```typescript
      it("saves a specific lastFedAt timestamp when provided", async () => {
        const customTime = 123456789;
        await repo.feedPet(customTime);
        const state = await repo.getState();
        expect(state.pet.lastFedAt).toBe(customTime);
      });
  ```

- [ ] **Step 4: Run repository tests to verify new capability**
  Run: `rtk npm run test -- --run`
  Expected: PASS

- [ ] **Step 5: Commit changes**
  ```bash
  git add packages/shared/src/repository/LocalProgressRepository.ts packages/shared/src/repository/LocalProgressRepository.test.ts
  git commit -m "feat: support saving custom lastFedAt in LocalProgressRepository"
  ```

---

### Task 3: Update ProgressService

**Files:**
- Modify: `packages/shared/src/progress/service.ts`
- Modify: `packages/shared/src/progress/service.test.ts`

- [ ] **Step 1: Implement 0-5 cap and incremental feeding in ProgressService**

  Open [service.ts](file:///home/cpt0912/WORKS/CDEV/prxxie-home/packages/shared/src/progress/service.ts) and modify `getHungryLevel()` and `feedPet()`:
  ```typescript
    async feedPet(): Promise<void> {
      const state = await this.repo.getState();
      const isHungry = await this.isPetHungry();
      const foodAvailable = await this.getFoodAvailable();
      if (!isHungry || foodAvailable <= 0) return;

      const divisor = state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
      const currentLastFedAt = state.pet.lastFedAt === 0 ? Date.now() - 5 * divisor : state.pet.lastFedAt;
      const nextLastFed = Math.min(Date.now(), currentLastFedAt + divisor);

      let nextLastPlayedAt: number | undefined;
      if (state.pet.isSleeping && state.pet.lastPlayedAt !== 0) {
        const elapsed = Math.max(0, Date.now() - state.pet.lastPlayedAt);
        const oldHappinessDivisor = HAPPINESS_COOLDOWN * 4;
        const newElapsed = elapsed * (HAPPINESS_COOLDOWN / oldHappinessDivisor);
        nextLastPlayedAt = Date.now() - newElapsed;
      }

      await this.repo.feedPet(nextLastFed, nextLastPlayedAt);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
      }
    }

    async getHungryLevel(): Promise<number> {
      const state = await this.repo.getState();
      if (state.pet.lastFedAt === 0) return 5; // Maximum hunger if never fed (capped at 5)
      const elapsed = Math.max(0, Date.now() - state.pet.lastFedAt);
      const divisor = state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
      return Math.min(5, Math.floor(elapsed / divisor));
    }
  ```

- [ ] **Step 2: Update existing unit tests in service.test.ts**

  Open [service.test.ts](file:///home/cpt0912/WORKS/CDEV/prxxie-home/packages/shared/src/progress/service.test.ts) and modify the following:
  - Inside `describe("getHungryLevel", ...)`:
    - Update test `"caps at 6 even when many cooldowns have elapsed"`:
      ```typescript
          it("caps at 5 even when many cooldowns have elapsed", async () => {
            const state = makeState({
              pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN * 100, happiness: 50, lastPlayedAt: 0, isSleeping: false },
            });
            const service = new ProgressService(makeMockRepo(state));
            expect(await service.getHungryLevel()).toBe(5);
          });
      ```
  - Inside `describe("feedPet", ...)`:
    - Update test `"calls repo.feedPet when pet is hungry and food is available"`:
      ```typescript
          it("calls repo.feedPet when pet is hungry and food is available", async () => {
            const state = makeState({
              completedLevels: [{ module: "s", levelId: "1", completedAt: 1, stars: 1 }],
              foodConsumed: 0,
              pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false },
            });
            const repo = makeMockRepo(state);
            const service = new ProgressService(repo);
            await service.feedPet();
            expect(repo.feedPet).toHaveBeenCalledOnce();
          });
      ```
    - Update test `"adjusts lastPlayedAt when feeding a sleeping pet to prevent instant happiness drop"`:
      ```typescript
          it("adjusts lastPlayedAt when feeding a sleeping pet to prevent instant happiness drop", async () => {
            const now = 1700000000000;
            const dateSpy = vi.spyOn(Date, "now").mockReturnValue(now);
            const state = makeState({
              completedLevels: [{ module: "s", levelId: "1", completedAt: 1, stars: 3 }],
              foodConsumed: 0,
              pet: {
                xp: 0,
                stage: 1,
                lastFedAt: now - HUNGER_COOLDOWN * 2, // Hungry so it can be fed under sleep decay (divisor = COOLDOWN * 2)
                happiness: 100,
                lastPlayedAt: now - HAPPINESS_COOLDOWN * 8, // Happiness decays 100 - (8/4 * 5) = 90 under sleep decay
                isSleeping: true,
              },
            });

            const repo = makeMockRepo(state);
            const service = new ProgressService(repo);
            await service.feedPet();

            const expectedLastPlayedAt = now - HAPPINESS_COOLDOWN * 2;
            const expectedLastFedAt = now - HUNGER_COOLDOWN * 2 + HUNGER_COOLDOWN * 2; // Incremented by sleep divisor (HUNGER_COOLDOWN * 2)
            expect(repo.feedPet).toHaveBeenCalledWith(expectedLastFedAt, expectedLastPlayedAt);
            dateSpy.mockRestore();
          });
      ```

- [ ] **Step 3: Add new unit test for sequential feeding**

  Open [service.test.ts](file:///home/cpt0912/WORKS/CDEV/prxxie-home/packages/shared/src/progress/service.test.ts) and add a test inside `describe("feedPet", ...)`:
  ```typescript
      it("increments lastFedAt by exactly one divisor per feed", async () => {
        const now = 1700000000000;
        const dateSpy = vi.spyOn(Date, "now").mockReturnValue(now);
        const state = makeState({
          completedLevels: [{ module: "s", levelId: "1", completedAt: 1, stars: 5 }],
          foodConsumed: 0,
          pet: {
            xp: 0,
            stage: 1,
            lastFedAt: now - HUNGER_COOLDOWN * 4, // Hunger level 4
            happiness: 50,
            lastPlayedAt: now,
            isSleeping: false,
          },
        });
        const repo = makeMockRepo(state);
        const service = new ProgressService(repo);
        await service.feedPet();
        expect(repo.feedPet).toHaveBeenCalledWith(now - HUNGER_COOLDOWN * 3, undefined);
        dateSpy.mockRestore();
      });
  ```

- [ ] **Step 4: Run unit tests to verify ProgressService**
  Run: `rtk npm run test -- --run`
  Expected: PASS

- [ ] **Step 5: Commit changes**
  ```bash
  git add packages/shared/src/progress/service.ts packages/shared/src/progress/service.test.ts
  git commit -m "feat: limit pet hunger to 5 and implement sequential feeding logic in ProgressService"
  ```

---

### Task 4: Fix Shikaku MFE level completion and Mock

**Files:**
- Modify: `packages/shikaku/src/ShikakuApp.tsx`
- Modify: `packages/shikaku/src/ShikakuApp.test.tsx`

- [ ] **Step 1: Add completeLevelWithStars to mocked shared module in Shikaku tests**

  Open [ShikakuApp.test.tsx](file:///home/cpt0912/WORKS/CDEV/prxxie-home/packages/shikaku/src/ShikakuApp.test.tsx) and add `completeLevelWithStars` to the mocked implementation:
  ```typescript
  vi.mock("shared", () => ({
    ProgressService: vi.fn().mockImplementation(() => ({
      completeLevel: vi.fn().mockResolvedValue(true),
      completeLevelWithStars: vi.fn().mockResolvedValue(true),
      feedPet: vi.fn().mockResolvedValue(undefined),
      getFoodAvailable: vi.fn().mockResolvedValue(0),
      isPetHungry: vi.fn().mockResolvedValue(false),
      getState: vi.fn().mockResolvedValue({
        completedLevels: [],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0 },
      }),
    })),
    LocalProgressRepository: vi.fn().mockImplementation(() => ({})),
  }));
  ```

- [ ] **Step 2: Update ShikakuApp to complete levels with stars achieved**

  Open [ShikakuApp.tsx](file:///home/cpt0912/WORKS/CDEV/prxxie-home/packages/shikaku/src/ShikakuApp.tsx) and update imports and the win check useEffect:
  ```typescript
    const starsAchieved = useShikakuStore((state) => state.starsAchieved);
  ```
  And update the `useEffect` that calls the progress service:
  ```typescript
    useEffect(() => {
      if (!isWon || !puzzle || selectedIdx === null) return;
      void progressService
        .completeLevelWithStars("shikaku", puzzle.id, starsAchieved)
        .then((improved) => {
          setRewardMsg(improved ? `+${starsAchieved} FOOD` : "ALREADY BEST");
        });
    }, [isWon, puzzle, selectedIdx, starsAchieved]);
  ```

- [ ] **Step 3: Run all unit tests to verify correctness**
  Run: `rtk npm run test -- --run`
  Expected: PASS

- [ ] **Step 4: Commit changes**
  ```bash
  git add packages/shikaku/src/ShikakuApp.tsx packages/shikaku/src/ShikakuApp.test.tsx
  git commit -m "feat: align Shikaku level completion to award stars and correct food rewards"
  ```
