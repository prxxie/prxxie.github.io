import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { ProgressServiceProvider, useProgressService } from "./useProgressService";
import { ProgressService } from "shared";

describe("useProgressService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("throws error when used outside ProgressServiceProvider", () => {
    // Prevent react from printing expected error boundaries to console
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      renderHook(() => useProgressService());
    }).toThrow("useProgressService must be used within a ProgressServiceProvider");

    consoleErrorSpy.mockRestore();
  });

  it("provides progress service state and functions inside ProgressServiceProvider", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProgressServiceProvider>{children}</ProgressServiceProvider>
    );

    const { result } = renderHook(() => useProgressService(), { wrapper });

    // Wait for the async refresh to complete and update state
    await waitFor(() => {
      expect(result.current.isHungry).toBe(true);
    });

    // Post-refresh state check
    expect(result.current.state).toBeDefined();
    expect(result.current.foodAvailable).toBe(0);
    expect(result.current.hungryLevel).toBe(5);
    expect(result.current.happiness).toBe(50);
    expect(result.current.isSleeping).toBe(false);
    expect(typeof result.current.feedPet).toBe("function");
    expect(typeof result.current.playWithPet).toBe("function");
    expect(typeof result.current.toggleSleep).toBe("function");
  });

  it("updates state when cozyos:progress-updated custom event is dispatched", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProgressServiceProvider>{children}</ProgressServiceProvider>
    );

    const { result } = renderHook(() => useProgressService(), { wrapper });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isHungry).toBe(true);
    });

    // Update localStorage directly under the key "cozyos.progress.v1" with a recently fed pet state
    localStorage.setItem(
      "cozyos.progress.v1",
      JSON.stringify({
        version: 1,
        state: {
          completedLevels: [],
          foodConsumed: 0,
          pet: {
            xp: 0,
            stage: 1,
            lastFedAt: Date.now(),
            happiness: 100,
            lastPlayedAt: Date.now(),
            isSleeping: false,
          },
        },
      })
    );

    // Trigger storage event to clear the repository's cache
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "cozyos.progress.v1" }));
    });

    // Dispatch the cozyos:progress-updated event
    act(() => {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    });

    // Verify using waitFor that isHungry updates to false
    await waitFor(() => {
      expect(result.current.isHungry).toBe(false);
    });
  });

  it("propagates errors and logs to console when feedPet, playWithPet, or toggleSleep fails", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const feedSpy = vi.spyOn(ProgressService.prototype, "feedPet").mockRejectedValue(new Error("Feed Failure"));
    const playSpy = vi.spyOn(ProgressService.prototype, "playWithPet").mockRejectedValue(new Error("Play Failure"));
    const sleepSpy = vi.spyOn(ProgressService.prototype, "toggleSleep").mockRejectedValue(new Error("Sleep Failure"));

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <ProgressServiceProvider>{children}</ProgressServiceProvider>
    );

    const { result } = renderHook(() => useProgressService(), { wrapper });

    // Wait for initial load/refresh to complete
    await waitFor(() => {
      expect(result.current.isHungry).toBe(true);
    });

    // Call feedPet and assert failure and log
    await expect(result.current.feedPet()).rejects.toThrow("Feed Failure");
    expect(consoleErrorSpy).toHaveBeenCalledWith("ProgressService: feedPet failed:", expect.any(Error));

    // Call playWithPet and assert failure and log
    await expect(result.current.playWithPet()).rejects.toThrow("Play Failure");
    expect(consoleErrorSpy).toHaveBeenCalledWith("ProgressService: playWithPet failed:", expect.any(Error));

    // Call toggleSleep and assert failure and log
    await expect(result.current.toggleSleep()).rejects.toThrow("Sleep Failure");
    expect(consoleErrorSpy).toHaveBeenCalledWith("ProgressService: toggleSleep failed:", expect.any(Error));

    // Cleanup mocks
    feedSpy.mockRestore();
    playSpy.mockRestore();
    sleepSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
