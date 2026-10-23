import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router";
import { createAppRoutes } from "../routes";
import { ProgressServiceProvider } from "./useProgressService";
import { legacyPathFor, LEGACY_HASH_ROUTES } from "./useLegacyHashRedirect";

// The remotes are not fetched in a test: each one is a stub that renders a sentence.
vi.mock("../screens/game/GameBoard", () => ({
  default: ({ slug }: { slug: string }) => <p>{slug} board</p>,
}));
vi.mock("shikaku/ShikakuApp", () => ({ default: () => <p>shikaku remote</p> }));
vi.mock("sokoban/SokobanApp", () => ({ default: () => <p>sokoban remote</p> }));
vi.mock("slitherlink/SlitherlinkApp", () => ({ default: () => <p>slitherlink remote</p> }));
vi.mock("pets/PetsApp", () => ({ default: () => <p>pets remote</p> }));
vi.mock("posts/PostsApp", () => ({ default: () => <p>posts remote</p> }));

function renderAt(url: string, previous?: string) {
  window.history.replaceState(null, "", url);

  const entry = { pathname: window.location.pathname, hash: window.location.hash } as const;
  const router = createMemoryRouter(createAppRoutes(), {
    initialEntries: previous === undefined ? [entry] : [previous, entry],
    initialIndex: previous === undefined ? 0 : 1,
  });

  render(
    <ProgressServiceProvider>
      <RouterProvider router={router} />
    </ProgressServiceProvider>,
  );

  return router;
}

describe("the old hash links", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("maps every fragment the old site used, and the empty one, to a path", () => {
    expect(legacyPathFor("#shikaku")).toBe("/games/shikaku");
    expect(legacyPathFor("#sokoban")).toBe("/games/sokoban");
    expect(legacyPathFor("#slitherlink")).toBe("/games/slitherlink");
    expect(legacyPathFor("#posts")).toBe("/devlog");
    expect(legacyPathFor("#about")).toBe("/");
    expect(legacyPathFor("#pets")).toBe("/");
    expect(legacyPathFor("#")).toBeNull();
    expect(Object.keys(LEGACY_HASH_ROUTES)).toEqual(["", "about", "posts", "pets", "shikaku", "sokoban", "slitherlink"]);
  });

  it("sends #shikaku to the game route and leaves the new path in the address bar", async () => {
    const router = renderAt("/#shikaku");

    await waitFor(() => expect(router.state.location.pathname).toBe("/games/shikaku"));
    expect(await screen.findByText("shikaku board")).toBeInTheDocument();
  });

  it("lands an unknown fragment on the not-found screen without looping", async () => {
    const router = renderAt("/#nope");

    await waitFor(() => expect(router.state.location.pathname).toBe("/nope"));
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(/does not exist/i);
    expect(router.state.historyAction).not.toBe("POP");
  });

  it("replaces rather than pushes, so back has no redirect to replay", async () => {
    const router = renderAt("/#posts", "/");

    await waitFor(() => expect(router.state.location.pathname).toBe("/devlog"));
    expect(router.state.location.hash).toBe("");

    await router.navigate(-1);
    await waitFor(() => expect(router.state.location.pathname).not.toBe("/devlog"));
  });
});
