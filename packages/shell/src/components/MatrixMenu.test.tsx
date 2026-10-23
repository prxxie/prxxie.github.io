import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import "@testing-library/jest-dom";
import MatrixMenu from "./MatrixMenu";

vi.mock("../utils/audio", () => ({ playBeepSound: vi.fn() }));

function renderAt(path: string): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <MatrixMenu />
    </MemoryRouter>,
  );
}

describe("MatrixMenu", () => {
  it("links to every section of the site", () => {
    renderAt("/");

    const links = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(links).toEqual(["/", "/games", "/games/shikaku", "/games/sokoban", "/games/slitherlink", "/devlog"]);
  });

  it("marks the section the reader is in", () => {
    renderAt("/devlog");

    expect(screen.getByRole("link", { name: "Devlog" })).toHaveClass("bg-primary");
    expect(screen.getByRole("link", { name: "Games" })).not.toHaveClass("bg-primary");
  });

  it("keeps home inactive on a nested route", () => {
    renderAt("/games/sokoban");

    expect(screen.getByRole("link", { name: "Home" })).not.toHaveClass("bg-primary");
    expect(screen.getByRole("link", { name: "Sokoban" })).toHaveClass("bg-primary");
  });

  it("is a navigation landmark, not a set of tab buttons", () => {
    renderAt("/");

    expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
