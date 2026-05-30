import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MatrixMenu from "./MatrixMenu";

describe("MatrixMenu", () => {
  it("renders all valid tabs as buttons", () => {
    const mockNavigate = vi.fn();
    render(<MatrixMenu currentTab="home" navigate={mockNavigate} />);

    expect(screen.getByRole("button", { name: /\[HM\]\s+home/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\[AB\]\s+about/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\[PO\]\s+posts/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\[PE\]\s+pets/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\[SH\]\s+shikaku/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\[SO\]\s+sokoban/i })).toBeInTheDocument();
  });

  it("renders the COMMAND_MATRIX header label", () => {
    render(<MatrixMenu currentTab="home" navigate={vi.fn()} />);
    expect(screen.getByText("COMMAND_MATRIX")).toBeInTheDocument();
  });

  it("highlights the currently active tab", () => {
    render(<MatrixMenu currentTab="about" navigate={vi.fn()} />);
    const aboutBtn = screen.getByRole("button", { name: /\[AB\]\s+about/i });
    expect(aboutBtn.className).toMatch(/bg-cozy-accent/);
  });

  it("triggers navigation when a button is clicked", () => {
    const mockNavigate = vi.fn();
    render(<MatrixMenu currentTab="home" navigate={mockNavigate} />);

    fireEvent.click(screen.getByRole("button", { name: /\[AB\]\s+about/i }));
    expect(mockNavigate).toHaveBeenCalledWith("about");
  });
});
