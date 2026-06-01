import { describe, it, expect, vi } from "vitest";
import { ProgressService, HUNGER_COOLDOWN, HAPPINESS_COOLDOWN } from "./service";
import type { ProgressRepository } from "../repository/ProgressRepository";
import type { ProgressState } from "./types";

function makeState(overrides?: Partial<ProgressState>): ProgressState {
  return {
    completedLevels: [],
    foodConsumed: 0,
    pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false },
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
    playWithPet: vi.fn().mockResolvedValue(undefined),
    toggleSleep: vi.fn().mockResolvedValue(undefined),
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
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now() - 1000, happiness: 50, lastPlayedAt: 0, isSleeping: false } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.isPetHungry()).toBe(false);
    });

    it("returns true when fed exactly HUNGER_COOLDOWN ago", async () => {
      const state = makeState({
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN, happiness: 50, lastPlayedAt: 0, isSleeping: false },
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.isPetHungry()).toBe(true);
    });
  });

  describe("getHungryLevel", () => {
    it("returns 0 when fed just now", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now(), happiness: 50, lastPlayedAt: 0, isSleeping: false } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(0);
    });

    it("decays at normal rate when awake", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN * 3, happiness: 50, lastPlayedAt: 0, isSleeping: false } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(3);
    });

    it("decays at 2x slower rate when sleeping", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN * 4, happiness: 50, lastPlayedAt: 0, isSleeping: true } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(2); // 4 elapsed / 2 = 2
    });

    it("caps at 6 even when many cooldowns have elapsed", async () => {
      const state = makeState({
        pet: { xp: 0, stage: 1, lastFedAt: Date.now() - HUNGER_COOLDOWN * 100, happiness: 50, lastPlayedAt: 0, isSleeping: false },
      });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(6);
    });

    it("guards against clock skew (negative elapsed time)", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: Date.now() + 10000, happiness: 50, lastPlayedAt: 0, isSleeping: false } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHungryLevel()).toBe(0);
    });
  });

  describe("getHappiness", () => {
    it("decays at normal rate when awake", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 100, lastPlayedAt: Date.now() - HAPPINESS_COOLDOWN * 4, isSleeping: false } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHappiness()).toBe(80); // Decays 5% per interval: 100 - (4 * 5) = 80
    });

    it("decays at 4x slower rate when sleeping", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 100, lastPlayedAt: Date.now() - HAPPINESS_COOLDOWN * 8, isSleeping: true } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHappiness()).toBe(90); // 8 intervals -> 2 intervals of decay: 100 - (2 * 5) = 90
    });

    it("returns base happiness when lastPlayedAt is 0 (never played)", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHappiness()).toBe(50);
    });

    it("guards against clock skew (negative elapsed time)", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: Date.now() + 10000, isSleeping: false } });
      const service = new ProgressService(makeMockRepo(state));
      expect(await service.getHappiness()).toBe(50);
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
        pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false },
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
        pet: { xp: 0, stage: 1, lastFedAt: Date.now(), happiness: 50, lastPlayedAt: 0, isSleeping: false },
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
        pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false },
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
        pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false },
      });
      const repo = makeMockRepo(state);
      const spy = vi.spyOn(window, "dispatchEvent");
      const service = new ProgressService(repo);
      await service.feedPet();
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });

    it("adjusts lastPlayedAt when feeding a sleeping pet to prevent instant happiness drop", async () => {
      const now = 1700000000000;
      const dateSpy = vi.spyOn(Date, "now").mockReturnValue(now);
      const state = makeState({
        completedLevels: [{ module: "s", levelId: "1", completedAt: 1, stars: 3 }],
        foodConsumed: 0,
        pet: {
          xp: 0,
          stage: 1,
          lastFedAt: now - HUNGER_COOLDOWN * 2, // Hungry so it can be fed under sleep decay (divisor = COOLDOWN * 2)
          happiness: 100,
          lastPlayedAt: now - HAPPINESS_COOLDOWN * 8, // Happiness decays 100 - (8/4 * 5) = 90 under sleep decay
          isSleeping: true,
        },
      });

      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.feedPet();

      // Expected newElapsed = elapsed * (HAPPINESS_COOLDOWN / (HAPPINESS_COOLDOWN * 4)) = elapsed / 4 = HAPPINESS_COOLDOWN * 2
      const expectedLastPlayedAt = now - HAPPINESS_COOLDOWN * 2;
      expect(repo.feedPet).toHaveBeenCalledWith(expectedLastPlayedAt);
      dateSpy.mockRestore();
    });
  });

  describe("playWithPet", () => {
    it("does not allow playing when sleeping", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: true } });
      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.playWithPet();
      expect(repo.playWithPet).not.toHaveBeenCalled();
    });

    it("calculates decay and increments happiness up to 100", async () => {
      const state = makeState({ pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 70, lastPlayedAt: Date.now(), isSleeping: false } });
      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.playWithPet();
      expect(repo.playWithPet).toHaveBeenCalledWith(90); // 70 + 20 = 90
    });
  });

  describe("toggleSleep", () => {
    it("delegates to repository and dispatches update event", async () => {
      const repo = makeMockRepo(makeState());
      const spy = vi.spyOn(window, "dispatchEvent");
      const service = new ProgressService(repo);
      await service.toggleSleep();
      expect(repo.toggleSleep).toHaveBeenCalledOnce();
      expect(spy).toHaveBeenCalledOnce();
      spy.mockRestore();
    });

    it("adjusts timestamps to preserve hunger and happiness levels when transitioning to sleep", async () => {
      const now = 1700000000000;
      const dateSpy = vi.spyOn(Date, "now").mockReturnValue(now);
      const state = makeState({
        pet: {
          xp: 0,
          stage: 1,
          lastFedAt: now - HUNGER_COOLDOWN * 3, // Hunger level = 3
          happiness: 100,
          lastPlayedAt: now - HAPPINESS_COOLDOWN * 4, // Happiness = 100 - (4 * 5) = 80
          isSleeping: false,
        },
      });

      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.toggleSleep();

      // Divisors when sleep is true: hunger = COOLDOWN * 2, happiness = COOLDOWN * 4
      const expectedLastFedAt = now - 3 * (HUNGER_COOLDOWN * 2);
      const expectedLastPlayedAt = now - 4 * (HAPPINESS_COOLDOWN * 4);

      expect(repo.toggleSleep).toHaveBeenCalledWith(expectedLastFedAt, expectedLastPlayedAt);
      dateSpy.mockRestore();
    });

    it("adjusts timestamps to preserve hunger and happiness levels when transitioning to awake", async () => {
      const now = 1700000000000;
      const dateSpy = vi.spyOn(Date, "now").mockReturnValue(now);
      const state = makeState({
        pet: {
          xp: 0,
          stage: 1,
          lastFedAt: now - (HUNGER_COOLDOWN * 2) * 2, // Hunger level = 2
          happiness: 100,
          lastPlayedAt: now - (HAPPINESS_COOLDOWN * 4) * 3, // Happiness = 100 - (3 * 5) = 85
          isSleeping: true,
        },
      });

      const repo = makeMockRepo(state);
      const service = new ProgressService(repo);
      await service.toggleSleep();

      // Divisors when sleep is false: hunger = COOLDOWN, happiness = COOLDOWN
      const expectedLastFedAt = now - 2 * HUNGER_COOLDOWN;
      const expectedLastPlayedAt = now - 3 * HAPPINESS_COOLDOWN;

      expect(repo.toggleSleep).toHaveBeenCalledWith(expectedLastFedAt, expectedLastPlayedAt);
      dateSpy.mockRestore();
    });
  });

  describe("HUNGER_COOLDOWN", () => {
    it("is 10 minutes in milliseconds", () => {
      expect(HUNGER_COOLDOWN).toBe(10 * 60 * 1000);
    });
  });
});
