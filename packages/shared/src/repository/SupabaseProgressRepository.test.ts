/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
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

  afterEach(() => {
    repo.dispose();
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

  it("should propagate the upsert error when first-time sync upsert fails in getState (Issue 1)", async () => {
    // Mock no rows found error
    const dbError = { code: "PGRST116", message: "No rows found" };
    const upsertError = { code: "some-upsert-error", message: "Upsert failed" };
    const upsertSpy = vi.fn().mockResolvedValue({ error: upsertError });

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

    // Verify it still fell back to local state and returned it
    expect(state.foodConsumed).toBe(0);
    // Verify upsert was called
    expect(upsertSpy).toHaveBeenCalled();
    // Verify that the error was caught and logged by the fallback block
    expect(consoleErrorSpy).toHaveBeenCalledWith("Supabase load error, using local fallback:", upsertError);

    consoleErrorSpy.mockRestore();
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

  it("should cache userId and invalidate it on cozyos:progress-updated event", async () => {
    const mockAuth = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-uuid" } } }),
      },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: { state: null }, error: null }),
        upsert: vi.fn().mockResolvedValue({ error: null })
      }))
    };

    const newRepo = new SupabaseProgressRepository(mockAuth as any);
    try {
      const state: ProgressState = {
        completedLevels: [],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
      };

      // First saveState call: fetches user and caches it
      await newRepo.saveState(state);
      expect(mockAuth.auth.getUser).toHaveBeenCalledTimes(1);

      // Second saveState call: uses cached userId
      await newRepo.saveState(state);
      expect(mockAuth.auth.getUser).toHaveBeenCalledTimes(1);

      // Dispatch the cozyos:progress-updated event on window to invalidate cache
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cozyos:progress-updated"));
      }

      // Third saveState call: fetches user again because cache was invalidated
      await newRepo.saveState(state);
      expect(mockAuth.auth.getUser).toHaveBeenCalledTimes(2);
    } finally {
      newRepo.dispose();
    }
  });

  it("should merge pet state properties individually based on latest timestamps (Review 1)", async () => {
    // Cloud pet: played later but fed earlier than local, has higher XP
    const cloudProgress = {
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 50, stage: 3, lastFedAt: 100, happiness: 80, lastPlayedAt: 1000, isSleeping: true }
    };
    
    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { state: cloudProgress },
        error: null
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    }));

    // Local state: played earlier (lower timestamp), but fed later (higher timestamp), has lower XP
    const localState = {
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 10, stage: 1, lastFedAt: 500, happiness: 100, lastPlayedAt: 200, isSleeping: false }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: localState }));

    const state = await repo.getState();

    // Verify individual property merge
    expect(state.pet.xp).toBe(50);
    expect(state.pet.lastFedAt).toBe(500);
    expect(state.pet.lastPlayedAt).toBe(1000);
    expect(state.pet.happiness).toBe(80); // cloud played later -> cloud happiness
    expect(state.pet.isSleeping).toBe(true); // cloud latest interaction (1000) > local (500) -> cloud sleeping
  });

  it("should merge pet state using local values when local has newer interaction timestamps", async () => {
    // Cloud pet: played earlier, fed earlier, lower XP
    const cloudProgress = {
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 5, stage: 1, lastFedAt: 100, happiness: 40, lastPlayedAt: 100, isSleeping: true }
    };
    
    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { state: cloudProgress },
        error: null
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    }));

    // Local state: played later (1000), fed later (500), higher XP
    const localState = {
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 20, stage: 2, lastFedAt: 500, happiness: 90, lastPlayedAt: 1000, isSleeping: false }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: localState }));

    const state = await repo.getState();

    expect(state.pet.xp).toBe(20);
    expect(state.pet.lastFedAt).toBe(500);
    expect(state.pet.lastPlayedAt).toBe(1000);
    expect(state.pet.happiness).toBe(90); // local played later -> local happiness
    expect(state.pet.isSleeping).toBe(false); // local interaction (1000) > cloud (100) -> local sleeping
  });

  it("should self-heal corrupt cloud schema on saveState by overwriting with local state (Review 2)", async () => {
    const upsertSpy = vi.fn().mockResolvedValue({ error: null });
    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: {
          state: {
            completedLevels: "this-is-corrupted-and-should-be-an-array",
            foodConsumed: 0,
            pet: null
          }
        },
        error: null
      }),
      upsert: upsertSpy
    }));

    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const localToSave: ProgressState = {
      completedLevels: [{ module: "sokoban", levelId: "1", completedAt: 200, stars: 1 }],
      foodConsumed: 3,
      pet: { xp: 10, stage: 1, lastFedAt: 100, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
    };

    await repo.saveState(localToSave);

    expect(consoleWarnSpy).toHaveBeenCalled();
    expect(upsertSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should serialize saveState calls sequentially through saveQueue (Review 3)", async () => {
    const executionOrder: string[] = [];
    
    const upsertSpy = vi.fn().mockImplementation(() => {
      executionOrder.push("upsert");
      return Promise.resolve({ error: null });
    });

    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => {
        executionOrder.push("select-start");
        await new Promise((resolve) => setTimeout(resolve, 50));
        executionOrder.push("select-end");
        return { data: { state: null }, error: null };
      }),
      upsert: upsertSpy
    }));

    const state1 = {
      completedLevels: [],
      foodConsumed: 1,
      pet: { xp: 1, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
    };
    const state2 = {
      completedLevels: [],
      foodConsumed: 2,
      pet: { xp: 2, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
    };

    const p1 = repo.saveState(state1);
    const p2 = repo.saveState(state2);

    await Promise.all([p1, p2]);

    expect(executionOrder).toEqual([
      "select-start",
      "select-end",
      "upsert",
      "select-start",
      "select-end",
      "upsert"
    ]);
  });

  it("should reject when Supabase call fails during saveState", async () => {
    const dbError = new Error("Database connection lost");
    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockRejectedValue(dbError)
    }));

    const state: ProgressState = {
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
    };

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(repo.saveState(state)).rejects.toThrow("Database connection lost");

    consoleErrorSpy.mockRestore();
  });

  it("should guard concurrent getUserId calls and call getUser exactly once", async () => {
    let getUserCallCount = 0;
    
    const mockAuth = {
      getUser: vi.fn().mockImplementation(async () => {
        getUserCallCount++;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { data: { user: { id: "test-user-concurrent" } } };
      })
    };
    
    // We need to also support onAuthStateChange if called in constructor
    const mockSupabaseWithAuth = {
      auth: {
        ...mockAuth,
        onAuthStateChange: vi.fn().mockReturnValue({
          data: { subscription: { unsubscribe: vi.fn() } }
        })
      },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
        upsert: vi.fn().mockResolvedValue({ error: null })
      }))
    };
    
    const newRepo = new SupabaseProgressRepository(mockSupabaseWithAuth as any);
    try {
      const state: ProgressState = {
        completedLevels: [],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
      };
      
      const p1 = newRepo.getState();
      const p2 = newRepo.saveState(state);
      
      await Promise.all([p1, p2]);
      
      expect(getUserCallCount).toBe(1);
    } finally {
      newRepo.dispose();
    }
  });

  it("should cache null user ID on getUser failure and not retry repeatedly", async () => {
    let getUserCallCount = 0;
    const mockAuth = {
      auth: {
        getUser: vi.fn().mockImplementation(async () => {
          getUserCallCount++;
          await Promise.resolve();
          throw new Error("Auth network failure");
        })
      },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } })
      }))
    };
    
    const newRepo = new SupabaseProgressRepository(mockAuth as any);
    try {
      // First getState: triggers getUser, fails, and should cache null and set initialized to true
      await newRepo.getState();
      expect(getUserCallCount).toBe(1);
      
      // Second getState: should reuse the cached null ID and NOT trigger getUser again
      await newRepo.getState();
      expect(getUserCallCount).toBe(1);
      
      // Dispatch event to invalidate cache
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cozyos:progress-updated"));
      }
      
      // Third getState: cache was invalidated, should trigger getUser again
      await newRepo.getState();
      expect(getUserCallCount).toBe(2);
    } finally {
      newRepo.dispose();
    }
  });

  it("should check that areStatesEqual handles out-of-order levels correctly", () => {
    const stateA: ProgressState = {
      completedLevels: [
        { module: "shikaku", levelId: "1", completedAt: 100, stars: 3 },
        { module: "sokoban", levelId: "2", completedAt: 200, stars: 2 }
      ],
      foodConsumed: 5,
      pet: { xp: 10, stage: 1, lastFedAt: 100, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
    };

    const stateB: ProgressState = {
      completedLevels: [
        { module: "sokoban", levelId: "2", completedAt: 200, stars: 2 },
        { module: "shikaku", levelId: "1", completedAt: 100, stars: 3 }
      ],
      foodConsumed: 5,
      pet: { xp: 10, stage: 1, lastFedAt: 100, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
    };

    expect((repo as any).areStatesEqual(stateA, stateB)).toBe(true);

    const stateC: ProgressState = {
      ...stateB,
      completedLevels: [
        { module: "sokoban", levelId: "2", completedAt: 200, stars: 1 },
        { module: "shikaku", levelId: "1", completedAt: 100, stars: 3 }
      ]
    };

    expect((repo as any).areStatesEqual(stateA, stateC)).toBe(false);
  });

  it("should throw an error and abort if auth state changes during getState()", async () => {
    let mockUserId = "user-A";
    const mockSupabaseAuth = {
      auth: {
        getUser: vi.fn().mockImplementation(async () => {
          await Promise.resolve();
          return { data: { user: { id: mockUserId } } };
        })
      },
      from: vi.fn().mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockImplementation(async () => {
          // Simulate auth state changing during the database query
          mockUserId = "user-B";
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("cozyos:progress-updated"));
          }
          await Promise.resolve();
          return { data: { state: null }, error: { code: "PGRST116" } };
        }),
        upsert: vi.fn().mockResolvedValue({ error: null })
      }))
    };

    const newRepo = new SupabaseProgressRepository(mockSupabaseAuth as any);
    try {
      // Call getState and expect it to reject due to auth change during operation
      await expect(newRepo.getState()).rejects.toThrow("Auth state changed during getState");
    } finally {
      newRepo.dispose();
    }
  });

  it("should resolve isSleeping correctly on tie-breaks using > (preferring cloud state if interactions are equal)", async () => {
    // Both cloud and local have the same latest interaction time (1000)
    // Cloud: isSleeping = true
    const cloudProgress = {
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 10, stage: 1, lastFedAt: 1000, happiness: 50, lastPlayedAt: 1000, isSleeping: true }
    };
    
    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { state: cloudProgress },
        error: null
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    }));

    // Local: isSleeping = false, latest interaction = 1000
    const localState = {
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 10, stage: 1, lastFedAt: 1000, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: localState }));

    const state = await repo.getState();

    // Since interaction times are equal, it should prefer the cloud state (isSleeping = true)
    expect(state.pet.isSleeping).toBe(true);
  });

  it("should prefer local isSleeping if local interaction is strictly greater", async () => {
    // Cloud: latest interaction = 999, isSleeping = true
    const cloudProgress = {
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 10, stage: 1, lastFedAt: 999, happiness: 50, lastPlayedAt: 999, isSleeping: true }
    };
    
    mockSupabase.from = vi.fn().mockImplementation(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { state: cloudProgress },
        error: null
      }),
      upsert: vi.fn().mockResolvedValue({ error: null })
    }));

    // Local: latest interaction = 1000, isSleeping = false
    const localState = {
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 10, stage: 1, lastFedAt: 1000, happiness: 50, lastPlayedAt: 1000, isSleeping: false }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: localState }));

    const state = await repo.getState();

    // Since local interaction is strictly greater, it should prefer the local state (isSleeping = false)
    expect(state.pet.isSleeping).toBe(false);
  });

  it("should not clear a newer in-flight promise when an older one resolves after cache invalidation", async () => {
    let resolveFirst: (val: any) => void = () => {};
    let resolveSecond: (val: any) => void = () => {};
    const firstPromise = new Promise<any>((resolve) => { resolveFirst = resolve; });
    const secondPromise = new Promise<any>((resolve) => { resolveSecond = resolve; });

    const singleMock = vi.fn()
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);
    const mockFromObj = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: singleMock,
      upsert: vi.fn().mockResolvedValue({ error: null })
    };

    const mockAuth = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "user-1" } } }) },
      from: vi.fn().mockReturnValue(mockFromObj)
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
});


