# Supabase Sync Bugfixes Round 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the 6 outstanding Round 4 sync bugs involving error handling, race conditions, tie-breaker timestamp resolution, and fallback data preservation.

**Architecture:** Update repository methods with promise identity checks, fallback merge operations, and timestamp tie-breakers, while wrapping UI MFE entry points in standard React error boundaries/exception handlers.

**Tech Stack:** React, TypeScript, Vitest, Supabase JS Client

---

### Task 1: Promise Identity Guard in Cache Eviction
**Files:**
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.ts`
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.test.ts`

- [ ] **Step 1: Implement identity guards in finally blocks**
  In `packages/shared/src/repository/SupabaseProgressRepository.ts`:
  - Modify `getUserId()` to declare `const currentUserIdPromise = (async () => { ... })()`, then assign it to `this.userIdPromise`. Inside the `finally` block, only assign `this.userIdPromise = null` if it equals `currentUserIdPromise`.
  - Modify `getState()` to declare `const currentPromise = (async () => { ... })()`, then assign it to `this.activeGetState`. Inside the `finally` block, only assign `this.activeGetState = null` if it equals `currentPromise`.
  
  Code change for `getUserId()`:
  ```typescript
  private async getUserId(): Promise<string | null> {
    if (this.userIdInitialized) {
      return this.cachedUserId;
    }
    if (this.userIdPromise) {
      return this.userIdPromise;
    }
    const currentUserIdPromise = (async () => {
      try {
        const { data: { user } } = await this.supabase.auth.getUser();
        this.cachedUserId = user?.id || null;
        this.userIdInitialized = true;
        return this.cachedUserId;
      } catch {
        this.cachedUserId = null;
        this.userIdInitialized = true;
        return null;
      } finally {
        if (this.userIdPromise === currentUserIdPromise) {
          this.userIdPromise = null;
        }
      }
    })();
    this.userIdPromise = currentUserIdPromise;
    return currentUserIdPromise;
  }
  ```

  Code change for `getState()` (around line 316):
  ```typescript
      } finally {
        if (this.activeGetState === currentPromise) {
          this.activeGetState = null;
        }
      }
    })();
    this.activeGetState = currentPromise;
    return currentPromise;
  ```

- [ ] **Step 2: Add unit test to verify in-flight promise isn't stomp-cleared**
  In `packages/shared/src/repository/SupabaseProgressRepository.test.ts`:
  - Add the following test case:
  ```typescript
  it("should not clear a newer in-flight promise when an older one resolves after cache invalidation", async () => {
    let resolveFirst: (val: any) => void = () => {};
    let resolveSecond: (val: any) => void = () => {};
    const firstPromise = new Promise<any>((resolve) => { resolveFirst = resolve; });
    const secondPromise = new Promise<any>((resolve) => { resolveSecond = resolve; });

    const mockAuth = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn()
          .mockReturnValueOnce(firstPromise)
          .mockReturnValueOnce(secondPromise)
      }))
    };

    const newRepo = new SupabaseProgressRepository(mockAuth as any);
    try {
      // Trigger first load
      const p1 = newRepo.getState();
      const firstCachedPromise = (newRepo as any).activeGetState;
      expect(firstCachedPromise).not.toBeNull();

      // Dispatch event to invalidate/clear activeGetState
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cozyos:progress-updated"));
      }
      expect((newRepo as any).activeGetState).toBeNull();

      // Trigger second load (starts a new in-flight request)
      const p2 = newRepo.getState();
      const secondCachedPromise = (newRepo as any).activeGetState;
      expect(secondCachedPromise).not.toBeNull();
      expect(secondCachedPromise).not.toBe(firstCachedPromise);

      // Resolve first query. It should NOT clear activeGetState because activeGetState now holds the second promise.
      resolveFirst({ data: { state: { completedLevels: [], foodConsumed: 0, pet: { xp: 0 } } }, error: null });
      await p1;

      expect((newRepo as any).activeGetState).toBe(secondCachedPromise);

      // Resolve second query. It should clear activeGetState.
      resolveSecond({ data: { state: { completedLevels: [], foodConsumed: 0, pet: { xp: 0 } } }, error: null });
      await p2;
      expect((newRepo as any).activeGetState).toBeNull();
    } finally {
      newRepo.dispose();
    }
  });
  ```

- [ ] **Step 3: Run repository tests**
  Run: `rtk npx vitest run packages/shared/src/repository/SupabaseProgressRepository.test.ts`
  Expected: PASS

---

### Task 2: Level Completion Timestamp Tie-Breaker
**Files:**
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.ts`
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.test.ts`

- [ ] **Step 1: Add timestamp tie-breaker in level merging**
  In `packages/shared/src/repository/SupabaseProgressRepository.ts`:
  - Locate `addLevel` inside `mergeStates()` (around line 163).
  - Update `addLevel` logic to compare `completedAt` on star ties:
  ```typescript
    const addLevel = (lvl: typeof local.completedLevels[0]) => {
      const key = `${lvl.module}:${lvl.levelId}`;
      const existing = levelsMap.get(key);
      if (!existing) {
        levelsMap.set(key, lvl);
      } else if (lvl.stars > existing.stars) {
        levelsMap.set(key, lvl);
      } else if (lvl.stars === existing.stars && lvl.completedAt > existing.completedAt) {
        levelsMap.set(key, lvl);
      }
    };
  ```

- [ ] **Step 2: Add unit test verifying level completion tie-breaking**
  In `packages/shared/src/repository/SupabaseProgressRepository.test.ts`:
  - Add the following test case:
  ```typescript
  it("should merge levels by keeping the later completedAt timestamp when stars are equal", () => {
    const localState: ProgressState = {
      completedLevels: [{ module: "shikaku", levelId: "1", completedAt: 1000, stars: 3 }],
      foodConsumed: 0,
      pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false }
    };
    const cloudState: ProgressState = {
      completedLevels: [{ module: "shikaku", levelId: "1", completedAt: 2000, stars: 3 }],
      foodConsumed: 0,
      pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false }
    };

    const merged = (repo as any).mergeStates(localState, cloudState);
    expect(merged.completedLevels[0].completedAt).toBe(2000);
  });
  ```

- [ ] **Step 3: Run repository tests**
  Run: `rtk npx vitest run packages/shared/src/repository/SupabaseProgressRepository.test.ts`
  Expected: PASS

---

### Task 3: SELECT Query Fallback Merge
**Files:**
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.ts`
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.test.ts`

- [ ] **Step 1: Merge new state changes with pre-existing local state on query fail**
  In `packages/shared/src/repository/SupabaseProgressRepository.ts`:
  - In `saveState()`, inside the `catch` block (around line 382), load the current local state, merge `state` into it using `mergeStates()`, and save that merged state instead of saving the local-only `state` directly:
  ```typescript
      } catch (err) {
        console.error("Failed to sync state to Supabase:", err);
        if (!skipLocalWrite && !localWriteDone) {
          try {
            const currentLocal = await this.localRepo.getState();
            const fallbackState = this.mergeStates(currentLocal, state);
            await this.localRepo.saveState(fallbackState);
          } catch (localErr) {
            throw localErr instanceof Error ? localErr : new Error(String(localErr));
          }
        }
        throw err instanceof Error ? err : new Error(String(err));
      }
  ```

- [ ] **Step 2: Add unit test to verify fallback merge behavior**
  In `packages/shared/src/repository/SupabaseProgressRepository.test.ts`:
  - Add the following test case:
  ```typescript
  it("should merge changes with pre-existing local state on saveState query failure", async () => {
    const mockSupabase = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error("Supabase is down"))
      }))
    };

    const newRepo = new SupabaseProgressRepository(mockSupabase as any);
    try {
      // 1. Setup local state with some initial synced cloud progress
      const initialLocalState: ProgressState = {
        completedLevels: [{ module: "shikaku", levelId: "1", completedAt: 100, stars: 3 }],
        foodConsumed: 1,
        pet: { xp: 10, stage: 1, lastFedAt: 100, happiness: 50, lastPlayedAt: 100, isSleeping: false }
      };
      await (newRepo as any).localRepo.saveState(initialLocalState);

      // 2. Perform a saveState with a new local action (e.g. food consumed incremented, XP incremented)
      // but without the level completion progress which might have been missed in memory load
      const newStateUpdate: ProgressState = {
        completedLevels: [], // simulates local-only snapshot constructed without knowledge of synced levels
        foodConsumed: 2,
        pet: { xp: 15, stage: 1, lastFedAt: 150, happiness: 50, lastPlayedAt: 100, isSleeping: false }
      };

      await expect(newRepo.saveState(newStateUpdate)).rejects.toThrow("Supabase is down");

      // 3. Verify the final local state contains the merged result (both level progress AND new XP/food)
      const finalLocal = await (newRepo as any).localRepo.getState();
      expect(finalLocal.completedLevels.length).toBe(1);
      expect(finalLocal.completedLevels[0].levelId).toBe("1");
      expect(finalLocal.foodConsumed).toBe(2);
      expect(finalLocal.pet.xp).toBe(15);
    } finally {
      newRepo.dispose();
    }
  });
  ```

- [ ] **Step 3: Run repository tests**
  Run: `rtk npx vitest run packages/shared/src/repository/SupabaseProgressRepository.test.ts`
  Expected: PASS

---

### Task 4: Fix Never-Interacted Pet Merge
**Files:**
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.ts`
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.test.ts`

- [ ] **Step 1: Check if maxTime > 0 before evaluating mock timestamps**
  In `packages/shared/src/repository/SupabaseProgressRepository.ts`:
  - Locate `getUnscaledInteractionTime` (around line 235).
  - Update `now` definition:
  ```typescript
    const now = (maxTime > 0 && maxTime < MOCK_TIMESTAMP_THRESHOLD) ? maxTime : Date.now();
  ```

- [ ] **Step 2: Add unit test verifying never-interacted pet sleeping wins**
  In `packages/shared/src/repository/SupabaseProgressRepository.test.ts`:
  - Add the following test case:
  ```typescript
  it("should evaluate unscaled time relative to Date.now() when maxTime is 0, permitting correct merges", () => {
    // Local pet is sleeping, cloud is awake, both never fed/played (timestamps = 0)
    const localPet = { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: true };
    const cloudPet = { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false };

    const localRealTime = (repo as any).getUnscaledInteractionTime(localPet.lastFedAt, localPet.lastPlayedAt, localPet.isSleeping);
    const cloudRealTime = (repo as any).getUnscaledInteractionTime(cloudPet.lastFedAt, cloudPet.lastPlayedAt, cloudPet.isSleeping);

    // Sleeping divisor unscales elapsed time by 2/4.
    // If Date.now() is evaluated: local (sleeping) should produce a non-zero timestamp representing unscaled interaction time,
    // which is greater than cloud (awake = unscaled 0 because divisor is 1, yielding elapsed = now -> realLastFedAt = now - now = 0).
    expect(localRealTime).toBeGreaterThan(cloudRealTime);

    const merged = (repo as any).mergeStates(
      { completedLevels: [], foodConsumed: 0, pet: localPet },
      { completedLevels: [], foodConsumed: 0, pet: cloudPet }
    );
    expect(merged.pet.isSleeping).toBe(true);
  });
  ```

- [ ] **Step 3: Run repository tests**
  Run: `rtk npx vitest run packages/shared/src/repository/SupabaseProgressRepository.test.ts`
  Expected: PASS

---

### Task 5: Handle `feedPet` Errors in UI
**Files:**
- Modify: `packages/shell/src/components/PetWidget.tsx`
- Modify: `packages/pets/src/PetsApp.tsx`
- Modify: `packages/shell/src/hooks/useProgressService.tsx`

- [ ] **Step 1: Safe-wrap hooks in useProgressService**
  In `packages/shell/src/hooks/useProgressService.tsx`:
  - Wrap hook functions `feedPet`, `playWithPet`, and `toggleSleep` with try/catch to log the errors but rethrow them to allow the caller components to react:
  ```typescript
  const feedPet = useCallback(async () => {
    try {
      await progressService.feedPet();
    } catch (err) {
      console.error("ProgressService: feedPet failed:", err);
      throw err;
    }
  }, [progressService]);

  const playWithPet = useCallback(async () => {
    try {
      await progressService.playWithPet();
    } catch (err) {
      console.error("ProgressService: playWithPet failed:", err);
      throw err;
    }
  }, [progressService]);

  const toggleSleep = useCallback(async () => {
    try {
      await progressService.toggleSleep();
    } catch (err) {
      console.error("ProgressService: toggleSleep failed:", err);
      throw err;
    }
  }, [progressService]);
  ```

- [ ] **Step 2: Catch error in PetWidget.tsx**
  In `packages/shell/src/components/PetWidget.tsx`:
  - Update `handleFeed` to only trigger animation if `feedPet` succeeds:
  ```typescript
  const handleFeed = useCallback(async () => {
    try {
      await feedPet();
      setSpriteStatus("eating");
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setSpriteStatus("idle"), 2000);
    } catch (err) {
      // Ignored since useProgressService logs it
    }
  }, [feedPet]);
  ```

- [ ] **Step 3: Catch error in PetsApp.tsx**
  In `packages/pets/src/PetsApp.tsx`:
  - Update `handleFeed` to only trigger animation if `feedPet` succeeds:
  ```typescript
  const handleFeed = async () => {
    if (!hasProgress || !canFeed) return;
    try {
      await progressState.feedPet();
      setSpriteStatus("eating");
      setTimeout(() => setSpriteStatus("idle"), 2000);
    } catch (err) {
      // Ignored
    }
  };
  ```

- [ ] **Step 4: Verify typecheck & lint**
  Run: `rtk npm run typecheck`
  Run: `rtk npm run lint`
  Expected: PASS

---

### Task 6: Hook Up isSleeping in Pets MFE
**Files:**
- Modify: `packages/pets/src/PetsApp.tsx`

- [ ] **Step 1: Declare isSleeping in PetsApp types & restrict feeding**
  In `packages/pets/src/PetsApp.tsx`:
  - Update `ProgressState` interface to include `isSleeping: boolean`.
  - Update `canFeed` to check `!(progressState?.isSleeping ?? false)`.
  - Pass `isSleeping={progressState?.isSleeping ?? false}` to `<PetSprite>`.
  
  Code changes:
  ```typescript
  interface ProgressState {
    state: {
      pet: {
        xp: number;
        stage: number;
        lastFedAt: number;
        happiness: number;
        isSleeping?: boolean;
      };
      completedLevels: unknown[];
      foodConsumed: number;
    };
    isHungry: boolean;
    foodAvailable: number;
    hungryLevel: number;
    happiness: number;
    isSleeping: boolean;
    feedPet: () => Promise<void>;
  }
  ```

  Change `canFeed` (around line 93):
  ```typescript
  const canFeed = isHungry && foodAvailable > 0 && !(progressState?.isSleeping ?? false);
  ```

  Change `<PetSprite>` (around line 127):
  ```typescript
            <PetSprite
              size={120}
              stage={petState.stage}
              status={spriteStatus}
              isSleeping={progressState?.isSleeping ?? false}
              isHungry={isHungry}
              animationFrame={animationFrame}
            />
  ```

- [ ] **Step 2: Verify typecheck, lint, and all tests**
  Run: `rtk npm run typecheck`
  Run: `rtk npm run lint`
  Run: `rtk npm run test`
  Expected: PASS
