import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LevelSelect from "./LevelSelect";
import { useShikakuStore } from "../store/useShikakuStore";

vi.mock("../engine/synth", () => ({
  synth: {
    playClick: vi.fn(),
  },
}));

describe("LevelSelect Component", () => {
  const loadSaveMock = vi.fn();

  beforeEach(() => {
    useShikakuStore.setState({
      completedLevels: {
        "easy-1": { stars: 3, bestTime: 12 },
        "easy-2": { stars: 1, bestTime: 45 },
      },
      loadSave: loadSaveMock,
    });
  });

  it("calls loadSave on mount", () => {
    render(<LevelSelect onSelect={vi.fn()} />);
    expect(loadSaveMock).toHaveBeenCalled();
  });

  it("renders levels correctly", () => {
    render(<LevelSelect onSelect={vi.fn()} />);

    expect(screen.getByText("SELECT LEVEL")).toBeInTheDocument();

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();

    expect(screen.getByText("★★★")).toBeInTheDocument();
    expect(screen.getByText("★☆☆")).toBeInTheDocument();
  });

  it("handles level select button click", () => {
    const handleSelect = vi.fn();
    render(<LevelSelect onSelect={handleSelect} />);

    const levelOneButton = screen.getByText("1").closest("button");
    fireEvent.click(levelOneButton!);
    expect(handleSelect).toHaveBeenCalledWith(0);
  });
});
