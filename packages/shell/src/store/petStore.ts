import { create } from "zustand";
import type { PetStatus } from "../types";

export interface PetState {
  hunger: number;
  happiness: number;
  status: PetStatus;
  isSleeping: boolean;
  feed: () => void;
  play: () => void;
  toggleSleep: () => void;
  setStatus: (status: PetStatus) => void;
  tick: () => void;
}

export const usePetStore = create<PetState>()((set) => ({
  hunger: 50,
  happiness: 50,
  status: "idle",
  isSleeping: false,

  feed: () =>
    set((state) => {
      if (state.isSleeping) return state;
      return {
        ...state,
        hunger: Math.max(0, state.hunger - 20),
        status: "eating",
      };
    }),

  play: () =>
    set((state) => {
      if (state.isSleeping) return state;
      return {
        ...state,
        happiness: Math.min(100, state.happiness + 20),
        status: "playing",
      };
    }),

  toggleSleep: () =>
    set((state) => ({
      isSleeping: !state.isSleeping,
      status: !state.isSleeping ? "sleeping" : "idle",
    })),

  setStatus: (status: PetStatus) => set({ status }),

  tick: () =>
    set((state) => {
      const nextHunger = Math.min(
        100,
        state.hunger + (state.isSleeping ? 2 : 5)
      );
      const nextHappiness = Math.max(
        0,
        state.happiness - (state.isSleeping ? 1 : 5)
      );

      let nextStatus: PetStatus = state.status;
      if (state.status === "eating" || state.status === "playing") {
        nextStatus = "idle";
      }
      if (state.isSleeping) {
        nextStatus = "sleeping";
      }

      return {
        ...state,
        hunger: nextHunger,
        happiness: nextHappiness,
        status: nextStatus,
      };
    }),
}));
