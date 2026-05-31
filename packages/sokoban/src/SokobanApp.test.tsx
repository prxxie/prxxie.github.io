import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SokobanApp from "./SokobanApp";
import { useSokobanStore } from "./store/useSokobanStore";

vi.mock("./engine/synth", () => ({
  synth: {
    init: vi.fn(),
    playMove: vi.fn(),
    playPush: vi.fn(),
    playError: vi.fn(),
    playWin: vi.fn(),
    setMuted: vi.fn(),
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

describe("SokobanApp Component", () => {
  beforeEach(() => {
    useSokobanStore.setState({
      currentLevelIdx: 0,
      board: [],
      player: { x: 0, y: 0 },
      boxes: [],
      moves: 0,
      history: [],
      isWon: false,
      isMuted: false,
      deadlockedBoxIds: new Set(),
      lastDirection: "down",
      isMoving: false,
    });
  });

  it("renders LevelSelect screen initially", () => {
    render(<SokobanApp />);
    expect(screen.getByText("SELECT LEVEL")).toBeInTheDocument();
    expect(screen.queryByText("< MENU")).not.toBeInTheDocument();
  });

  it("transitions to HUD, Board and Controls when a level is selected", () => {
    render(<SokobanApp />);

    const levelOneButton = screen.getByText("1").closest("button");
    fireEvent.click(levelOneButton!);

    // HUD element
    expect(screen.getByText("< MENU")).toBeInTheDocument();
    expect(screen.getByText("HELLO WORLD")).toBeInTheDocument();
    
    // Controls elements (virtual keys)
    expect(screen.getByLabelText("Move Up")).toBeInTheDocument();
    expect(screen.getByLabelText("Move Down")).toBeInTheDocument();
    expect(screen.getByLabelText("Move Left")).toBeInTheDocument();
    expect(screen.getByLabelText("Move Right")).toBeInTheDocument();
  });

  it("navigates back to LevelSelect when BACK/MENU is clicked", () => {
    render(<SokobanApp />);

    const levelOneButton = screen.getByText("1").closest("button");
    fireEvent.click(levelOneButton!);
    expect(screen.getByText("< MENU")).toBeInTheDocument();

    fireEvent.click(screen.getByText("< MENU"));
    expect(screen.getByText("SELECT LEVEL")).toBeInTheDocument();
    expect(screen.queryByText("< MENU")).not.toBeInTheDocument();
  });
});
