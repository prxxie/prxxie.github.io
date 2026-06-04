# Supabase Sync and Auth Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve 10 critical, high, medium, and cleanup issues identified in the Supabase backend progress synchronization and authentication logic.

**Architecture:** 
- Centralize auth subscription to `App.tsx` and distribute state downward via props.
- Add in-memory state caching to `LocalProgressRepository` to avoid duplicate reads/writes.
- Sanitize and validate Supabase JSONB payload to avoid local storage corruption.
- Safeguard Supabase client initialization against malformed URLs/keys.
- Optimize database transactions by fetching, merging, and writing state atomically.

**Tech Stack:** React, TypeScript, Zustand, Supabase client, Vitest

---

### Task 1: Supabase Initialization Safety (Issue 4)

**Files:**
- Modify: `packages/shell/src/utils/supabase.ts`

- [x] **Step 1: Safeguard client initialization**
  Wrap client creation with URL validation and try-catch to avoid crashing on malformed env variables.
  ```typescript
  import { createClient, SupabaseClient } from "@supabase/supabase-js";

  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "") as string;
  const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "") as string;

  let supabaseInstance: SupabaseClient | null = null;
  let isConfigured = false;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      new URL(supabaseUrl);
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
      isConfigured = true;
    } catch (err) {
      console.error("Supabase initialization failed (check VITE_SUPABASE_URL):", err);
      supabaseInstance = null;
      isConfigured = false;
    }
  }

  export const supabase = supabaseInstance;
  export const isSupabaseConfigured = isConfigured;
  ```

- [x] **Step 2: Verify lint and unit tests pass**
  Run: `rtk npx vitest run packages/shell/src/components/CloudSyncModal.test.tsx`
  Expected: PASS

---

### Task 2: Schema Validation and Sync Robustness (Issues 1, 3, 7)

**Files:**
- Modify: `packages/shared/src/repository/SupabaseProgressRepository.ts`

- [x] **Step 1: Implement schema validation & error handling in SupabaseProgressRepository**
  Add `sanitizeProgressState`, update `getUserId` caching, update `getState()` error handling, and guard `mergeStates()` from null `pet` values.
  ```typescript
  import { SupabaseClient } from "@supabase/supabase-js";
  import { LocalProgressRepository } from "./LocalProgressRepository";
  import type { ProgressRepository } from "./ProgressRepository";
  import type { ProgressState, CompletedLevel } from "../progress/types";
  import { getEvolutionStage } from "../pet/evolution";

  export class SupabaseProgressRepository implements ProgressRepository {
    private localRepo = new LocalProgressRepository();
    private cachedUserId: string | null = null;
    private userIdInitialized = false;

    constructor(private supabase: SupabaseClient) {
      this.supabase.auth.onAuthStateChange((_event, session) => {
        this.cachedUserId = session?.user?.id || null;
        this.userIdInitialized = true;
      });
    }

    private async getUserId(): Promise<string | null> {
      if (this.userIdInitialized) {
        return this.cachedUserId;
      }
      try {
        const { data: { session } } = await this.supabase.auth.getSession();
        this.cachedUserId = session?.user?.id || null;
        if (!this.cachedUserId) {
          const { data: { user } } = await this.supabase.auth.getUser();
          this.cachedUserId = user?.id || null;
        }
        this.userIdInitialized = true;
        return this.cachedUserId;
      } catch {
        return null;
      }
    }

    private sanitizeProgressState(state: any): ProgressState | null {
      if (!state || typeof state !== "object") return null;

      if (!Array.isArray(state.completedLevels)) return null;
      const completedLevels: CompletedLevel[] = [];
      for (const lvl of state.completedLevels) {
        if (!lvl || typeof lvl !== "object") return null;
        if (typeof lvl.module !== "string" || typeof lvl.levelId !== "string") return null;
        completedLevels.push({
          module: lvl.module,
          levelId: lvl.levelId,
          stars: typeof lvl.stars === "number" ? lvl.stars : 1,
          completedAt: typeof lvl.completedAt === "number" ? lvl.completedAt : Date.now(),
        });
      }

      const foodConsumed = typeof state.foodConsumed === "number" ? state.foodConsumed : 0;

      const pet = state.pet;
      if (!pet || typeof pet !== "object") return null;
      const xp = typeof pet.xp === "number" ? pet.xp : 0;
      const stage = typeof pet.stage === "number" ? pet.stage : getEvolutionStage(xp);
      const lastFedAt = typeof pet.lastFedAt === "number" ? pet.lastFedAt : 0;
      const happiness = typeof pet.happiness === "number" ? pet.happiness : 50;
      const lastPlayedAt = typeof pet.lastPlayedAt === "number" ? pet.lastPlayedAt : Date.now();
      const isSleeping = typeof pet.isSleeping === "boolean" ? pet.isSleeping : false;

      return {
        completedLevels,
        foodConsumed,
        pet: {
          xp,
          stage,
          lastFedAt,
          happiness,
          lastPlayedAt,
          isSleeping,
        },
      };
    }

    private mergeStates(local: ProgressState, cloud: ProgressState): ProgressState {
      const levelsMap = new Map<string, typeof local.completedLevels[0]>();
      
      const addLevel = (lvl: typeof local.completedLevels[0]) => {
        const key = `${lvl.module}:${lvl.levelId}`;
        const existing = levelsMap.get(key);
        if (!existing || lvl.stars > existing.stars) {
          levelsMap.set(key, lvl);
        }
      };
      
      local.completedLevels.forEach(addLevel);
      cloud.completedLevels.forEach(addLevel);

      const cloudPet = cloud.pet || {
        xp: 0,
        stage: 1,
        lastFedAt: 0,
        happiness: 50,
        lastPlayedAt: Date.now(),
        isSleeping: false,
      };

      if (cloudPet.happiness === undefined) cloudPet.happiness = 50;
      if (cloudPet.lastPlayedAt === undefined) cloudPet.lastPlayedAt = Date.now();
      if (cloudPet.isSleeping === undefined) cloudPet.isSleeping = false;

      const useLocalPet = local.pet.xp > cloudPet.xp;
      const pet = useLocalPet ? { ...local.pet } : { ...cloudPet };
      pet.stage = getEvolutionStage(pet.xp);
      const foodConsumed = Math.max(local.foodConsumed, cloud.foodConsumed);

      return {
        completedLevels: Array.from(levelsMap.values()),
        foodConsumed,
        pet,
      };
    }

    async getState(): Promise<ProgressState> {
      const userId = await this.getUserId();
      const localState = await this.localRepo.getState();

      if (!userId) {
        return localState;
      }

      try {
        const { data, error } = await this.supabase
          .from("user_progress")
          .select("state")
          .eq("user_id", userId)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // First time cloud sync: push local state
            const { error: upsertError } = await this.supabase.from("user_progress").upsert({
              user_id: userId,
              state: localState,
            });
            if (upsertError) throw upsertError;
            return localState;
          }
          throw error;
        }

        if (!data) {
          throw new Error("No data returned");
        }

        const cloudState = data.state as ProgressState;
        const validatedCloudState = this.sanitizeProgressState(cloudState);
        if (!validatedCloudState) {
          throw new Error("Invalid cloud state schema");
        }

        const mergedState = this.mergeStates(localState, validatedCloudState);
        
        await this.localRepo.saveState(mergedState);
        const { error: upsertError } = await this.supabase.from("user_progress").upsert({
          user_id: userId,
          state: mergedState,
        });
        if (upsertError) throw upsertError;

        return mergedState;
      } catch (err) {
        console.error("Supabase load error, using local fallback:", err);
        return localState;
      }
    }

    async saveState(state: ProgressState, skipLocalWrite = false): Promise<void> {
      let finalState = state;
      const userId = await this.getUserId();
      if (userId) {
        try {
          const { data, error } = await this.supabase
            .from("user_progress")
            .select("state")
            .eq("user_id", userId)
            .single();

          if (error) {
            if (error.code !== "PGRST116") {
              throw error;
            }
          } else if (data) {
            const cloudState = data.state as ProgressState;
            const validatedCloudState = this.sanitizeProgressState(cloudState);
            if (validatedCloudState) {
              finalState = this.mergeStates(state, validatedCloudState);
            }
          }

          const { error: upsertError } = await this.supabase
            .from("user_progress")
            .upsert({ user_id: userId, state: finalState });
          if (upsertError) throw upsertError;
        } catch (err) {
          console.error("Failed to sync state to Supabase:", err);
        }
      }

      if (!skipLocalWrite || finalState !== state) {
        await this.localRepo.saveState(finalState);
      }
    }

    async completeLevel(module: string, levelId: string): Promise<boolean> {
      const changed = await this.localRepo.completeLevel(module, levelId);
      if (changed) {
        const newState = await this.localRepo.getState();
        await this.saveState(newState, true);
      }
      return changed;
    }

    async completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean> {
      const changed = await this.localRepo.completeLevelWithStars(module, levelId, stars);
      if (changed) {
        const newState = await this.localRepo.getState();
        await this.saveState(newState, true);
      }
      return changed;
    }

    async feedPet(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
      await this.localRepo.feedPet(lastFedAt, lastPlayedAt);
      const newState = await this.localRepo.getState();
      await this.saveState(newState, true);
    }

    async playWithPet(happiness: number): Promise<void> {
      await this.localRepo.playWithPet(happiness);
      const newState = await this.localRepo.getState();
      await this.saveState(newState, true);
    }

    async toggleSleep(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
      await this.localRepo.toggleSleep(lastFedAt, lastPlayedAt);
      const newState = await this.localRepo.getState();
      await this.saveState(newState, true);
    }
  }
  ```

- [x] **Step 2: Run repository tests**
  Run: `rtk npx vitest run packages/shared/src/repository/SupabaseProgressRepository.test.ts`
  Expected: PASS

---

### Task 3: In-Memory Caching to Optimize Mutations (Issue 9)

**Files:**
- Modify: `packages/shared/src/repository/LocalProgressRepository.ts`

- [x] **Step 1: Add in-memory cache to LocalProgressRepository**
  Avoid redundant localStorage parses by caching the state in-memory.
  ```typescript
  export class LocalProgressRepository implements ProgressRepository {
    private cachedState: ProgressState | null = null;

    async getState(): Promise<ProgressState> {
      if (this.cachedState) {
        return this.cachedState;
      }
      await Promise.resolve();
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          this.cachedState = initialState();
          return this.cachedState;
        }
        const data = JSON.parse(raw) as StoredData;
        if (data.version !== 1) {
          this.cachedState = initialState();
          return this.cachedState;
        }
        
        const state = data.state;
        if (state.pet.happiness === undefined) state.pet.happiness = 50;
        if (state.pet.lastPlayedAt === undefined) state.pet.lastPlayedAt = Date.now();
        if (state.pet.isSleeping === undefined) state.pet.isSleeping = false;
        state.pet.stage = getEvolutionStage(state.pet.xp);
        
        this.cachedState = state;
        return state;
      } catch {
        this.cachedState = initialState();
        return this.cachedState;
      }
    }

    async saveState(state: ProgressState): Promise<void> {
      await Promise.resolve();
      const data: StoredData = { version: 1, state };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        this.cachedState = state;
      } catch (err) {
        throw new Error(`Failed to save progress: ${String(err)}`);
      }
    }
  ```

- [x] **Step 2: Verify all repository unit tests pass**
  Run: `rtk npx vitest run packages/shared/src/repository/`
  Expected: PASS

---

### Task 4: Auth State Subscriptions & Prop Lifting (Issues 6, 8, 10)

**Files:**
- Modify: `packages/shell/src/components/ConsoleFrame.tsx`
- Modify: `packages/shell/src/components/CloudSyncModal.tsx`
- Modify: `packages/shell/src/hooks/useProgressService.ts`
- Modify: `packages/shell/src/App.tsx`
- Modify: `packages/shell/src/components/CloudSyncModal.test.tsx`

- [x] **Step 1: Clean up ConsoleFrame props**
  Make `cloudUser` optional in `ConsoleFrameProps` to resolve inconsistency with conditional render.
  ```typescript
  interface ConsoleFrameProps {
    children: React.ReactNode;
    currentTab: Tab;
    setTab: (tab: Tab) => void;
    onMobileHud?: () => void;
    onCloudClick?: () => void;
    cloudUser?: string | null;
  }
  ```

- [x] **Step 2: Lift CloudSyncModal state and remove inner auth subscriptions**
  Accept `cloudUser` as a prop in `CloudSyncModalProps`. Use `cloudUser` directly to determine status, removing the local `userEmail` and `onAuthStateChange` listener.
  ```typescript
  interface CloudSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    cloudUser: string | null;
  }
  ```
  Replace references to `userEmail` with `cloudUser` inside `CloudSyncModal.tsx`.

- [x] **Step 3: Remove redundant auth listener in useProgressService**
  In `useProgressService.ts`, remove the auth listener completely. It will rely on CustomEvents triggered on login/logout.

- [x] **Step 4: Centralize subscription in App.tsx and emit event**
  In `App.tsx`, listen to auth state changes, update `cloudUser`, and dispatch `cozyos:progress-updated` custom event to trigger reload across the application.
  ```typescript
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        setCloudUser(session?.user?.email || null);
        window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
      });
  ```
  Pass the `cloudUser` prop into `<CloudSyncModal cloudUser={cloudUser} ... />`.

- [x] **Step 5: Update CloudSyncModal unit tests**
  Modify `CloudSyncModal.test.tsx` to pass `cloudUser` appropriately under different scenarios.

- [x] **Step 6: Run all shell and component tests**
  Run: `rtk npx vitest run packages/shell/`
  Expected: PASS
