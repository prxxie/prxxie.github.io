import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router";
import Footer from "./Footer";
import { ProgressServiceProvider } from "../../hooks/useProgressService";

function renderAt(path: string) {
  return render(
    <ProgressServiceProvider>
      <MemoryRouter initialEntries={[path]}>
        <Footer />
      </MemoryRouter>
    </ProgressServiceProvider>,
  );
}

describe("the footer (US-PET-003)", () => {
  it("carries the pet widget on the front page", () => {
    renderAt("/");

    expect(screen.getByRole("button", { name: "Feed" })).toBeInTheDocument();
    expect(screen.getByText(/hunger/)).toBeInTheDocument();
  });

  it("mounts no pet anywhere else, and keeps the contact path", () => {
    renderAt("/devlog");

    expect(screen.queryByRole("button", { name: "Feed" })).toBeNull();
    expect(screen.getByRole("link", { name: /email prxxie/i })).toBeInTheDocument();
  });

  it("keeps the static footer on every page", () => {
    for (const path of ["/", "/games", "/devlog", "/games/sokoban"]) {
      const { unmount } = renderAt(path);

      expect(screen.getByText(/made in the open, one story at a time/)).toBeInTheDocument();
      unmount();
    }
  });
});
