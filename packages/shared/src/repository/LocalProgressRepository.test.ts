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
    it("returns initial state when localStorage is empty", async () => {
      const state = await repo.getState();
      expect(state.completedLevels).toEqual([]);
      expect(state.foodConsumed).toBe(0);
      expect(state.pet.xp).toBe(0);
      expect(state.pet.stage).toBe(1);
      expect(state.pet.lastFedAt).toBe(0);
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
  });

  describe("saveState / getState round-trip", () => {
    it("persists and restores state", async () => {
      const saved = {
        completedLevels: [{ module: "shikaku", levelId: "easy-1", completedAt: 1000 }],
        foodConsumed: 1,
        pet: { xp: 1, stage: 1, lastFedAt: 9000 },
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
        pet: { xp: 9, stage: 1, lastFedAt: 0 },
      });
      await repo.feedPet();
      const state = await repo.getState();
      expect(state.pet.xp).toBe(10);
      expect(state.pet.stage).toBe(2);
    });
  });
});
