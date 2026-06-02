import { useState, useEffect, useCallback } from "react";
import { ProgressService, LocalProgressRepository, SupabaseProgressRepository } from "shared";
import type { ProgressState } from "shared";
import { supabase, isSupabaseConfigured } from "../utils/supabase";

const repo = isSupabaseConfigured && supabase
  ? new SupabaseProgressRepository(supabase)
  : new LocalProgressRepository();

const progressService = new ProgressService(repo);

const EMPTY_STATE: ProgressState = {
  completedLevels: [],
  foodConsumed: 0,
  pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false },
};

export function useProgressService() {
  const [state, setState] = useState<ProgressState>(EMPTY_STATE);
  const [isHungry, setIsHungry] = useState(false);
  const [foodAvailable, setFoodAvailable] = useState(0);
  const [hungryLevel, setHungryLevel] = useState(0);
  const [happiness, setHappiness] = useState(50);

  const refresh = useCallback(async () => {
    const [s, hungry, food, level, happy] = await Promise.all([
      progressService.getState(),
      progressService.isPetHungry(),
      progressService.getFoodAvailable(),
      progressService.getHungryLevel(),
      progressService.getHappiness(),
    ]);
    setState(s);
    setIsHungry(hungry);
    setFoodAvailable(food);
    setHungryLevel(level);
    setHappiness(happy);
  }, []);

  useEffect(() => {
    void refresh();
    const handler = () => { void refresh(); };
    window.addEventListener("cozyos:progress-updated", handler);

    let subscription: { unsubscribe: () => void } | undefined;
    if (supabase) {
      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(() => {
        void refresh();
      });
      subscription = sub;
    }

    return () => {
      window.removeEventListener("cozyos:progress-updated", handler);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [refresh]);

  const feedPet = useCallback(async () => {
    await progressService.feedPet();
  }, []);

  const playWithPet = useCallback(async () => {
    await progressService.playWithPet();
  }, []);

  const toggleSleep = useCallback(async () => {
    await progressService.toggleSleep();
  }, []);

  return {
    state,
    isHungry,
    foodAvailable,
    hungryLevel,
    happiness,
    isSleeping: state.pet.isSleeping,
    feedPet,
    playWithPet,
    toggleSleep,
  };
}
