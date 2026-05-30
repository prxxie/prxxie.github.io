import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useHashRouter } from "./useHashRouter";

describe("useHashRouter", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  afterEach(() => {
    window.location.hash = "";
  });

  it("should return 'home' as default tab if hash is empty", () => {
    const { result } = renderHook(() => useHashRouter());
    expect(result.current.currentTab).toBe("home");
  });

  it("should update tab when window hash changes", () => {
    const { result } = renderHook(() => useHashRouter());
    act(() => {
      window.location.hash = "#/about";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current.currentTab).toBe("about");
  });

  it("should navigate to a tab and update hash location", () => {
    const { result } = renderHook(() => useHashRouter());
    act(() => {
      result.current.navigate("shikaku");
    });
    expect(window.location.hash).toBe("#/shikaku");
    expect(result.current.currentTab).toBe("shikaku");
  });

  it("falls back to 'home' for invalid hash values", () => {
    window.location.hash = "#/not-a-tab";
    const { result } = renderHook(() => useHashRouter());
    expect(result.current.currentTab).toBe("home");
  });

  it("clears hash when navigating to home", () => {
    const { result } = renderHook(() => useHashRouter());
    act(() => {
      result.current.navigate("about");
    });
    act(() => {
      result.current.navigate("home");
    });
    expect(result.current.currentTab).toBe("home");
  });
});
