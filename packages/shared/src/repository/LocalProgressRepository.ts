import { getEvolutionStage } from "../pet/evolution";
import type { ProgressRepository } from "./ProgressRepository";
import type { ProgressState } from "../progress/types";

export const STORAGE_KEY = "cozyos.progress.v1";

interface StoredData {
  version: 1;
  state: ProgressState;
}

function initialState(): ProgressState {
  return {
    completedLevels: [],
    foodConsumed: 0,
    pet: {
      xp: 0,
      stage: 1,
      lastFedAt: 0,
      happiness: 50,
      lastPlayedAt: 0,
      isSleeping: false,
    },
  };
}

export class LocalProgressRepository implements ProgressRepository {
  async getState(): Promise<ProgressState> {
    await Promise.resolve();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialState();
      const data = JSON.parse(raw) as StoredData;
      if (data.version !== 1) return initialState();
      
      // Fill defaults for backward compatibility
      const state = data.state;
      if (state.pet.happiness === undefined) state.pet.happiness = 50;
      if (state.pet.lastPlayedAt === undefined) state.pet.lastPlayedAt = 0;
      if (state.pet.isSleeping === undefined) state.pet.isSleeping = false;
      
      return state;
    } catch {
      return initialState();
    }
  }

  async saveState(state: ProgressState): Promise<void> {
    await Promise.resolve();
    const data: StoredData = { version: 1, state };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      throw new Error(`Failed to save progress: ${String(err)}`);
    }
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    return this.completeLevelWithStars(module, levelId, 1);
  }

  async completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean> {
    const state = await this.getState();
    const existing = state.completedLevels.find(
      (l) => l.module === module && l.levelId === levelId
    );
    if (existing) {
      if (stars <= existing.stars) return false;
      await this.saveState({
        ...state,
        completedLevels: state.completedLevels.map((l) =>
          l.module === module && l.levelId === levelId
            ? { ...l, stars, completedAt: Date.now() }
            : l
        ),
      });
      return true;
    }
    await this.saveState({
      ...state,
      completedLevels: [
        ...state.completedLevels,
        { module, levelId, stars, completedAt: Date.now() },
      ],
    });
    return true;
  }

  async feedPet(): Promise<void> {
    const state = await this.getState();
    const newXp = state.pet.xp + 1;
    await this.saveState({
      ...state,
      foodConsumed: state.foodConsumed + 1,
      pet: {
        ...state.pet,
        xp: newXp,
        stage: getEvolutionStage(newXp),
        lastFedAt: Date.now(),
        isSleeping: false, // Auto-wakes up when fed
      },
    });
  }

  async playWithPet(happiness: number): Promise<void> {
    const state = await this.getState();
    await this.saveState({
      ...state,
      pet: {
        ...state.pet,
        happiness,
        lastPlayedAt: Date.now(),
      },
    });
  }

  async toggleSleep(): Promise<void> {
    const state = await this.getState();
    await this.saveState({
      ...state,
      pet: {
        ...state.pet,
        isSleeping: !state.pet.isSleeping,
      },
    });
  }
}
