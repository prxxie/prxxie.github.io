import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SlitherlinkApp from "./SlitherlinkApp";

vi.mock("shared", () => {
  return {
    ProgressService: vi.fn().mockImplementation(() => ({
      getState: vi.fn().mockResolvedValue({
        completedLevels: [{ module: "slitherlink", levelId: "sl-easy-1", stars: 3 }],
        pet: { stage: 1 }
      }),
      completeLevelWithStars: vi.fn().mockResolvedValue(true)
    })),
    LocalProgressRepository: vi.fn()
  };
});

describe("SlitherlinkApp Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders level select menu initially", async () => {
    render(<SlitherlinkApp />);
    await screen.findByText("★★★");
    expect(screen.getByText("SELECT LEVEL")).toBeInTheDocument();
    expect(screen.getByText("EASY (5x5)")).toBeInTheDocument();
    expect(screen.getByText("MEDIUM (6x6)")).toBeInTheDocument();
  });

  it("launches game view on level selection", async () => {
    render(<SlitherlinkApp />);
    await screen.findByText("★★★");
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[0]); // Select Level 1

    expect(screen.getByText("LVL: SL-EASY-1")).toBeInTheDocument();
    expect(screen.getByText("UNDO")).toBeInTheDocument();
  });
});
