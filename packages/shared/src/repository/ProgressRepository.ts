import type { ProgressState } from "../progress/types";

export interface ProgressRepository {
  getState(): Promise<ProgressState>;
  completeLevel(module: string, levelId: string): Promise<boolean>;
  completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean>;
  feedPet(lastPlayedAt?: number): Promise<void>;
  playWithPet(happiness: number): Promise<void>;
  toggleSleep(lastFedAt?: number, lastPlayedAt?: number): Promise<void>;
  saveState(state: ProgressState): Promise<void>;
}
