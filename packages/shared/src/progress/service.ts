import type { ProgressRepository } from "../repository/ProgressRepository";
import type { ProgressState } from "./types";

export const HUNGER_COOLDOWN = 10 * 60 * 1000;
export const HAPPINESS_COOLDOWN = 10 * 60 * 1000;

export class ProgressService {
  constructor(private readonly repo: ProgressRepository) {}

  dispose(): void {
    this.repo.dispose?.();
  }

  async getState(): Promise<ProgressState> {
    return this.repo.getState();
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    const result = await this.repo.completeLevel(module, levelId);
    if (result && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
    return result;
  }

  async completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean> {
    const result = await this.repo.completeLevelWithStars(module, levelId, stars);
    if (result && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
    return result;
  }

  async feedPet(): Promise<void> {
    const state = await this.repo.getState();
    const isHungry = await this.isPetHungry();
    const foodAvailable = await this.getFoodAvailable();
    if (!isHungry || foodAvailable <= 0) return;

    const divisor = state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
    const currentLastFedAt = state.pet.lastFedAt === 0 ? Date.now() - 5 * divisor : state.pet.lastFedAt;
    const nextLastFed = Math.min(Date.now(), currentLastFedAt + divisor);

    let nextLastPlayedAt: number | undefined;
    if (state.pet.isSleeping && state.pet.lastPlayedAt !== 0) {
      const elapsed = Math.max(0, Date.now() - state.pet.lastPlayedAt);
      const oldHappinessDivisor = HAPPINESS_COOLDOWN * 4;
      const newElapsed = elapsed * (HAPPINESS_COOLDOWN / oldHappinessDivisor);
      nextLastPlayedAt = Date.now() - newElapsed;
    }

    await this.repo.feedPet(nextLastFed, nextLastPlayedAt);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
  }

  async playWithPet(): Promise<void> {
    const state = await this.repo.getState();
    if (state.pet.isSleeping) return; // Can't play if asleep!
    const currentHappiness = await this.getHappiness();
    const newHappiness = Math.min(100, currentHappiness + 20);
    await this.repo.playWithPet(newHappiness);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
  }

  async toggleSleep(): Promise<void> {
    const state = await this.repo.getState();
    
    const oldHungerDivisor = state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
    const newHungerDivisor = !state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
    const elapsedHunger = Math.max(0, Date.now() - state.pet.lastFedAt);
    const newElapsedHunger = elapsedHunger * (newHungerDivisor / oldHungerDivisor);
    const lastFedAt = state.pet.lastFedAt !== 0 ? Date.now() - newElapsedHunger : 0;

    const oldHappinessDivisor = state.pet.isSleeping ? HAPPINESS_COOLDOWN * 4 : HAPPINESS_COOLDOWN;
    const newHappinessDivisor = !state.pet.isSleeping ? HAPPINESS_COOLDOWN * 4 : HAPPINESS_COOLDOWN;
    const elapsedHappiness = Math.max(0, Date.now() - state.pet.lastPlayedAt);
    const newElapsedHappiness = elapsedHappiness * (newHappinessDivisor / oldHappinessDivisor);
    const lastPlayedAt = state.pet.lastPlayedAt !== 0 ? Date.now() - newElapsedHappiness : 0;

    await this.repo.toggleSleep(lastFedAt, lastPlayedAt);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
  }

  async getFoodAvailable(): Promise<number> {
    const state = await this.repo.getState();
    const totalStars = state.completedLevels.reduce(
      (sum, l) => sum + (l.stars ?? 1),
      0
    );
    return Math.max(0, totalStars - state.foodConsumed);
  }

  async isPetHungry(): Promise<boolean> {
    const level = await this.getHungryLevel();
    return level >= 1;
  }

  async getHungryLevel(): Promise<number> {
    const state = await this.repo.getState();
    if (state.pet.lastFedAt === 0) return 5; // Maximum hunger if never fed (capped at 5)
    const elapsed = Math.max(0, Date.now() - state.pet.lastFedAt);
    const divisor = state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
    return Math.min(5, Math.floor(elapsed / divisor));
  }

  async getHappiness(): Promise<number> {
    const state = await this.repo.getState();
    if (state.pet.lastPlayedAt === 0) return state.pet.happiness;
    const elapsed = Math.max(0, Date.now() - state.pet.lastPlayedAt);
    const divisor = state.pet.isSleeping ? HAPPINESS_COOLDOWN * 4 : HAPPINESS_COOLDOWN;
    const decay = Math.floor(elapsed / divisor) * 5;
    return Math.max(0, state.pet.happiness - decay);
  }

  async getPetStage(): Promise<number> {
    const state = await this.repo.getState();
    return state.pet.stage;
  }
}
