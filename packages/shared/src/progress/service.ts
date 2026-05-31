import type { ProgressRepository } from "../repository/ProgressRepository";
import type { ProgressState } from "./types";

export const HUNGER_COOLDOWN = 4 * 60 * 60 * 1000;

export class ProgressService {
  constructor(private readonly repo: ProgressRepository) {}

  async getState(): Promise<ProgressState> {
    return this.repo.getState();
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    const result = await this.repo.completeLevel(module, levelId);
    window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    return result;
  }

  async feedPet(): Promise<void> {
    const [hungry, food] = await Promise.all([
      this.isPetHungry(),
      this.getFoodAvailable(),
    ]);
    if (!hungry || food <= 0) return;
    await this.repo.feedPet();
    window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
  }

  async getFoodAvailable(): Promise<number> {
    const state = await this.repo.getState();
    return state.completedLevels.length - state.foodConsumed;
  }

  async isPetHungry(): Promise<boolean> {
    const state = await this.repo.getState();
    return Date.now() - state.pet.lastFedAt >= HUNGER_COOLDOWN;
  }

  async getPetStage(): Promise<number> {
    const state = await this.repo.getState();
    return state.pet.stage;
  }
}
