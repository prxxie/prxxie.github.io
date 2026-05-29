import { describe, it, expect, beforeEach } from "vitest";
import { useUiStore } from "./uiStore";

describe("Zustand useUiStore", () => {
  beforeEach(() => {
    useUiStore.setState({ isMenuOpen: false });
  });

  it("has initial isMenuOpen state as false", () => {
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it("setMenuOpen updates the state correctly", () => {
    useUiStore.getState().setMenuOpen(true);
    expect(useUiStore.getState().isMenuOpen).toBe(true);

    useUiStore.getState().setMenuOpen(false);
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });

  it("toggleMenu toggles the state correctly", () => {
    useUiStore.getState().toggleMenu();
    expect(useUiStore.getState().isMenuOpen).toBe(true);

    useUiStore.getState().toggleMenu();
    expect(useUiStore.getState().isMenuOpen).toBe(false);
  });
});
