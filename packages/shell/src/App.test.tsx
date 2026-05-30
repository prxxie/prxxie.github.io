import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "./App";

describe("Shell Host App", () => {
  let originalFullscreenElementDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    window.location.hash = "";
    Object.defineProperty(HTMLDivElement.prototype, "requestFullscreen", {
      value: vi.fn().mockResolvedValue(undefined),
      writable: true,
      configurable: true,
    });

    Object.defineProperty(document, "exitFullscreen", {
      value: vi.fn().mockResolvedValue(undefined),
      writable: true,
      configurable: true,
    });

    originalFullscreenElementDescriptor = Object.getOwnPropertyDescriptor(
      document,
      "fullscreenElement"
    );

    Object.defineProperty(document, "fullscreenElement", {
      value: null,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    window.location.hash = "";
    // @ts-expect-error - test cleanup
    delete HTMLDivElement.prototype.requestFullscreen;
    // @ts-expect-error - test cleanup
    delete document.exitFullscreen;

    if (originalFullscreenElementDescriptor) {
      Object.defineProperty(
        document,
        "fullscreenElement",
        originalFullscreenElementDescriptor
      );
    } else {
      // @ts-expect-error - test cleanup
      delete document.fullscreenElement;
    }
    vi.restoreAllMocks();
  });

  it("renders HOME_VIEW window header on initial mount", () => {
    render(<App />);
    expect(screen.getByText("HOME_VIEW")).toBeInTheDocument();
  });

  it("renders the HomeDashboard planet on initial mount", () => {
    render(<App />);
    expect(screen.getByText("BYRIA-RR9")).toBeInTheDocument();
  });

  it("renders the side-panel MatrixMenu on desktop", () => {
    render(<App />);
    const buttons = screen.getAllByRole("button", { name: /\[AB\]\s+about/i });
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });

  it("navigates to ABOUT when matrix item is clicked", () => {
    render(<App />);
    const aboutBtns = screen.getAllByRole("button", { name: /\[AB\]\s+about/i });
    fireEvent.click(aboutBtns[0]);
    expect(window.location.hash).toBe("#/about");
    expect(screen.getByText("ABOUT_VIEW")).toBeInTheDocument();
  });

  it("toggles fullscreen state when button is clicked", () => {
    render(<App />);

    const toggleButton = screen.getByLabelText("Toggle Fullscreen");
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent("[⛶]");

    fireEvent.click(toggleButton);

    const requestFullscreenMock = HTMLDivElement.prototype
      .requestFullscreen as ReturnType<typeof vi.fn>;
    expect(requestFullscreenMock).toHaveBeenCalled();

    Object.defineProperty(document, "fullscreenElement", {
      value: {},
      writable: true,
      configurable: true,
    });

    fireEvent(document, new Event("fullscreenchange"));

    expect(toggleButton).toHaveTextContent("[🗗]");

    fireEvent.click(toggleButton);

    const exitFullscreenMock = (
      document as unknown as { exitFullscreen: ReturnType<typeof vi.fn> }
    ).exitFullscreen;
    expect(exitFullscreenMock).toHaveBeenCalled();

    Object.defineProperty(document, "fullscreenElement", {
      value: null,
      writable: true,
      configurable: true,
    });
    fireEvent(document, new Event("fullscreenchange"));
    expect(toggleButton).toHaveTextContent("[⛶]");
  });
});
