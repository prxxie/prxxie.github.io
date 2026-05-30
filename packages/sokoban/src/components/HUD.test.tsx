import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import HUD from "./HUD";
import { useSokobanStore } from "../store/useSokobanStore";

vi.mock("../engine/synth", () => ({
  synth: {
    init: vi.fn(),
    setMuted: vi.fn(),
  },
}));

describe("Sokoban HUD Component", () => {
  beforeEach(() => {
    useSokobanStore.setState({
      currentLevelIdx: 0,
      moves: 0,
      history: [],
      isMuted: false,
      undo: vi.fn(),
      restart: vi.fn(),
      setMuted: vi.fn(),
    });
  });

  it("renders level name, moves, and action buttons", () => {
    const handleBack = vi.fn();
    render(<HUD onBack={handleBack} />);

    expect(screen.getByText("FIRST STEPS")).toBeInTheDocument();
    expect(screen.getByText("MOVES: 0")).toBeInTheDocument();
    expect(screen.getByText("UNDO")).toBeInTheDocument();
    expect(screen.getByText("RESET")).toBeInTheDocument();
    expect(screen.getByText("🔊")).toBeInTheDocument();
  });

  it("handles BACK button click", () => {
    const handleBack = vi.fn();
    render(<HUD onBack={handleBack} />);

    fireEvent.click(screen.getByText("< MENU"));
    expect(handleBack).toHaveBeenCalled();
  });

  it("handles UNDO and RESET button clicks", () => {
    const undoMock = vi.fn();
    const restartMock = vi.fn();

    // Enable UNDO by putting a snapshot in history
    useSokobanStore.setState({
      history: [{ player: { x: 1, y: 1 }, boxes: [] }],
      undo: undoMock,
      restart: restartMock,
    });

    render(<HUD onBack={vi.fn()} />);

    fireEvent.click(screen.getByText("UNDO"));
    expect(undoMock).toHaveBeenCalled();

    fireEvent.click(screen.getByText("RESET"));
    expect(restartMock).toHaveBeenCalled();
  });

  it("toggles sound state on mute button click", () => {
    const setMutedMock = vi.fn();
    useSokobanStore.setState({
      isMuted: false,
      setMuted: setMutedMock,
    });

    const { rerender } = render(<HUD onBack={vi.fn()} />);

    expect(screen.getByText("🔊")).toBeInTheDocument();
    fireEvent.click(screen.getByText("🔊"));
    expect(setMutedMock).toHaveBeenCalledWith(true);

    act(() => {
      useSokobanStore.setState({
        isMuted: true,
      });
    });
    rerender(<HUD onBack={vi.fn()} />);
    expect(screen.getByText("🔇")).toBeInTheDocument();
  });
});
