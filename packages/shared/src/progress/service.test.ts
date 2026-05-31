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
    feedPet: vi.fn().mockResolvedValue(undefined),
  };
}

describe("ProgressService", () => {
  describe("getFoodAvailable", () => {
    it("returns completedLevels.length - foodConsumed", async () => {
      const state = makeState({
        completedLevels: [
          { module: "shikaku", levelId: "a", completedAt: 1 },
          { module: "sokoban", levelId: "b", completedAt: 2 },
          { module: "shikaku", levelId: "c", completedAt: 3 },
        ],
        foodConsumed: 1,
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getFoodAvailable()).toBe(2);
    });

    it("returns 0 when no levels completed", async () => {
      const service = new ProgressService(makeMockRepo(makeState()));
      expect(await service.getFoodAvailable()).toBe(0);
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

  describe("completeLevel", () => {
    it("delegates to repository and returns its result", async () => {
      const repo = makeMockRepo(makeState());
      const service = new ProgressService(repo);
      const result = await service.completeLevel("shikaku", "easy-1");
      expect(result).toBe(true);
      expect(repo.completeLevel).toHaveBeenCalledWith("shikaku", "easy-1");
    });
  });

  describe("feedPet", () => {
    it("calls repo.feedPet when pet is hungry and food is available", async () => {
      const state = makeState({
        completedLevels: [{ module: "s", levelId: "1", completedAt: 1 }],
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
        completedLevels: [{ module: "s", levelId: "1", completedAt: 1 }],
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
  });

  describe("HUNGER_COOLDOWN", () => {
    it("is 4 hours in milliseconds", () => {
      expect(HUNGER_COOLDOWN).toBe(4 * 60 * 60 * 1000);
    });
  });
});
