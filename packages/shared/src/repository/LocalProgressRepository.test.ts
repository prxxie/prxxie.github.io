import { describe, it, expect, beforeEach, vi } from "vitest";
import { LocalProgressRepository, STORAGE_KEY } from "./LocalProgressRepository";

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
      expect(state.pet.lastPlayedAt).toBeGreaterThan(0);
      expect(state.pet.isSleeping).toBe(false);
    });

    it("returns initial state when localStorage contains malformed JSON", async () => {
      localStorage.setItem(STORAGE_KEY, "not-json{{{");
      const state = await repo.getState();
      expect(state.completedLevels).toEqual([]);
    });

    it("returns initial state when version field is missing", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: {} }));
      const state = await repo.getState();
      expect(state.completedLevels).toEqual([]);
    });

    it("returns initial state when version is wrong", async () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 2, state: {} }));
      const state = await repo.getState();
      expect(state.completedLevels).toEqual([]);
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
      expect(state.pet.lastPlayedAt).toBeGreaterThan(0);
      expect(state.pet.isSleeping).toBe(false);
    });
  });

  describe("saveState / getState round-trip", () => {
    it("persists and restores state", async () => {
      const saved = {
        completedLevels: [{ module: "shikaku", levelId: "easy-1", completedAt: 1000, stars: 1 }],
        foodConsumed: 1,
        pet: { xp: 1, stage: 1, lastFedAt: 9000, happiness: 80, lastPlayedAt: 12345, isSleeping: true },
      };
      await repo.saveState(saved);
      const loaded = await repo.getState();
      expect(loaded).toEqual(saved);
    });
  });

  describe("completeLevel", () => {
    it("returns true and saves on first completion", async () => {
      const result = await repo.completeLevel("shikaku", "easy-1");
      expect(result).toBe(true);
      const state = await repo.getState();
      expect(state.completedLevels).toHaveLength(1);
      expect(state.completedLevels[0].module).toBe("shikaku");
      expect(state.completedLevels[0].levelId).toBe("easy-1");
    });

    it("returns false and does not duplicate on second call", async () => {
      await repo.completeLevel("shikaku", "easy-1");
      const result = await repo.completeLevel("shikaku", "easy-1");
      expect(result).toBe(false);
      const state = await repo.getState();
      expect(state.completedLevels).toHaveLength(1);
    });

    it("treats same levelId in different modules as distinct", async () => {
      await repo.completeLevel("shikaku", "level-1");
      const result = await repo.completeLevel("sokoban", "level-1");
      expect(result).toBe(true);
      const state = await repo.getState();
      expect(state.completedLevels).toHaveLength(2);
    });
  });

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

  describe("feedPet", () => {
    it("increments xp by 1 and foodConsumed by 1", async () => {
      await repo.feedPet();
      const state = await repo.getState();
      expect(state.pet.xp).toBe(1);
      expect(state.foodConsumed).toBe(1);
    });

    it("sets lastFedAt to a recent timestamp", async () => {
      const before = Date.now();
      await repo.feedPet();
      const state = await repo.getState();
      expect(state.pet.lastFedAt).toBeGreaterThanOrEqual(before);
      expect(state.pet.lastFedAt).toBeLessThanOrEqual(Date.now());
    });

    it("advances stage when xp crosses threshold (9 → 10 = stage 2)", async () => {
      await repo.saveState({
        completedLevels: [],
        foodConsumed: 9,
        pet: { xp: 9, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false },
      });
      await repo.feedPet();
      const state = await repo.getState();
      expect(state.pet.xp).toBe(10);
      expect(state.pet.stage).toBe(2);
    });

    it("auto-wakes the pet when it is sleeping", async () => {
      await repo.saveState({
        completedLevels: [],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: true },
      });
      await repo.feedPet();
      const state = await repo.getState();
      expect(state.pet.isSleeping).toBe(false);
    });

    it("saves a specific lastFedAt timestamp when provided", async () => {
      const customTime = 123456789;
      await repo.feedPet(customTime);
      const state = await repo.getState();
      expect(state.pet.lastFedAt).toBe(customTime);
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

  describe("caching behavior", () => {
    it("caches the state and avoids repeated localStorage reads", async () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
      
      // First read: reads from localStorage
      const state1 = await repo.getState();
      expect(getItemSpy).toHaveBeenCalledTimes(1);

      // Second read: should use cache, not call localStorage again
      const state2 = await repo.getState();
      expect(getItemSpy).toHaveBeenCalledTimes(1);
      expect(state2).toBe(state1);
      
      getItemSpy.mockRestore();
    });

    it("updates cache on saveState and subsequent getState avoids localStorage read", async () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
      const saved = {
        completedLevels: [],
        foodConsumed: 5,
        pet: { xp: 5, stage: 1, lastFedAt: 100, happiness: 50, lastPlayedAt: 100, isSleeping: false },
      };

      await repo.saveState(saved);
      
      // subsequent getState should return the cached value directly without reading localStorage
      const loaded = await repo.getState();
      expect(loaded).toEqual(saved);
      expect(getItemSpy).not.toHaveBeenCalled();

      getItemSpy.mockRestore();
    });

    it("clears cachedState on storage event for STORAGE_KEY, and stops listening after dispose", async () => {
      const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
      
      // Load initial state to cache it
      await repo.getState();
      expect(getItemSpy).toHaveBeenCalledTimes(1);

      // Trigger storage event with a different key
      window.dispatchEvent(new StorageEvent("storage", { key: "some-other-key" }));
      await repo.getState();
      expect(getItemSpy).toHaveBeenCalledTimes(1); // Still cached

      // Trigger storage event with STORAGE_KEY
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
      await repo.getState();
      expect(getItemSpy).toHaveBeenCalledTimes(2); // Read again because cache was cleared

      // Call dispose
      repo.dispose();

      // Trigger storage event with STORAGE_KEY again
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
      await repo.getState();
      expect(getItemSpy).toHaveBeenCalledTimes(2); // Still 2, meaning it was not cleared

      getItemSpy.mockRestore();
    });
  });
});
