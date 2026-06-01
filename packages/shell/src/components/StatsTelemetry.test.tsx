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

  it("loads Sokoban progress from cozyos.progress.v1", () => {
    const mockProgress = {
      version: 1,
      state: {
        completedLevels: [
          { module: "sokoban", levelId: "0", stars: 3, completedAt: 1 },
          { module: "sokoban", levelId: "4", stars: 2, completedAt: 2 },
          { module: "sokoban", levelId: "9", stars: 1, completedAt: 3 },
          { module: "shikaku", levelId: "0", stars: 2, completedAt: 4 },
        ],
      },
    };
    localStorage.setItem("cozyos.progress.v1", JSON.stringify(mockProgress));

    render(<StatsTelemetry />);
    expect(screen.getByText(/SOLVED: 3/)).toBeInTheDocument();
    expect(screen.getByText(/BEST LEVEL: 10/)).toBeInTheDocument();
  });

  it("falls back to zero counts when localStorage is empty", () => {
    render(<StatsTelemetry />);
    expect(screen.getByText(/SOLVED: 0 PUZZLE/)).toBeInTheDocument();
    expect(screen.getByText(/SOLVED: 0 \| BEST LEVEL: 0/)).toBeInTheDocument();
  });
});
