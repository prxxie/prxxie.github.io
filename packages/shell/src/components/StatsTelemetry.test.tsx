import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import StatsTelemetry from "./StatsTelemetry";

describe("StatsTelemetry", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders telemetry header and stat sections", () => {
    render(<StatsTelemetry />);
    expect(screen.getByText("USER_STATS_TELEMETRY")).toBeInTheDocument();
    expect(screen.getByText(/SHIKAKU CORES/)).toBeInTheDocument();
    expect(screen.getByText(/SOKOBAN CARGO/)).toBeInTheDocument();
    expect(screen.getByText(/NEWEST POSTS LOG/)).toBeInTheDocument();
  });

  it("loads Shikaku progress from localStorage", () => {
    const mockSave = {
      completed: {
        "level-1": { stars: 3, bestTime: 12 },
        "level-2": { stars: 2, bestTime: 45 },
      },
    };
    localStorage.setItem("cozy_os_shikaku_save", JSON.stringify(mockSave));

    render(<StatsTelemetry />);
    expect(screen.getByText(/SOLVED: 2 PUZZLE/)).toBeInTheDocument();
  });

  it("loads Sokoban level from localStorage", () => {
    localStorage.setItem("cozy_os_sokoban_level", "5");

    render(<StatsTelemetry />);
    expect(screen.getByText(/LEVEL REACHED: 6/)).toBeInTheDocument();
  });

  it("falls back to zero counts when localStorage is empty", () => {
    render(<StatsTelemetry />);
    expect(screen.getByText(/SOLVED: 0 PUZZLE/)).toBeInTheDocument();
    expect(screen.getByText(/LEVEL REACHED: 1/)).toBeInTheDocument();
  });
});
