import { describe, it, expect, vi } from "vitest";
import { ProgressService, HUNGER_COOLDOWN } from "./service";
import type { ProgressRepository } from "../repository/ProgressRepository";
import type { ProgressState } from "./types";

function makeState(overrides?: Partial<ProgressState>): ProgressState {
  return {
    completedLevels: [],
    foodConsumed: 0,
    pet: { xp: 0, stage: 1, lastFedAt: 0 },
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
  };
}

describe("ProgressService", () => {
  describe("getFoodAvailable", () => {
    it("returns sum of stars minus foodConsumed", async () => {
      const state = makeState({
        completedLevels: [
          { module: "shikaku", levelId: "a", completedAt: 1, stars: 1 },
          { module: "sokoban", levelId: "b", completedAt: 2, stars: 3 },
          { module: "shikaku", levelId: "c", completedAt: 3, stars: 2 },
        ],
        foodConsumed: 2,
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getFoodAvailable()).toBe(4); // 1+3+2 - 2 = 4
    });

    it("returns 0 when no levels completed", async () => {
      const service = new ProgressService(makeMockRepo(makeState()));
      expect(await service.getFoodAvailable()).toBe(0);
    });

    it("returns 0 when foodConsumed equals total stars", async () => {
      const state = makeState({
        completedLevels: [
          { module: "sokoban", levelId: "a", completedAt: 1, stars: 2 },
        ],
        foodConsumed: 2,
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getFoodAvailable()).toBe(0);
    });

    it("treats missing stars field as 1 (backward compat)", async () => {
      const state = makeState({
        completedLevels: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { module: "shikaku", levelId: "a", completedAt: 1 } as any,
        ],
        foodConsumed: 0,
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getFoodAvailable()).toBe(1);
    });
  });

  describe("isPetHungry", () => {
    it("returns true when lastFedAt is 0 (never fed)", async () => {
      const service = new ProgressService(makeMockRepo(makeState()));
      expect(await service.isPetHungry()).toBe(true);
    });

    it("returns false when fed less than HUNGER_COOLDOWN ago", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now() - 1000 } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.isPetHungry()).toBe(false);
    });

    it("returns true when fed exactly HUNGER_COOLDOWN ago", async () => {
      const state = makeState({
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN },
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.isPetHungry()).toBe(true);
    });
  });

  describe("getHungryLevel", () => {
    it("returns 0 when pet was just fed", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now() } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(0);
    });

    it("returns 1 when one cooldown has elapsed", async () => {
      const state = makeState({
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN },
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(1);
    });

    it("returns 3 when three cooldowns have elapsed", async () => {
      const state = makeState({
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN * 3 },
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(3);
    });

    it("caps at 6 even when many cooldowns have elapsed", async () => {
      const state = makeState({
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN * 100 },
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(6);
    });
  });

  describe("completeLevelWithStars", () => {
    it("delegates to repository and returns its result", async () => {
      const repo = makeMockRepo(makeState());
      const service = new ProgressService(repo);
      const result = await service.completeLevelWithStars("sokoban", "hack-01", 3);
      expect(result).toBe(true);
      expect(repo.completeLevelWithStars).toHaveBeenCalledWith("sokoban", "hack-01", 3);
    });

    it("dispatches cozyos:progress-updated when repo returns true", async () => {
      const spy = vi.spyOn(window, "dispatchEvent");
      const repo = makeMockRepo(makeState());
      const service = new ProgressService(repo);
      await service.completeLevelWithStars("sokoban", "hack-01", 3);
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });

    it("does NOT dispatch event when repo returns false (no improvement)", async () => {
      const repo = makeMockRepo(makeState());
      (repo.completeLevelWithStars as ReturnType<typeof vi.fn>).mockResolvedValue(false);
      const spy = vi.spyOn(window, "dispatchEvent");
      const service = new ProgressService(repo);
      await service.completeLevelWithStars("sokoban", "hack-01", 1);
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("completeLevel", () => {
    it("delegates to repository and returns its result", async () => {
      const repo = makeMockRepo(makeState());
      const service = new ProgressService(repo);
      const result = await service.completeLevel("shikaku", "easy-1");
      expect(result).toBe(true);
      expect(repo.completeLevel).toHaveBeenCalledWith("shikaku", "easy-1");
    });

    it("dispatches cozyos:progress-updated when first completion", async () => {
      const spy = vi.spyOn(window, "dispatchEvent");
      const repo = makeMockRepo(makeState());
      const service = new ProgressService(repo);
      await service.completeLevel("shikaku", "easy-1");
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });

    it("does NOT dispatch event when level already completed (repo returns false)", async () => {
      const repo = makeMockRepo(makeState());
      (repo.completeLevel as ReturnType<typeof vi.fn>).mockResolvedValue(false);
      const spy = vi.spyOn(window, "dispatchEvent");
      const service = new ProgressService(repo);
      await service.completeLevel("shikaku", "easy-1");
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe("feedPet", () => {
    it("calls repo.feedPet when pet is hungry and food is available", async () => {
      const state = makeState({
        completedLevels: [{ module: "s", levelId: "1", completedAt: 1, stars: 1 }],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0 },
      });
      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(repo.feedPet).toHaveBeenCalledOnce();
    });

    it("does NOT call repo.feedPet when pet is not hungry", async () => {
      const state = makeState({
        completedLevels: [{ module: "s", levelId: "1", completedAt: 1, stars: 1 }],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() },
      });
      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(repo.feedPet).not.toHaveBeenCalled();
    });

    it("does NOT call repo.feedPet when food is 0", async () => {
      const state = makeState({
        completedLevels: [],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0 },
      });
      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(repo.feedPet).not.toHaveBeenCalled();
    });

    it("dispatches cozyos:progress-updated when feed succeeds", async () => {
      const state = makeState({
        completedLevels: [{ module: "s", levelId: "1", completedAt: 1, stars: 1 }],
        foodConsumed: 0,
        pet: { xp: 0, stage: 1, lastFedAt: 0 },
      });
      const repo = makeMockRepo(state);
      const spy = vi.spyOn(window, "dispatchEvent");
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });
  });

  describe("HUNGER_COOLDOWN", () => {
    it("is 10 minutes in milliseconds", () => {
      expect(HUNGER_COOLDOWN).toBe(10 * 60 * 1000);
    });
  });
});
