# Supabase Cloud Sync Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Supabase-backed progression repository to store game progress and virtual pet state, with user authentication via a retro terminal modal.

**Architecture:** Implement a local-first `SupabaseProgressRepository` that caches state locally (in LocalStorage) for zero-latency gameplay, syncing with Supabase in the background when the user is logged in. Integrate a pixelated auth modal into the host shell.

**Tech Stack:** React, TypeScript, Vitest, Supabase JS Client (`@supabase/supabase-js`), Tailwind CSS, Zustand, Vite.

---

## File Structure Map

```
packages/
  shared/
    src/
      index.ts (Modify to export SupabaseProgressRepository)
      repository/
        SupabaseProgressRepository.ts (Create client sync wrapper)
        SupabaseProgressRepository.test.ts (Create TDD repository test)
  shell/
    src/
      utils/
        supabase.ts (Create client instance wrapper)
      hooks/
        useProgressService.ts (Modify to swap repo & sync auth state)
      components/
        CloudSyncModal.tsx (Create CRT/Terminal auth dialog)
        ConsoleFrame.tsx (Modify header to include cloud sync status indicator)
      App.tsx (Modify to render CloudSyncModal and manage modal open state)
```

---

## Tasks

### Task 1: Install `@supabase/supabase-js` Dependency

**Files:**
- Modify: `packages/shared/package.json`
- Modify: `packages/shell/package.json`

- [ ] **Step 1: Declare dependency in `packages/shared/package.json`**

Add `"@supabase/supabase-js": "^2.43.4"` to the `"dependencies"` object in `packages/shared/package.json`.

```json
{
  "name": "shared",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "default": "./src/index.ts"
    }
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.43.4"
  }
}
```

- [ ] **Step 2: Declare dependency in `packages/shell/package.json`**

Add `"@supabase/supabase-js": "^2.43.4"` to the `"dependencies"` object in `packages/shell/package.json`.

```json
  "dependencies": {
    "@supabase/supabase-js": "^2.43.4",
    "@tanstack/react-query": "^5.40.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "shared": "*",
    "zustand": "^4.5.2"
  }
```

- [ ] **Step 3: Run package installation in project root**

Run: `rtk npm install`
Expected: Installation completes successfully, and `package-lock.json` is updated.

- [ ] **Step 4: Commit dependencies**

Run: `rtk git add packages/shared/package.json packages/shell/package.json package-lock.json && rtk git commit -m "chore: add @supabase/supabase-js dependency to packages"`

---

### Task 2: Create `SupabaseProgressRepository` with TDD

**Files:**
- Create: `packages/shared/src/repository/SupabaseProgressRepository.ts`
- Create: `packages/shared/src/repository/SupabaseProgressRepository.test.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Write unit tests in `packages/shared/src/repository/SupabaseProgressRepository.test.ts`**

We will write unit tests using mock Supabase client structures to ensure that reads fetch/merge and writes update both the local storage repository and the remote Supabase database.

Create `packages/shared/src/repository/SupabaseProgressRepository.test.ts`:
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { SupabaseProgressRepository } from "./SupabaseProgressRepository";
import { STORAGE_KEY } from "./LocalProgressRepository";
import type { ProgressState } from "../progress/types";

// Setup global mock for localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; }
  };
})();
vi.stubGlobal("localStorage", localStorageMock);

describe("SupabaseProgressRepository", () => {
  let mockSupabase: any;
  let repo: SupabaseProgressRepository;

  beforeEach(() => {
    localStorage.clear();
    
    // Create an empty initial state in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      state: {
        completedLevels: [],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
      }
    }));

    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-uuid" } } })
      },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            state: {
              completedLevels: [{ module: "shikaku", levelId: "1", completedAt: 500, stars: 2 }],
              foodConsumed: 1,
              pet: { xp: 5, stage: 1, lastFedAt: 200, happiness: 80, lastPlayedAt: 1000, isSleeping: false }
            }
          },
          error: null
        }),
        upsert: vi.fn().mockResolvedValue({ error: null })
      }))
    };

    repo = new SupabaseProgressRepository(mockSupabase);
  });

  it("should get combined state from LocalStorage and Cloud (merge on login)", async () => {
    // Modify local state to have some unique achievements
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: 1,
      state: {
        completedLevels: [
          { module: "shikaku", levelId: "1", completedAt: 600, stars: 3 }, // Higher stars
          { module: "sokoban", levelId: "2", completedAt: 700, stars: 1 }  // Unique local level
        ],
        foodConsumed: 0,
        pet: { xp: 2, stage: 1, lastFedAt: 100, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
      }
    }));

    const state = await repo.getState();

    // Verify levels merged correctly (max stars chosen, union of unique levels)
    expect(state.completedLevels).toHaveLength(2);
    
    const lvl1 = state.completedLevels.find(l => l.module === "shikaku" && l.levelId === "1");
    expect(lvl1?.stars).toBe(3); // Picked local stars (3 > 2)
    
    const lvl2 = state.completedLevels.find(l => l.module === "sokoban" && l.levelId === "2");
    expect(lvl2).toBeDefined();

    // Verify Pet state picked the one with higher XP (Cloud pet has XP 5, Local has XP 2)
    expect(state.pet.xp).toBe(5);
    expect(state.foodConsumed).toBe(1); // Capped at max (1 > 0)
  });

  it("should write saveState to both LocalStorage and Supabase", async () => {
    const newState: ProgressState = {
      completedLevels: [{ module: "slitherlink", levelId: "3", completedAt: 1200, stars: 3 }],
      foodConsumed: 2,
      pet: { xp: 15, stage: 2, lastFedAt: 1100, happiness: 90, lastPlayedAt: 1000, isSleeping: false }
    };

    await repo.saveState(newState);

    // Verify local storage is updated
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    expect(local.state.pet.xp).toBe(15);

    // Verify Supabase upsert was called with correct data
    expect(mockSupabase.from).toHaveBeenCalledWith("user_progress");
  });
});
```

- [ ] **Step 2: Run tests to verify the compile/test fails**

Run: `rtk npm run test -- packages/shared/src/repository/SupabaseProgressRepository.test.ts`
Expected: Fail since `SupabaseProgressRepository` file is not created yet.

- [ ] **Step 3: Implement `SupabaseProgressRepository`**

Create `packages/shared/src/repository/SupabaseProgressRepository.ts`:
```typescript
import { SupabaseClient } from "@supabase/supabase-js";
import { LocalProgressRepository } from "./LocalProgressRepository";
import type { ProgressRepository } from "./ProgressRepository";
import type { ProgressState } from "../progress/types";

export class SupabaseProgressRepository implements ProgressRepository {
  private localRepo = new LocalProgressRepository();

  constructor(private supabase: SupabaseClient) {}

  private async getUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
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

    const useLocalPet = local.pet.xp > cloud.pet.xp;
    const pet = useLocalPet ? local.pet : cloud.pet;
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

      if (error || !data) {
        // First time cloud sync: push local state
        await this.supabase.from("user_progress").upsert({
          user_id: userId,
          state: localState,
        });
        return localState;
      }

      const cloudState = data.state as ProgressState;
      const mergedState = this.mergeStates(localState, cloudState);
      
      // Keep both stores updated with merged achievements
      await this.localRepo.saveState(mergedState);
      await this.supabase.from("user_progress").upsert({
        user_id: userId,
        state: mergedState,
      });

      return mergedState;
    } catch (err) {
      console.error("Supabase load error, using local fallback:", err);
      return localState;
    }
  }

  async saveState(state: ProgressState): Promise<void> {
    await this.localRepo.saveState(state);

    const userId = await this.getUserId();
    if (userId) {
      try {
        const { error } = await this.supabase
          .from("user_progress")
          .upsert({ user_id: userId, state });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to sync state to Supabase:", err);
      }
    }
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    const changed = await this.localRepo.completeLevel(module, levelId);
    if (changed) {
      const newState = await this.localRepo.getState();
      await this.saveState(newState);
    }
    return changed;
  }

  async completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean> {
    const changed = await this.localRepo.completeLevelWithStars(module, levelId, stars);
    if (changed) {
      const newState = await this.localRepo.getState();
      await this.saveState(newState);
    }
    return changed;
  }

  async feedPet(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
    await this.localRepo.feedPet(lastFedAt, lastPlayedAt);
    const newState = await this.localRepo.getState();
    await this.saveState(newState);
  }

  async playWithPet(happiness: number): Promise<void> {
    await this.localRepo.playWithPet(happiness);
    const newState = await this.localRepo.getState();
    await this.saveState(newState);
  }

  async toggleSleep(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
    await this.localRepo.toggleSleep(lastFedAt, lastPlayedAt);
    const newState = await this.localRepo.getState();
    await this.saveState(newState);
  }
}
```

- [ ] **Step 4: Run tests to verify the implementation passes**

Run: `rtk npm run test -- packages/shared/src/repository/SupabaseProgressRepository.test.ts`
Expected: PASS.

- [ ] **Step 5: Export from `packages/shared/src/index.ts`**

Modify: `packages/shared/src/index.ts`

```typescript
export type { CompletedLevel, PetState, ProgressState } from "./progress/types";
export type { ProgressRepository } from "./repository/ProgressRepository";
export { LocalProgressRepository, STORAGE_KEY } from "./repository/LocalProgressRepository";
export { SupabaseProgressRepository } from "./repository/SupabaseProgressRepository";
export { ProgressService, HUNGER_COOLDOWN } from "./progress/service";
export { getEvolutionStage, EVOLUTION_THRESHOLDS } from "./pet/evolution";
```

- [ ] **Step 6: Run full shared package test suite to verify no regressions**

Run: `rtk npm run test`
Expected: All tests pass.

- [ ] **Step 7: Commit Repository Implementation**

Run: `rtk git add packages/shared/src/ && rtk git commit -m "feat(shared): implement SupabaseProgressRepository with local fallback & test"`

---

### Task 3: Setup Client & Wire to Shell Progress Hook

**Files:**
- Create: `packages/shell/src/utils/supabase.ts`
- Modify: `packages/shell/src/hooks/useProgressService.ts`

- [ ] **Step 1: Create Supabase Client Wrapper**

Create `packages/shell/src/utils/supabase.ts`:
```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
```

- [ ] **Step 2: Update Shell Progress Service Hook**

Import and instantiate `SupabaseProgressRepository` conditionally. Subscribe to auth changes to fetch latest user progress when they log in or out.

Modify: `packages/shell/src/hooks/useProgressService.ts`
```typescript
import { useState, useEffect, useCallback } from "react";
import { ProgressService, LocalProgressRepository, SupabaseProgressRepository } from "shared";
import type { ProgressState } from "shared";
import { supabase, isSupabaseConfigured } from "../utils/supabase";

const repo = isSupabaseConfigured && supabase
  ? new SupabaseProgressRepository(supabase)
  : new LocalProgressRepository();

const progressService = new ProgressService(repo);

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

  // Sync state whenever auth status changes
  useEffect(() => {
    if (!supabase) return;
    
    // Initial fetch of session state
    void refresh();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void refresh();
    });
    return () => subscription.unsubscribe();
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

- [ ] **Step 3: Verify the changes compile**

Run: `rtk npm run typecheck`
Expected: Exit code 0 (no TypeScript errors).

- [ ] **Step 4: Commit Client and Hook integration**

Run: `rtk git add packages/shell/src/utils/supabase.ts packages/shell/src/hooks/useProgressService.ts && rtk git commit -m "feat(shell): integrate Supabase progress repo and onAuthStateChange binding"`

---

### Task 4: Create CloudSyncModal UI Component

**Files:**
- Create: `packages/shell/src/components/CloudSyncModal.tsx`

- [ ] **Step 1: Write CloudSyncModal Component**

We will create a retro-themed dialogue modal that handles user registration, authentication, log out, and errors. It displays diagnostic logs (flashing prompt styling) and connection info.

Create `packages/shell/src/components/CloudSyncModal.tsx`:
```typescript
import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../utils/supabase";

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CloudSyncModal({ isOpen, onClose }: CloudSyncModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    void checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setErrorMsg(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("REGISTRATION SUCCESS. VERIFY EMAIL IF REQUIRED.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage("LOGIN SUCCESSFUL. CLOUD PROGRESS SYNCED.");
        setTimeout(onClose, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message?.toUpperCase() || "AUTH ERROR");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setMessage("LOGOUT SUCCESSFUL. LOCAL REPO REMAINS ACTIVE.");
      setTimeout(onClose, 1500);
    } catch (err: any) {
      setErrorMsg(err.message?.toUpperCase() || "LOGOUT ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md retro-window max-h-[90vh] overflow-y-auto">
        <div className="window-header">
          <span className="window-header-accent">SYS_AUTHENTICATOR.EXE</span>
          <button
            onClick={onClose}
            className="text-cozy-accent hover:underline bg-transparent border-none cursor-pointer font-press text-[9px]"
          >
            [X]
          </button>
        </div>
        <div className="window-body p-6 flex flex-col gap-4 font-press text-[10px] text-cozy-text leading-relaxed">
          {!isSupabaseConfigured ? (
            <div className="flex flex-col gap-3 text-red-500">
              <p className="text-[11px] font-bold">⚠ CONFIGURATION ERROR</p>
              <p className="text-[8px] leading-4 text-cozy-text">
                SUPABASE ENV VARIABLES ARE MISSING. CLOUD SYNC IS INOFFICIAL.
                PLEASE ADD THESE TO YOUR .env FILE:
              </p>
              <pre className="p-3 bg-black/60 border border-dashed border-red-900 text-[7px] text-red-400 overflow-x-auto whitespace-pre-wrap select-all">
                VITE_SUPABASE_URL=your_project_url{"\n"}
                VITE_SUPABASE_ANON_KEY=your_anon_key
              </pre>
            </div>
          ) : userEmail ? (
            <div className="flex flex-col gap-4">
              <div className="border border-dashed border-cozy-border p-3 bg-black/40">
                <p className="text-cozy-accent">STATUS: CONNECTED</p>
                <p className="text-[8px] mt-1 text-cozy-text/70">ACCOUNT: {userEmail}</p>
                <p className="text-[8px] mt-1 text-green-500">✔ SYNC: AUTOMATIC CLOUD SYNC ACTIVE</p>
              </div>

              {message && <p className="text-green-500 text-[8px]">{message}</p>}
              {errorMsg && <p className="text-red-500 text-[8px]">ERROR: {errorMsg}</p>}

              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full pixel-btn bg-red-950/20 text-red-500 border-red-900 hover:bg-red-900 hover:text-white"
              >
                {loading ? "TERMINATING..." : "LOG OUT"}
              </button>
            </div>
          ) : (
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              <div className="text-[8px] text-cozy-text/70 mb-2 leading-4">
                AUTHENTICATE TO LINK YOUR RETRO PET PROGRESS AND LEVEL COMPLETIONS TO THE CLOUD.
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-cozy-accent text-[8px]">EMAIL_ADDR:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black border border-cozy-border text-cozy-text p-2 font-mono text-[10px] focus:outline-none focus:border-cozy-accent"
                  placeholder="user@cozyos.net"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-cozy-accent text-[8px]">ACCESS_KEY:</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black border border-cozy-border text-cozy-text p-2 font-mono text-[10px] focus:outline-none focus:border-cozy-accent"
                  placeholder="••••••••"
                />
              </div>

              {message && <p className="text-green-500 text-[8px]">{message}</p>}
              {errorMsg && <p className="text-red-500 text-[8px]">ERROR: {errorMsg}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full pixel-btn bg-cozy-accent text-black font-bold py-2 mt-2"
              >
                {loading ? "EXECUTING..." : isSignUp ? "REGISTER ACCOUNT" : "SIGN IN"}
              </button>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setErrorMsg(null);
                    setMessage(null);
                  }}
                  className="text-[8px] text-cozy-accent hover:underline bg-transparent border-none cursor-pointer"
                >
                  {isSignUp ? "ALREADY INSTALLED? LOG IN" : "NEW TERMINAL ID? REGISTER HERE"}
                </button>
              </div>
            </form>
          )}

          <div className="border-t border-dashed border-cozy-border pt-3 mt-1 flex justify-between items-center text-[7px] text-cozy-text/40">
            <span>SYS.VER: 4.7-SECURE</span>
            <span className="animate-pulse">_BLINK</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit Modal UI**

Run: `rtk git add packages/shell/src/components/CloudSyncModal.tsx && rtk git commit -m "feat(shell): implement pixel-CRT CloudSyncModal UI component"`

---

### Task 5: Add Cloud Sync Indicator Button & Mount Modal

**Files:**
- Modify: `packages/shell/src/components/ConsoleFrame.tsx`
- Modify: `packages/shell/src/App.tsx`

- [ ] **Step 1: Add props and render Cloud Button in `ConsoleFrame.tsx`**

Modify `packages/shell/src/components/ConsoleFrame.tsx` to display a cloud connection indicator status.

Modify: `packages/shell/src/components/ConsoleFrame.tsx`
```typescript
interface ConsoleFrameProps {
  children: React.ReactNode;
  currentTab: Tab;
  setTab: (tab: Tab) => void;
  onMobileHud?: () => void;
  onCloudClick?: () => void;
  cloudUser: string | null;
}
```
Update ConsoleFrame implementation to pull these props and place the cloud button left of the Sound toggle:
```typescript
export default function ConsoleFrame({
  children,
  onMobileHud,
  onCloudClick,
  cloudUser,
}: ConsoleFrameProps): React.ReactElement {
  const [muted, setMuted] = useState<boolean>(getAudioMuted);
```
And inside the header menu (`<div className="flex items-center gap-3">`):
```typescript
          <div className="flex items-center gap-3">
            {onCloudClick && (
              <button
                onClick={onCloudClick}
                className={`pixel-btn text-[9px] px-3 py-1 ${
                  cloudUser ? "bg-green-950/20 text-green-500 border-green-900" : ""
                }`}
                aria-label="Cloud sync options"
              >
                CLOUD: {cloudUser ? "SYNCED" : "OFFLINE"}
              </button>
            )}

            <button
              onClick={handleAudioToggle}
```

- [ ] **Step 2: Mount Modal in `App.tsx`**

We will configure session state tracking and bind ConsoleFrame events.

Modify: `packages/shell/src/App.tsx`
Update imports:
```typescript
import ConsoleFrame from "./components/ConsoleFrame";
import CloudSyncModal from "./components/CloudSyncModal";
import { supabase } from "./utils/supabase";
```
Update App body to track modal open state and session active state:
```typescript
export default function App(): React.ReactElement {
  const { currentTab, navigate } = useHashRouter();
  const windowRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileHudOpen, setIsMobileHudOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [cloudUser, setCloudUser] = useState<string | null>(null);
  const progressService = useProgressService();

  useEffect(() => {
    if (!supabase) return;
    
    // Check initial user
    void supabase.auth.getUser().then(({ data: { user } }) => {
      setCloudUser(user?.email || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCloudUser(session?.user?.email || null);
    });

    return () => subscription.unsubscribe();
  }, []);
```
Pass variables to `<ConsoleFrame>`:
```typescript
        <ConsoleFrame
          currentTab={currentTab}
          setTab={navigate}
          onMobileHud={() => setIsMobileHudOpen(true)}
          onCloudClick={() => setIsCloudModalOpen(true)}
          cloudUser={cloudUser}
        >
```
Render `<CloudSyncModal>` at bottom of markup:
```typescript
          </div>
        </ConsoleFrame>
        
        <CloudSyncModal
          isOpen={isCloudModalOpen}
          onClose={() => setIsCloudModalOpen(false)}
        />
      </div>
    </QueryClientProvider>
  );
}
```

- [ ] **Step 3: Verify build compiles and tests pass**

Run: `rtk npm run typecheck`
Expected: PASS.

Run: `rtk npm run test`
Expected: Pass.
*(Note: If tests for App or ConsoleFrame require mocks, ensure mock values are supplied in mocks or tests).*

- [ ] **Step 4: Commit Modal integration**

Run: `rtk git add packages/shell/src/App.tsx packages/shell/src/components/ConsoleFrame.tsx && rtk git commit -m "feat(shell): mount CloudSyncModal and sync header indicators"`

---

## Verification Plan

### Automated Verification
Run full type check and tests:
- `rtk npm run typecheck`
- `rtk npm run test`

### Manual Verification
1. Run local dev server: `rtk npm run dev`
2. Open in browser `http://localhost:3000`.
3. Check the header is showing `CLOUD: OFFLINE`.
4. Click the `CLOUD: OFFLINE` button. Ensure the `SYS_AUTHENTICATOR.EXE` modal pops open.
5. In your project root, copy `.env.example` to `.env` (or create `.env`) and input a dummy or real Supabase URL/Anon key, then restart dev server to verify the "missing config" warnings disappear.
6. Trigger email/password signup and login, verifying that state cache operations function and sync to the cloud is attempted.
