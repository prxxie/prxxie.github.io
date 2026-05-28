import { create } from 'zustand';

export const usePetStore = create((set) => ({
  hunger: 50,
  happiness: 50,
  status: 'idle', // 'idle' | 'eating' | 'playing' | 'sleeping'
  isSleeping: false,

  feed: () => set((state) => {
    if (state.isSleeping) return {};
    return {
      hunger: Math.max(0, state.hunger - 20),
      status: 'eating'
    };
  }),

  play: () => set((state) => {
    if (state.isSleeping) return {};
    return {
      happiness: Math.min(100, state.happiness + 20),
      status: 'playing'
    };
  }),

  toggleSleep: () => set((state) => ({
    isSleeping: !state.isSleeping,
    status: !state.isSleeping ? 'sleeping' : 'idle'
  })),

  setStatus: (status) => set({ status }),

  tick: () => set((state) => {
    if (state.isSleeping) {
      return {
        hunger: Math.min(100, state.hunger + 2),
        happiness: Math.max(0, state.happiness - 1)
      };
    }
    return {
      hunger: Math.min(100, state.hunger + 5),
      happiness: Math.max(0, state.happiness - 5),
      status: state.hunger >= 90 || state.happiness <= 10 ? 'idle' : state.status
    };
  })
}));
