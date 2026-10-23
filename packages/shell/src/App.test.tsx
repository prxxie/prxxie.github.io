import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { ProgressServiceProvider } from "./hooks/useProgressService";
import "@testing-library/jest-dom";
import { createAppRoutes } from "./routes";

function renderAt(path: string): void {
  const router = createMemoryRouter(createAppRoutes(), { initialEntries: [path] });
  render(
    <ProgressServiceProvider>
      <RouterProvider router={router} />
    </ProgressServiceProvider>,
  );
}

describe("Shell Host App", () => {
  let originalFullscreenElementDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
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

    originalFullscreenElementDescriptor = Object.getOwnPropertyDescriptor(document, "fullscreenElement");
    Object.defineProperty(document, "fullscreenElement", {
      value: null,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    // @ts-expect-error - test cleanup
    delete HTMLDivElement.prototype.requestFullscreen;
    // @ts-expect-error - test cleanup
    delete document.exitFullscreen;

    if (originalFullscreenElementDescriptor) {
      Object.defineProperty(document, "fullscreenElement", originalFullscreenElementDescriptor);
    } else {
      // @ts-expect-error - test cleanup
      delete document.fullscreenElement;
    }
    vi.restoreAllMocks();
  });

  it("renders the home page at the root", () => {
    renderAt("/");
    expect(screen.getByText("BYRIA-RR9")).toBeInTheDocument();
    expect(screen.getByText("Proof")).toBeInTheDocument();
  });

  it("renders the section navigation", () => {
    renderAt("/");
    expect(screen.getAllByRole("link", { name: "Games" }).length).toBeGreaterThanOrEqual(1);
  });

  it("toggles fullscreen", () => {
    renderAt("/");

    const toggleButton = screen.getByLabelText("Enter fullscreen");
    expect(toggleButton).toHaveTextContent("[⛶]");

    fireEvent.click(toggleButton);
    expect(HTMLDivElement.prototype.requestFullscreen).toHaveBeenCalled();

    Object.defineProperty(document, "fullscreenElement", { value: {}, writable: true, configurable: true });
    fireEvent(document, new Event("fullscreenchange"));
    expect(screen.getByLabelText("Leave fullscreen")).toHaveTextContent("[×]");

    fireEvent.click(screen.getByLabelText("Leave fullscreen"));
    expect((document as unknown as { exitFullscreen: ReturnType<typeof vi.fn> }).exitFullscreen).toHaveBeenCalled();
  });
});
