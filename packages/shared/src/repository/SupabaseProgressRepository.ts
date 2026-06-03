/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { SupabaseClient } from "@supabase/supabase-js";
import { LocalProgressRepository } from "./LocalProgressRepository";
import type { ProgressRepository } from "./ProgressRepository";
import type { ProgressState } from "../progress/types";
import { getEvolutionStage } from "../pet/evolution";

export class SupabaseProgressRepository implements ProgressRepository {
  private localRepo = new LocalProgressRepository();
  private cachedUserId: string | null = null;
  private userIdInitialized = false;
  private authSubscription: { unsubscribe: () => void } | null = null;
  private saveQueue: Promise<void> = Promise.resolve();
  private activeGetState: Promise<ProgressState> | null = null;
  private userIdPromise: Promise<string | null> | null = null;

  constructor(private supabase: SupabaseClient) {
    if (this.supabase.auth && typeof this.supabase.auth.onAuthStateChange === "function") {
      const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
        this.cachedUserId = session?.user?.id || null;
        this.userIdInitialized = true;
        this.activeGetState = null;
        this.userIdPromise = null;
      });
      if (data && data.subscription) {
        this.authSubscription = data.subscription;
      } else if ((data as any)?.unsubscribe) {
        this.authSubscription = data as any;
      }
    }
  }

  dispose(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
      this.authSubscription = null;
    }
    this.localRepo.dispose();
  }

  private async getUserId(): Promise<string | null> {
    if (this.userIdInitialized) {
      return this.cachedUserId;
    }
    if (this.userIdPromise) {
      return this.userIdPromise;
    }
    this.userIdPromise = (async () => {
      try {
        const { data: { user } } = await this.supabase.auth.getUser();
        this.cachedUserId = user?.id || null;
        this.userIdInitialized = true;
        return this.cachedUserId;
      } catch {
        return null;
      } finally {
        this.userIdPromise = null;
      }
    })();
    return this.userIdPromise;
  }

  private sanitizeProgressState(state: any): ProgressState {
    try {
      if (!state || typeof state !== "object") {
        throw new Error("ProgressState is not an object");
      }

      if (!Array.isArray(state.completedLevels)) {
        throw new Error("completedLevels is not an array");
      }

      for (const level of state.completedLevels) {
        if (
          !level ||
          typeof level !== "object" ||
          typeof level.module !== "string" ||
          typeof level.levelId !== "string"
        ) {
          throw new Error("Invalid completed level schema");
        }
      }

      if (state.foodConsumed !== undefined && typeof state.foodConsumed !== "number") {
        throw new Error("foodConsumed is not a number");
      }

      if (state.pet !== undefined && (state.pet === null || typeof state.pet !== "object")) {
        throw new Error("pet is not an object");
      }

      const completedLevels = state.completedLevels.map((lvl: any) => ({
        module: lvl.module,
        levelId: lvl.levelId,
        completedAt: typeof lvl.completedAt === "number" ? lvl.completedAt : Date.now(),
        stars: typeof lvl.stars === "number" ? lvl.stars : 0,
      }));

      const foodConsumed = typeof state.foodConsumed === "number" ? state.foodConsumed : 0;

      const defaultPet = {
        xp: 0,
        stage: 1,
        lastFedAt: 0,
        happiness: 50,
        lastPlayedAt: Date.now(),
        isSleeping: false,
      };

      const pet = state.pet ? {
        xp: typeof state.pet.xp === "number" ? state.pet.xp : defaultPet.xp,
        stage: typeof state.pet.stage === "number" ? state.pet.stage : defaultPet.stage,
        lastFedAt: typeof state.pet.lastFedAt === "number" ? state.pet.lastFedAt : defaultPet.lastFedAt,
        happiness: typeof state.pet.happiness === "number" ? state.pet.happiness : defaultPet.happiness,
        lastPlayedAt: typeof state.pet.lastPlayedAt === "number" ? state.pet.lastPlayedAt : defaultPet.lastPlayedAt,
        isSleeping: typeof state.pet.isSleeping === "boolean" ? state.pet.isSleeping : defaultPet.isSleeping,
      } : defaultPet;

      return {
        completedLevels,
        foodConsumed,
        pet,
      };
    } catch (err) {
      console.error("Invalid progress state schema:", err);
      throw err;
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
    
    if (cloud && Array.isArray(cloud.completedLevels)) {
      cloud.completedLevels.forEach(addLevel);
    }

    const defaultPet = {
      xp: 0,
      stage: 1,
      lastFedAt: 0,
      happiness: 50,
      lastPlayedAt: Date.now(),
      isSleeping: false,
    };

    const cloudPet: typeof local.pet = cloud.pet ? {
      xp: typeof cloud.pet.xp === "number" ? cloud.pet.xp : (local.pet?.xp ?? defaultPet.xp),
      stage: typeof cloud.pet.stage === "number" ? cloud.pet.stage : (local.pet?.stage ?? defaultPet.stage),
      lastFedAt: typeof cloud.pet.lastFedAt === "number" ? cloud.pet.lastFedAt : (local.pet?.lastFedAt ?? defaultPet.lastFedAt),
      happiness: typeof cloud.pet.happiness === "number" ? cloud.pet.happiness : (local.pet?.happiness ?? defaultPet.happiness),
      lastPlayedAt: typeof cloud.pet.lastPlayedAt === "number" ? cloud.pet.lastPlayedAt : (local.pet?.lastPlayedAt ?? defaultPet.lastPlayedAt),
      isSleeping: typeof cloud.pet.isSleeping === "boolean" ? cloud.pet.isSleeping : (local.pet?.isSleeping ?? defaultPet.isSleeping),
    } : { ...(local.pet ?? defaultPet) };

    // Timestamp-based pet property merging
    const mergedXp = Math.max(local.pet?.xp ?? 0, cloudPet.xp);
    const lastFedAt = Math.max(local.pet?.lastFedAt ?? 0, cloudPet.lastFedAt);
    const lastPlayedAt = Math.max(local.pet?.lastPlayedAt ?? 0, cloudPet.lastPlayedAt);
    
    // Select happiness based on the latest play action
    const happiness = (local.pet?.lastPlayedAt ?? 0) >= cloudPet.lastPlayedAt ? (local.pet?.happiness ?? 50) : cloudPet.happiness;
    
    // Select sleeping status based on the latest overall interaction (play or feed)
    const localLatestInteraction = Math.max(local.pet?.lastPlayedAt ?? 0, local.pet?.lastFedAt ?? 0);
    const cloudLatestInteraction = Math.max(cloudPet.lastPlayedAt, cloudPet.lastFedAt);
    const isSleeping = localLatestInteraction >= cloudLatestInteraction ? (local.pet?.isSleeping ?? false) : cloudPet.isSleeping;

    const pet = {
      xp: mergedXp,
      stage: getEvolutionStage(mergedXp),
      lastFedAt,
      lastPlayedAt,
      happiness,
      isSleeping
    };

    const foodConsumed = Math.max(local.foodConsumed ?? 0, cloud.foodConsumed ?? 0);

    return {
      completedLevels: Array.from(levelsMap.values()),
      foodConsumed,
      pet,
    };
  }

  async getState(): Promise<ProgressState> {
    if (this.activeGetState !== null) {
      return this.activeGetState;
    }

    this.activeGetState = (async () => {
      try {
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

          if (error) {
            if (error.code === "PGRST116") {
              const { error: upsertError } = await this.supabase.from("user_progress").upsert({
                user_id: userId,
                state: localState,
              });
              if (upsertError) throw upsertError;
              return localState;
            } else {
              throw error;
            }
          }

          if (!data) {
            throw new Error("No data returned from user_progress query");
          }

          const cloudState = this.sanitizeProgressState(data.state);
          const mergedState = this.mergeStates(localState, cloudState);
          
          await this.localRepo.saveState(mergedState);
          const { error: upsertError } = await this.supabase.from("user_progress").upsert({
            user_id: userId,
            state: mergedState,
          });
          if (upsertError) throw upsertError;

          return mergedState;
        } catch (err) {
          console.error("Supabase load error, using local fallback:", err);
          return localState;
        }
      } finally {
        this.activeGetState = null;
      }
    })();

    return this.activeGetState;
  }

  async saveState(state: ProgressState, skipLocalWrite = false): Promise<void> {
    const previousQueueTail = this.saveQueue;

    const currentSaveOperation = async () => {
      try {
        await previousQueueTail;
      } catch {
        // Suppress errors from previous queued actions to allow the current save to execute
      }

      let finalState = state;
      const userId = await this.getUserId();

      if (!userId) {
        if (!skipLocalWrite) {
          await this.localRepo.saveState(state);
        }
        return;
      }

      try {
        const { data, error } = await this.supabase
          .from("user_progress")
          .select("state")
          .eq("user_id", userId)
          .single();

        if (error) {
          if (error.code !== "PGRST116") {
            throw error;
          }
        } else if (data?.state) {
          try {
            const cloudState = this.sanitizeProgressState(data.state);
            finalState = this.mergeStates(state, cloudState);
          } catch (valErr) {
            console.warn("Corrupt cloud state found during save. Overwriting with local state to repair:", valErr);
          }
        }

        const changed = JSON.stringify(state) !== JSON.stringify(finalState);
        if (changed || !skipLocalWrite) {
          await this.localRepo.saveState(finalState);
        }

        const { error: upsertError } = await this.supabase
          .from("user_progress")
          .upsert({ user_id: userId, state: finalState });
        if (upsertError) throw upsertError;
      } catch (err) {
        console.error("Failed to sync state to Supabase:", err);
        if (!skipLocalWrite) {
          try {
            await this.localRepo.saveState(state);
          } catch (localErr) {
            throw localErr instanceof Error ? localErr : new Error(String(localErr));
          }
        }
        throw err instanceof Error ? err : new Error(String(err));
      }
    };

    const savePromise = currentSaveOperation();
    this.saveQueue = savePromise.catch((err) => {
      console.error("Error in serialized save queue chain:", err);
    });

    return savePromise;
  }

  async completeLevel(module: string, levelId: string): Promise<boolean> {
    const changed = await this.localRepo.completeLevel(module, levelId);
    if (changed) {
      const newState = await this.localRepo.getState();
      await this.saveState(newState, true);
    }
    return changed;
  }

  async completeLevelWithStars(module: string, levelId: string, stars: number): Promise<boolean> {
    const changed = await this.localRepo.completeLevelWithStars(module, levelId, stars);
    if (changed) {
      const newState = await this.localRepo.getState();
      await this.saveState(newState, true);
    }
    return changed;
  }

  async feedPet(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
    await this.localRepo.feedPet(lastFedAt, lastPlayedAt);
    const newState = await this.localRepo.getState();
    await this.saveState(newState, true);
  }

  async playWithPet(happiness: number): Promise<void> {
    await this.localRepo.playWithPet(happiness);
    const newState = await this.localRepo.getState();
    await this.saveState(newState, true);
  }

  async toggleSleep(lastFedAt?: number, lastPlayedAt?: number): Promise<void> {
    await this.localRepo.toggleSleep(lastFedAt, lastPlayedAt);
    const newState = await this.localRepo.getState();
    await this.saveState(newState, true);
  }
}
