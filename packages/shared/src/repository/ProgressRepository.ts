import type { ProgressState } from "../progress/types";

export interface ProgressRepository {
  getState(): Promise<ProgressState>;
  completeLevel(module: string, levelId: string): Promise<boolean>;
  feedPet(): Promise<void>;
  saveState(state: ProgressState): Promise<void>;
}
