import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Board from "./Board";
import { useShikakuStore } from "../store/useShikakuStore";

vi.mock("../engine/synth", () => ({
  synth: {
    playPlace: vi.fn(),
    playError: vi.fn(),
    playClick: vi.fn(),
  },
}));

import { synth } from "../engine/synth";

describe("Board Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useShikakuStore.setState({
      puzzle: {
        id: "easy-1",
        difficulty: "Easy",
        width: 3,
        height: 3,
        clues: [
          { x: 0, y: 0, value: 3 },
          { x: 2, y: 2, value: 2 },
        ],
        targets: { threeStars: 10, twoStars: 20, oneStar: 30 },
      },
      regions: [],
      dragStart: null,
      dragEnd: null,
      startDrag: vi.fn(),
      updateDrag: vi.fn(),
      commitDrag: vi.fn(),
      cancelDrag: vi.fn(),
      removeRegionAt: vi.fn(),
      isWon: false,
    });
  });

  it("renders nothing when no puzzle loaded", () => {
    useShikakuStore.setState({ puzzle: null });
    const { container } = render(<Board />);
    expect(container.firstChild).toBeNull();
  });

  it("renders cells with clues and background", () => {
    render(<Board />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders placed regions layer", () => {
    useShikakuStore.setState({
      regions: [
        {
          id: "r1",
          x: 0,
          y: 0,
          width: 3,
          height: 1,
          color: "#ff0000",
          borderColor: "#ff0000",
          area: 3,
          clueX: 0,
          clueY: 0,
        },
      ],
    });
    render(<Board />);
    const regionTexts = screen.getAllByText("3");
    expect(regionTexts.length).toBeGreaterThanOrEqual(2);
  });

  it("renders win overlay when puzzle is won", () => {
    useShikakuStore.setState({ isWon: true });
    render(<Board />);
    expect(screen.getByText("BOARD SOLVED!")).toBeInTheDocument();
  });

  it("handles global pointerup events and triggers commitDrag success synth sound", () => {
    const commitMock = vi.fn().mockReturnValue({ success: true });
    useShikakuStore.setState({
      dragStart: { x: 0, y: 0 },
      commitDrag: commitMock,
    });

    render(<Board />);

    fireEvent.pointerUp(window);
    expect(commitMock).toHaveBeenCalled();
    expect(synth.playPlace).toHaveBeenCalled();
  });

  it("handles global pointerup events and triggers commitDrag error synth sound and shake", () => {
    const commitMock = vi.fn().mockReturnValue({ success: false });
    useShikakuStore.setState({
      dragStart: { x: 0, y: 0 },
      commitDrag: commitMock,
    });

    render(<Board />);

    fireEvent.pointerUp(window);
    expect(commitMock).toHaveBeenCalled();
    expect(synth.playError).toHaveBeenCalled();
  });

  it("handles global pointercancel events and triggers cancelDrag", () => {
    const cancelMock = vi.fn();
    useShikakuStore.setState({
      dragStart: { x: 0, y: 0 },
      cancelDrag: cancelMock,
    });

    render(<Board />);

    fireEvent(window, new Event("pointercancel"));
    expect(cancelMock).toHaveBeenCalled();
  });

  it("applies responsive sizing inline styles to the board container", () => {
    const { container } = render(<Board />);
    const boardContainer = container.querySelector(".relative.border");
    expect(boardContainer).toBeInTheDocument();
    expect(boardContainer).toHaveStyle({
      maxWidth: "min(85vw, 60vh, 400px)",
      maxHeight: "min(85vw, 60vh, 400px)",
    });
  });
});
