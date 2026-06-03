import { useState, useEffect, useCallback, createContext, useContext, useMemo, ReactNode } from "react";
import { ProgressService, LocalProgressRepository, SupabaseProgressRepository } from "shared";
import type { ProgressState } from "shared";
import { supabase, isSupabaseConfigured } from "../utils/supabase";

export interface ProgressServiceContextType {
  state: ProgressState;
  isHungry: boolean;
  foodAvailable: number;
  hungryLevel: number;
  happiness: number;
  isSleeping: boolean;
  feedPet: () => Promise<void>;
  playWithPet: () => Promise<void>;
  toggleSleep: () => Promise<void>;
}

export const ProgressServiceContext = createContext<ProgressServiceContextType | null>(null);

const EMPTY_STATE: ProgressState = {
  completedLevels: [],
  foodConsumed: 0,
  pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false },
};

export interface ProgressServiceProviderProps {
  children: ReactNode;
}

export function ProgressServiceProvider({ children }: ProgressServiceProviderProps) {
  const [progressService] = useState(() => {
    const repo = isSupabaseConfigured && supabase
      ? new SupabaseProgressRepository(supabase)
      : new LocalProgressRepository();
    return new ProgressService(repo);
  });

  useEffect(() => {
    return () => {
      progressService.dispose();
    };
  }, [progressService]);

  const [state, setState] = useState<ProgressState>(EMPTY_STATE);
  const [isHungry, setIsHungry] = useState(false);
  const [foodAvailable, setFoodAvailable] = useState(0);
  const [hungryLevel, setHungryLevel] = useState(0);
  const [happiness, setHappiness] = useState(50);

  const refresh = useCallback(async () => {
    try {
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
    } catch (err) {
      console.error("Failed to refresh progress service state:", err);
    }
  }, [progressService]);

  useEffect(() => {
    void refresh();
    const handler = () => { void refresh(); };
    window.addEventListener("cozyos:progress-updated", handler);

    return () => {
      window.removeEventListener("cozyos:progress-updated", handler);
    };
  }, [refresh]);

  const feedPet = useCallback(async () => {
    await progressService.feedPet();
  }, [progressService]);

  const playWithPet = useCallback(async () => {
    await progressService.playWithPet();
  }, [progressService]);

  const toggleSleep = useCallback(async () => {
    await progressService.toggleSleep();
  }, [progressService]);

  const contextValue = useMemo<ProgressServiceContextType>(() => ({
    state,
    isHungry,
    foodAvailable,
    hungryLevel,
    happiness,
    isSleeping: state.pet.isSleeping,
    feedPet,
    playWithPet,
    toggleSleep,
  }), [state, isHungry, foodAvailable, hungryLevel, happiness, feedPet, playWithPet, toggleSleep]);

  return (
    <ProgressServiceContext.Provider value={contextValue}>
      {children}
    </ProgressServiceContext.Provider>
  );
}

export function useProgressService() {
  const context = useContext(ProgressServiceContext);
  if (!context) {
    throw new Error("useProgressService must be used within a ProgressServiceProvider");
  }
  return context;
}
