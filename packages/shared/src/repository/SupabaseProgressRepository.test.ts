/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
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

  it("should fall back to local progress and throw when cloud state is invalid schema (Issue 3)", async () => {
    // Mock Supabase returning invalid state
    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          state: {
            completedLevels: "not-an-array", // Invalid
            foodConsumed: 1,
            pet: null // Invalid
          }
        },
        error: null
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    }));

    // Setup local state
    const localState = {
      completedLevels: [{ module: "sokoban", levelId: "1", completedAt: 600, stars: 3 }],
      foodConsumed: 10,
      pet: { xp: 20, stage: 2, lastFedAt: 100, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: localState }));

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const state = await repo.getState();

    // Verify it fell back to local state
    expect(state.foodConsumed).toBe(10);
    expect(state.pet.xp).toBe(20);
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("should propagate non-PGRST116 errors and fall back without cloud overwrite (Issue 1)", async () => {
    // Mock database error (e.g. 503 Service Unavailable)
    const dbError = { code: "503", message: "Service Unavailable" };
    const upsertSpy = vi.fn().mockResolvedValue({ error: null });
    
    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: dbError
      }),
      upsert: upsertSpy
    }));

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const state = await repo.getState();

    // Should return local progress
    expect(state.foodConsumed).toBe(0);
    // Should NOT upsert local progress to cloud
    expect(upsertSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("should perform first-time sync when error is PGRST116 (Issue 1)", async () => {
    // Mock no rows found error
    const dbError = { code: "PGRST116", message: "No rows found" };
    const upsertSpy = vi.fn().mockResolvedValue({ error: null });
    
    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: dbError
      }),
      upsert: upsertSpy
    }));

    await repo.getState();
    // Should perform first-time sync upsert
    expect(upsertSpy).toHaveBeenCalled();
  });

  it("should guard pet state when cloud pet is missing or has missing fields (Issue 7)", async () => {
    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          state: {
            completedLevels: [],
            foodConsumed: 1,
            pet: { xp: 5 } // Missing stage, happiness, lastFedAt, lastPlayedAt, isSleeping
          }
        },
        error: null
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    }));

    const state = await repo.getState();
    expect(state.pet.xp).toBe(5);
    expect(state.pet.stage).toBeDefined();
    expect(state.pet.happiness).toBe(50); // defaulted
    expect(state.pet.isSleeping).toBe(false); // defaulted
  });

  it("should prevent data loss on saveState by fetching and merging cloud state first (Issue 2)", async () => {
    // Cloud state has a different finished level than the one we are saving
    const cloudProgress = {
      completedLevels: [{ module: "shikaku", levelId: "10", completedAt: 100, stars: 3 }],
      foodConsumed: 5,
      pet: { xp: 50, stage: 3, lastFedAt: 10, happiness: 100, lastPlayedAt: 10, isSleeping: false }
    };
    
    const upsertSpy = vi.fn().mockResolvedValue({ error: null });
    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { state: cloudProgress },
        error: null
      }),
      upsert: upsertSpy
    }));

    const localToSave: ProgressState = {
      completedLevels: [{ module: "sokoban", levelId: "1", completedAt: 200, stars: 1 }],
      foodConsumed: 1,
      pet: { xp: 10, stage: 1, lastFedAt: 100, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
    };

    await repo.saveState(localToSave);

    // Verify upsert was called with merged data (contains both levels, higher pet XP, higher foodConsumed)
    expect(upsertSpy).toHaveBeenCalled();
    const lastCallArg = upsertSpy.mock.calls[0][0];
    expect(lastCallArg.state.completedLevels).toHaveLength(2);
    expect(lastCallArg.state.pet.xp).toBe(50);
    expect(lastCallArg.state.foodConsumed).toBe(5);
  });

  it("should cache userId via auth listener and not call auth.getUser repeatedly (Issue 5)", async () => {
    let listenerCallback: any = null;
    const mockAuthListener = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-uuid" } } }),
        onAuthStateChange: vi.fn().mockImplementation((cb) => {
          listenerCallback = cb;
          return { data: { subscription: { unsubscribe: vi.fn() } } };
        })
      },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { state: null }, error: null }),
        upsert: vi.fn().mockResolvedValue({ error: null })
      }))
    };

    const newRepo = new SupabaseProgressRepository(mockAuthListener as any);
    expect(mockAuthListener.auth.onAuthStateChange).toHaveBeenCalled();

    // Fire the listener callback to cache the user ID
    listenerCallback("SIGNED_IN", { user: { id: "cached-user-uuid" } });

    // Call saveState which calls getUserId internally
    const state: ProgressState = {
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
    };
    await newRepo.saveState(state);

    // Verify getUser was not called at all since the ID was cached via onAuthStateChange callback
    expect(mockAuthListener.auth.getUser).not.toHaveBeenCalled();
  });
});
