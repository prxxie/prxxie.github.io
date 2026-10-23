// @vitest-environment node
import { describe, expect, it } from "vitest";
import { listRoutes, renderPage, titleForPath } from "./entry-server";

describe("prerendering", () => {
  it("lists one path per route, with the dynamic entries expanded", () => {
    expect(listRoutes(["hello-retro-world", "markdown-verification"])).toEqual([
      "/",
      "/games",
      "/games/shikaku",
      "/games/sokoban",
      "/games/slitherlink",
      "/devlog",
      "/devlog/hello-retro-world",
      "/devlog/markdown-verification",
      "/404",
    ]);
  });

  it("renders the front page as readable markup with its own title", async () => {
    const page = await renderPage("/");

    expect(page.title).toContain("prxxie.dev");
    expect(page.html).toContain("<main");
    expect(page.html).toContain('id="main"');
    expect(page.html).toMatch(/<h1[^>]*>[^<]+<\/h1>/);
    expect(page.html).toContain('href="/games"');
  });

  it("names each route in its title", () => {
    expect(titleForPath("/games/sokoban")).toBe("Sokoban — prxxie.dev");
    expect(titleForPath("/games")).toBe("Games — prxxie.dev");
    expect(titleForPath("/devlog/hello-retro-world")).toContain("Hello, Retro World!");
    expect(titleForPath("/devlog")).toBe("Devlog — prxxie.dev");
    expect(titleForPath("/404")).toContain("not found");
    expect(titleForPath("/nope")).toContain("not found");
  });

  it("gives a game route its container and a placeholder, never a board", async () => {
    const page = await renderPage("/games/sokoban");

    expect(page.html).toContain('data-game-container="sokoban"');
    expect(page.html).toContain('data-game-placeholder');
    expect(page.html).toMatch(/Loading[\s\S]{0,24}sokoban/);
    expect(page.html).not.toContain("data-game-board");
    expect(page.html).not.toContain("data-msg=");
    expect(page.html).toContain("Sokoban");
  });

  it("renders the unknown-game page instead of an empty document", async () => {
    const page = await renderPage("/games/chess");

    expect(page.html).toContain("There is no game called");
    expect(page.html.length).toBeGreaterThan(500);
  });
});
