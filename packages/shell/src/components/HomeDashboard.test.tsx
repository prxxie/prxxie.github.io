import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomeDashboard from "./HomeDashboard";

describe("HomeDashboard", () => {
  it("renders planet designation and stats", () => {
    render(<HomeDashboard />);
    expect(screen.getByText("BYRIA-RR9")).toBeInTheDocument();
    expect(screen.getByText(/MASS:/)).toBeInTheDocument();
    expect(screen.getByText(/GRAVITY:/)).toBeInTheDocument();
    expect(screen.getByText(/RADIUS:/)).toBeInTheDocument();
  });

  it("renders system boot logs panel", () => {
    render(<HomeDashboard />);
    expect(screen.getByText("SYSTEM_BOOT_LOGS")).toBeInTheDocument();
    expect(screen.getByText("● ONLINE")).toBeInTheDocument();
  });

  it("renders transmissions and signal panels", () => {
    render(<HomeDashboard />);
    expect(screen.getByText("Transmissions Scanning")).toBeInTheDocument();
    expect(screen.getByText("Incoming Signal Wave")).toBeInTheDocument();
    expect(screen.getByText("BROADCAST_TOWERS")).toBeInTheDocument();
  });

  it("renders broadcast tower links", () => {
    render(<HomeDashboard />);
    expect(screen.getByText(/BRT-743-T/)).toBeInTheDocument();
    expect(screen.getByText(/AEW-DYM-Y/)).toBeInTheDocument();
  });
});
