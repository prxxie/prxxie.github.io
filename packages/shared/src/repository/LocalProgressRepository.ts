import { getEvolutionStage } from "../pet/evolution";
import type { ProgressRepository } from "./ProgressRepository";
import type { ProgressState } from "../progress/types";

const STORAGE_KEY = "cozyos.progress.v1";

interface StoredData {
  version: 1;
  state: ProgressState;
}

function initialState(): ProgressState {
  return {
    completedLevels: [],
    foodConsumed: 0,
    pet: { xp: 0, stage: 1, lastFedAt: 0 },
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
      return data.state;
    } catch {
      return initialState();
    }
  }

  async saveState(state: ProgressState): Promise<void> {
    await Promise.resolve();
    const data: StoredData = { version: 1, state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    const state = await this.getState();
    const alreadyDone = state.completedLevels.some(
      (l) => l.module === module && l.levelId === levelId
    );
    if (alreadyDone) return false;
    await this.saveState({
      ...state,
      completedLevels: [
        ...state.completedLevels,
        { module, levelId, completedAt: Date.now() },
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
        xp: newXp,
        stage: getEvolutionStage(newXp),
        lastFedAt: Date.now(),
      },
    });
  }
}
