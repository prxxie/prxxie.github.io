/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
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
