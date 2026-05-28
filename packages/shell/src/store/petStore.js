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
    const nextHunger = Math.min(100, state.hunger + (state.isSleeping ? 2 : 5));
    const nextHappiness = Math.max(0, state.happiness - (state.isSleeping ? 1 : 5));
    
    let nextStatus = state.status;
    if (state.status === 'eating' || state.status === 'playing') {
      nextStatus = 'idle';
    }
    if (state.isSleeping) {
      nextStatus = 'sleeping';
    }

    return {
      hunger: nextHunger,
      happiness: nextHappiness,
      status: nextStatus
    };
  })
}));
