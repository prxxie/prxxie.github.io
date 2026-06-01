import { useState, useEffect, useCallback } from "react";
import { ProgressService, LocalProgressRepository } from "shared";
import type { ProgressState } from "shared";

const progressService = new ProgressService(new LocalProgressRepository());

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

  const refresh = useCallback(async () => {
    const [s, hungry, food, level] = await Promise.all([
      progressService.getState(),
      progressService.isPetHungry(),
      progressService.getFoodAvailable(),
      progressService.getHungryLevel(),
    ]);
    setState(s);
    setIsHungry(hungry);
    setFoodAvailable(food);
    setHungryLevel(level);
  }, []);

  useEffect(() => {
    void refresh();
    const handler = () => { void refresh(); };
    window.addEventListener("cozyos:progress-updated", handler);
    return () => window.removeEventListener("cozyos:progress-updated", handler);
  }, [refresh]);

  const feedPet = useCallback(async () => {
    await progressService.feedPet();
  }, []);

  return { state, isHungry, foodAvailable, hungryLevel, feedPet };
}
