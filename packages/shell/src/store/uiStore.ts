import { create } from "zustand";

export interface UiState {
  isMenuOpen: boolean;
  setMenuOpen: (isOpen: boolean) => void;
  toggleMenu: () => void;
}

export const useUiStore = create<UiState>()((set) => ({
  isMenuOpen: false,
  setMenuOpen: (isOpen: boolean) => set({ isMenuOpen: isOpen }),
  toggleMenu: () =>
    set((state) => ({ isMenuOpen: !state.isMenuOpen })),
}));
