import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMemoryRouter, MemoryRouter, Route, RouterProvider, Routes } from "react-router";
import AppShell from "../../AppShell";
import { ProgressServiceProvider } from "../../hooks/useProgressService";
import { RouteError } from "./ErrorBoundary";

vi.mock("../../utils/audio", () => ({
  playBeepSound: vi.fn(),
  getAudioMuted: () => false,
  setAudioMuted: vi.fn(),
}));

vi.mock("pets/PetsApp", () => ({
  default: () => <div data-testid="pet-widget">pet</div>,
}));

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});

function renderShell(initial = "/"): void {
  render(
    <ProgressServiceProvider>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<p>home content</p>} />
            <Route path="games" element={<p>games content</p>} />
            <Route path="devlog" element={<p>devlog content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ProgressServiceProvider>,
  );
}

describe("shell regions", () => {
  it("puts a skip link first that jumps to the main region", () => {
    renderShell();

    const skip = screen.getByRole("link", { name: /skip to content/i });
    expect(skip).toHaveAttribute("href", "#main");
    expect(document.getElementById("main")).toHaveAttribute("tabindex", "-1");
  });

  it("exposes exactly one banner, one main and one contentinfo", () => {
    renderShell();

    expect(screen.getAllByRole("banner")).toHaveLength(1);
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(screen.getAllByRole("contentinfo")).toHaveLength(1);
  });

  it("lists three sections and marks the current one", () => {
    renderShell("/games");

    const nav = screen.getByRole("navigation", { name: "Sections" });
    const links = Array.from(nav.querySelectorAll("a"));

    expect(links.map((link) => link.textContent)).toEqual(["Home", "Games", "Devlog"]);
    expect(links[1]).toHaveAttribute("aria-current", "page");
    expect(links[0]).not.toHaveAttribute("aria-current");
  });

  it("moves focus to the main region on a route change", async () => {
    renderShell();

    const main = document.getElementById("main");
    main?.blur();
    expect(document.activeElement).not.toBe(main);

    fireEvent.click(screen.getByRole("link", { name: "Devlog" }));

    await waitFor(() => {
      expect(screen.getByText("devlog content")).toBeInTheDocument();
    });
    expect(document.activeElement).toBe(main);
  });

  it("keeps the header and footer when the page throws", () => {
    const Boom = (): React.ReactElement => {
      throw new Error("route exploded");
    };

    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const router = createMemoryRouter([
      {
        path: "/",
        element: <AppShell />,
        children: [{ index: true, element: <Boom />, errorElement: <RouteError /> }],
      },
    ]);

    render(
      <ProgressServiceProvider>
        <RouterProvider router={router} />
      </ProgressServiceProvider>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/this page broke/i);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to the front page/i })).toBeInTheDocument();

    spy.mockRestore();
  });
});
