import type { ProgressRepository } from "../repository/ProgressRepository";
import type { ProgressState } from "./types";

export const HUNGER_COOLDOWN = 10 * 60 * 1000;

export class ProgressService {
  constructor(private readonly repo: ProgressRepository) {}

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
    const isHungry = Date.now() - state.pet.lastFedAt >= HUNGER_COOLDOWN;
    const foodAvailable = await this.getFoodAvailable();
    if (!isHungry || foodAvailable <= 0) return;
    await this.repo.feedPet();
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
    const state = await this.repo.getState();
    return Date.now() - state.pet.lastFedAt >= HUNGER_COOLDOWN;
  }

  async getHungryLevel(): Promise<number> {
    const state = await this.repo.getState();
    const elapsed = Date.now() - state.pet.lastFedAt;
    return Math.min(6, Math.floor(elapsed / HUNGER_COOLDOWN));
  }

  async getPetStage(): Promise<number> {
    const state = await this.repo.getState();
    return state.pet.stage;
  }
}
