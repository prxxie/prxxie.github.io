import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import ShikakuApp from "./ShikakuApp";
import { useShikakuStore } from "./store/useShikakuStore";
import type { Puzzle } from "./types";

vi.mock("./engine/synth", () => ({
  synth: {
    playClick: vi.fn(),
    playWin: vi.fn(),
    playPlace: vi.fn(),
    playError: vi.fn(),
  },
}));

vi.mock("shared", () => ({
  ProgressService: vi.fn().mockImplementation(() => ({
    completeLevel: vi.fn().mockResolvedValue(true),
    feedPet: vi.fn().mockResolvedValue(undefined),
    getFoodAvailable: vi.fn().mockResolvedValue(0),
    isPetHungry: vi.fn().mockResolvedValue(false),
    getState: vi.fn().mockResolvedValue({
      completedLevels: [],
      foodConsumed: 0,
      pet: { xp: 0, stage: 1, lastFedAt: 0 },
    }),
  })),
  LocalProgressRepository: vi.fn().mockImplementation(() => ({})),
}));

import { synth } from "./engine/synth";

describe("ShikakuApp Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useShikakuStore.setState({
      puzzle: null,
      regions: [],
      dragStart: null,
      dragEnd: null,
      elapsedTime: 0,
      timerActive: false,
      isWon: false,
      starsAchieved: 0,
      completedLevels: {},
      loadSave: vi.fn(),
      loadLevel: vi.fn((levelsList: Puzzle[], idx: number) => {
        useShikakuStore.setState({
          puzzle: levelsList[idx],
          timerActive: true,
        });
      }),
    });
  });

  it("renders LevelSelect initially", () => {
    render(<ShikakuApp />);
    expect(screen.getByText("SELECT LEVEL")).toBeInTheDocument();
    expect(screen.queryByText("◀ BACK")).not.toBeInTheDocument();
  });

  it("transitions to HUD and Board when level is selected", () => {
    render(<ShikakuApp />);

    const levelOneButton = screen.getByText("1").closest("button");
    fireEvent.click(levelOneButton!);

    expect(screen.getByText("◀ BACK")).toBeInTheDocument();
    expect(screen.queryByText("SELECT LEVEL")).not.toBeInTheDocument();
  });

  it("navigates back to LevelSelect when BACK is clicked", () => {
    render(<ShikakuApp />);

    const levelOneButton = screen.getByText("1").closest("button");
    fireEvent.click(levelOneButton!);
    expect(screen.getByText("◀ BACK")).toBeInTheDocument();

    fireEvent.click(screen.getByText("◀ BACK"));

    expect(screen.getByText("SELECT LEVEL")).toBeInTheDocument();
    expect(screen.queryByText("◀ BACK")).not.toBeInTheDocument();
  });

  it("triggers synth.playWin() when isWon becomes true", () => {
    render(<ShikakuApp />);

    const levelOneButton = screen.getByText("1").closest("button");
    fireEvent.click(levelOneButton!);

    act(() => {
      useShikakuStore.setState({ isWon: true });
    });

    expect(synth.playWin).toHaveBeenCalled();
  });
});
