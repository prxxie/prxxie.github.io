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
      lastPlayedAt: Date.now(),
      isSleeping: false,
    },
  };
}

export class LocalProgressRepository implements ProgressRepository {
  private cachedState: ProgressState | null = null;
  private storageListener: ((event: StorageEvent) => void) | null = null;
  private progressUpdatedListener: (() => void) | null = null;
  private activeGetState: Promise<ProgressState> | null = null;

  constructor() {
    if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
      this.storageListener = (event) => {
        if (event.key === STORAGE_KEY) {
          this.cachedState = null;
          this.activeGetState = null;
        }
      };
      window.addEventListener("storage", this.storageListener);

      this.progressUpdatedListener = () => {
        this.cachedState = null;
        this.activeGetState = null;
      };
      window.addEventListener("cozyos:progress-updated", this.progressUpdatedListener);
    }
  }

  dispose(): void {
    if (typeof window !== "undefined" && typeof window.removeEventListener === "function") {
      if (this.storageListener) {
        window.removeEventListener("storage", this.storageListener);
        this.storageListener = null;
      }
      if (this.progressUpdatedListener) {
        window.removeEventListener("cozyos:progress-updated", this.progressUpdatedListener);
        this.progressUpdatedListener = null;
      }
    }
  }

  async getState(): Promise<ProgressState> {
    if (this.cachedState !== null) {
      return this.cachedState;
    }
    if (this.activeGetState !== null) {
      return this.activeGetState;
    }

    this.activeGetState = (async () => {
      try {
        await Promise.resolve();
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          this.cachedState = initialState();
          return this.cachedState;
        }
        const data = JSON.parse(raw) as StoredData;
        if (data.version !== 1) {
          this.cachedState = initialState();
          return this.cachedState;
        }
        
        // Fill defaults for backward compatibility
        const state = data.state;
        if (state.pet.happiness === undefined) state.pet.happiness = 50;
        if (state.pet.lastPlayedAt === undefined) state.pet.lastPlayedAt = Date.now();
        if (state.pet.isSleeping === undefined) state.pet.isSleeping = false;
        // Always recompute stage from XP — guards against stale stored stage
        state.pet.stage = getEvolutionStage(state.pet.xp);
        
        this.cachedState = state;
        return this.cachedState;
      } catch {
        this.cachedState = initialState();
        return this.cachedState;
      } finally {
        this.activeGetState = null;
      }
    })();

    return this.activeGetState;
  }

  async saveState(state: ProgressState): Promise<void> {
    await Promise.resolve();
    const data: StoredData = { version: 1, state };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.cachedState = state;
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

  async feedPet(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
    const state = await this.getState();
    const newXp = state.pet.xp + 1;
    await this.saveState({
      ...state,
      foodConsumed: state.foodConsumed + 1,
      pet: {
        ...state.pet,
        xp: newXp,
        stage: getEvolutionStage(newXp),
        lastFedAt: lastFedAt !== undefined ? lastFedAt : Date.now(),
        isSleeping: false, // Auto-wakes up when fed
        lastPlayedAt: lastPlayedAt !== undefined ? lastPlayedAt : state.pet.lastPlayedAt,
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

  async toggleSleep(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
    const state = await this.getState();
    await this.saveState({
      ...state,
      pet: {
        ...state.pet,
        isSleeping: !state.pet.isSleeping,
        lastFedAt: lastFedAt !== undefined ? lastFedAt : state.pet.lastFedAt,
        lastPlayedAt: lastPlayedAt !== undefined ? lastPlayedAt : state.pet.lastPlayedAt,
      },
    });
  }
}
