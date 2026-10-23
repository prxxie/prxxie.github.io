import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import "@testing-library/jest-dom";
import { ProgressServiceProvider } from "./hooks/useProgressService";
import GameRoute from "./screens/GameRoute";

// The remote cannot be fetched: rendering the exposed component throws what a
// rejected `import()` leaves behind once React.lazy re-throws it. Mocked at the
// file the vitest alias resolves the remote to, because an alias specifier does
// not intercept the aliased module id.
vi.mock("/home/cpt0912/WORKS/CDEV/prxxie-home/packages/shell/src/components/MockMfe.tsx", () => ({
  default: (): never => {
    throw new Error("Failed to fetch dynamically imported module");
  },
}));

vi.mock("./utils/audio", () => ({
  playBeepSound: vi.fn(),
  getAudioMuted: () => true,
  setAudioMuted: vi.fn(),
}));

describe("a game remote that cannot be fetched", () => {
  it("renders its fallback inside the page instead of replacing it", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ProgressServiceProvider>
        <MemoryRouter initialEntries={["/games/sokoban"]}>
          <Routes>
            <Route path="/games/:game" element={<GameRoute />} />
          </Routes>
        </MemoryRouter>
      </ProgressServiceProvider>,
    );

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/sokoban could not start/i);
    });
    expect(screen.getByRole("link", { name: /back to the front page/i })).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
