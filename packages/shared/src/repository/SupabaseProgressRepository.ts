import { SupabaseClient } from "@supabase/supabase-js";
import { LocalProgressRepository } from "./LocalProgressRepository";
import type { ProgressRepository } from "./ProgressRepository";
import type { ProgressState } from "../progress/types";
import { getEvolutionStage } from "../pet/evolution";

export class SupabaseProgressRepository implements ProgressRepository {
  private localRepo = new LocalProgressRepository();

  constructor(private supabase: SupabaseClient) {}

  private async getUserId(): Promise<string | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user?.id || null;
    } catch {
      return null;
    }
  }

  private mergeStates(local: ProgressState, cloud: ProgressState): ProgressState {
    const levelsMap = new Map<string, typeof local.completedLevels[0]>();
    
    const addLevel = (lvl: typeof local.completedLevels[0]) => {
      const key = `${lvl.module}:${lvl.levelId}`;
      const existing = levelsMap.get(key);
      if (!existing || lvl.stars > existing.stars) {
        levelsMap.set(key, lvl);
      }
    };
    
    local.completedLevels.forEach(addLevel);
    cloud.completedLevels.forEach(addLevel);

    // Sanitize cloud pet defaults in case it is a legacy save
    if (cloud.pet) {
      if (cloud.pet.happiness === undefined) cloud.pet.happiness = 50;
      if (cloud.pet.lastPlayedAt === undefined) cloud.pet.lastPlayedAt = Date.now();
      if (cloud.pet.isSleeping === undefined) cloud.pet.isSleeping = false;
    }

    const useLocalPet = local.pet.xp > cloud.pet.xp;
    const pet = useLocalPet ? { ...local.pet } : { ...cloud.pet };
    pet.stage = getEvolutionStage(pet.xp);
    const foodConsumed = Math.max(local.foodConsumed, cloud.foodConsumed);

    return {
      completedLevels: Array.from(levelsMap.values()),
      foodConsumed,
      pet,
    };
  }

  async getState(): Promise<ProgressState> {
    const userId = await this.getUserId();
    const localState = await this.localRepo.getState();

    if (!userId) {
      return localState;
    }

    try {
      const { data, error } = await this.supabase
        .from("user_progress")
        .select("state")
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        // First time cloud sync: push local state
        await this.supabase.from("user_progress").upsert({
          user_id: userId,
          state: localState,
        });
        return localState;
      }

      const cloudState = data.state as ProgressState;
      const mergedState = this.mergeStates(localState, cloudState);
      
      // Keep both stores updated with merged achievements
      await this.localRepo.saveState(mergedState);
      await this.supabase.from("user_progress").upsert({
        user_id: userId,
        state: mergedState,
      });

      return mergedState;
    } catch (err) {
      console.error("Supabase load error, using local fallback:", err);
      return localState;
    }
  }

  async saveState(state: ProgressState): Promise<void> {
    await this.localRepo.saveState(state);

    const userId = await this.getUserId();
    if (userId) {
      try {
        const { error } = await this.supabase
          .from("user_progress")
          .upsert({ user_id: userId, state });
        if (error) throw error;
      } catch (err) {
        console.error("Failed to sync state to Supabase:", err);
      }
    }
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    const changed = await this.localRepo.completeLevel(module, levelId);
    if (changed) {
      const newState = await this.localRepo.getState();
      await this.saveState(newState);
    }
    return changed;
  }

  async completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean> {
    const changed = await this.localRepo.completeLevelWithStars(module, levelId, stars);
    if (changed) {
      const newState = await this.localRepo.getState();
      await this.saveState(newState);
    }
    return changed;
  }

  async feedPet(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
    await this.localRepo.feedPet(lastFedAt, lastPlayedAt);
    const newState = await this.localRepo.getState();
    await this.saveState(newState);
  }

  async playWithPet(happiness: number): Promise<void> {
    await this.localRepo.playWithPet(happiness);
    const newState = await this.localRepo.getState();
    await this.saveState(newState);
  }

  async toggleSleep(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
    await this.localRepo.toggleSleep(lastFedAt, lastPlayedAt);
    const newState = await this.localRepo.getState();
    await this.saveState(newState);
  }
}
