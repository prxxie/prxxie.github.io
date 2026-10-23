import React from "react";
import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { ProgressServiceProvider } from "./hooks/useProgressService";
import "@testing-library/jest-dom";
import { createAppRoutes } from "./routes";

vi.mock("./utils/audio", () => ({
  playBeepSound: vi.fn(),
  getAudioMuted: () => true,
  setAudioMuted: vi.fn(),
}));

function renderAt(path: string): void {
  const router = createMemoryRouter(createAppRoutes(), { initialEntries: [path] });
  render(
    <ProgressServiceProvider>
      <RouterProvider router={router} />
    </ProgressServiceProvider>,
  );
}

describe("Shell Host App", () => {
  it("renders the front page inside the three regions", () => {
    renderAt("/");

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(document.getElementById("region-title")).toHaveTextContent("Home");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("renames the page region as the route changes", async () => {
    renderAt("/");

    fireEvent.click(screen.getByRole("link", { name: "Games" }));

    await waitFor(() => {
      expect(document.getElementById("region-title")).toHaveTextContent("Games");
      expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    });
  });

  it("shows the not-found page for an unknown path", () => {
    renderAt("/nope");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/does not exist/i);
  });

});
