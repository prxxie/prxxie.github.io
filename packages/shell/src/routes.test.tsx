import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { ProgressServiceProvider } from "./hooks/useProgressService";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import "@testing-library/jest-dom";
import { createAppRoutes, gameSlugs, prerenderPaths, games } from "./routes";

function renderAt(path: string): void {
  const router = createMemoryRouter(createAppRoutes(), { initialEntries: [path] });
  render(
    <ProgressServiceProvider>
      <RouterProvider router={router} />
    </ProgressServiceProvider>,
  );
}

describe("the route table", () => {
  it("declares the five page paths and a catch-all", () => {
    const shell = createAppRoutes()[0];
    const paths = (shell.children ?? []).map((route) => route.path ?? "(index)");
    expect(paths).toContain("(index)");
    expect(paths).toHaveLength(6);
    expect(paths).toContain("games");
    expect(paths).toContain("games/:game");
    expect(paths).toContain("devlog");
    expect(paths).toContain("devlog/:slug");
    expect(paths).toContain("*");
    expect(shell.children?.some((route) => route.index)).toBe(true);
  });

  it("renders a devlog post from the URL alone", () => {
    renderAt("/devlog/hello-retro-world");
    expect(screen.getByRole("heading", { level: 1, name: /hello, retro world/i })).toBeInTheDocument();
    expect(screen.queryByText("BYRIA-RR9")).not.toBeInTheDocument();
  });

  it("renders the not-found screen for an unknown path, with the three doors", () => {
    renderAt("/nope");
    expect(screen.getByRole("heading", { name: /does not exist/i })).toBeInTheDocument();
    for (const label of ["Home", "Games", "Devlog"]) {
      expect(screen.getAllByRole("link", { name: label }).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("explains an unknown game instead of blanking the page", () => {
    renderAt("/games/nope");
    expect(screen.getByRole("heading", { name: /no game called/i })).toBeInTheDocument();
  });

  it("lists every game in the hub", () => {
    renderAt("/games");
    for (const game of games) {
      expect(screen.getAllByRole("heading", { name: game.title })[0]).toBeInTheDocument();
    }
  });

  it("expands the dynamic paths for the prerender step", () => {
    const paths = prerenderPaths(["hello-world", "second-post"]);
    expect(paths).toEqual([
      "/",
      "/games",
      "/games/shikaku",
      "/games/sokoban",
      "/games/slitherlink",
      "/devlog",
      "/devlog/hello-world",
      "/devlog/second-post",
      "/404",
    ]);
  });

  it("names the same three games the remotes expose", () => {
    expect(gameSlugs).toEqual(["shikaku", "sokoban", "slitherlink"]);
  });

  it("carries exactly one routing dependency and no hash router", () => {
    const shellManifest = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf8")) as {
      dependencies: Record<string, string>;
    };
    const routing = Object.keys(shellManifest.dependencies).filter((name) => /router/i.test(name));
    expect(routing).toEqual(["react-router"]);
    expect(existsSync(join(__dirname, "hooks", "useHashRouter.ts"))).toBe(false);
  });
});
