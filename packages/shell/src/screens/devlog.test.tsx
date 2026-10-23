import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router";
import { createAppRoutes } from "../routes";
import { ProgressServiceProvider } from "../hooks/useProgressService";
import { loadPosts } from "posts/content";

function renderAt(path: string) {
  const router = createMemoryRouter(createAppRoutes(), { initialEntries: [path] });
  const view = render(
    <ProgressServiceProvider>
      <RouterProvider router={router} />
    </ProgressServiceProvider>,
  );

  return { ...view, router };
}

const posts = loadPosts();

describe("the devlog index", () => {
  it("lists every published post with its title, date and summary, newest first", () => {
    const main = renderAt("/devlog").container.querySelector("main")!;
    const titles = [...main.querySelectorAll("li h2")].map((heading) => heading.textContent);

    expect(titles).toEqual(posts.map((post) => post.title));
    expect(posts.map((post) => post.slug)).toEqual(["markdown-verification", "hello-retro-world"]);

    for (const post of posts) {
      expect(main.textContent).toContain(post.summary);
      expect(main.textContent).toContain(post.date);
    }
  });

  it("makes each entry one link to the post, and keeps the heading", () => {
    const main = renderAt("/devlog").container.querySelector("main")!;
    const links = [...main.querySelectorAll("li a")].filter((link) => link.querySelector("h2") !== null);

    expect(links).toHaveLength(posts.length);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(posts.map((post) => `/devlog/${post.slug}`));
    expect(main.querySelectorAll("li a h2")).toHaveLength(posts.length);
    expect(main.querySelector("h1")?.textContent).toBe("Devlog");
  });

  it("renders the entries without a client sort or a fetch", () => {
    const main = renderAt("/devlog").container.querySelector("main")!;
    const dates = [...main.querySelectorAll("time")].map((time) => time.getAttribute("datetime"));

    expect(dates).toEqual(posts.map((post) => post.date));
  });
});

describe("one post", () => {
  it("carries its title and a compiled body, not raw markdown", () => {
    const { container } = renderAt("/devlog/markdown-verification");
    const body = container.querySelector(".prose");

    expect(container.querySelectorAll("h1")).toHaveLength(1);
    expect(container.querySelector("h1")?.textContent).toBe("Markdown Verification");
    expect(body?.innerHTML).toContain("<p>");
    expect(body?.innerHTML).not.toContain("##");
    expect(body?.innerHTML).not.toContain("---");
  });

  it("gives every body heading an anchor id and demotes it below the page title", () => {
    const { container } = renderAt("/devlog/hello-retro-world");
    const headings = [...(container.querySelector(".prose")?.querySelectorAll("h1, h2, h3, h4") ?? [])];

    expect(headings.length).toBeGreaterThan(0);

    for (const heading of headings) {
      expect(heading.tagName).not.toBe("H1");
      expect(heading.id).not.toBe("");
    }
  });

  it("links to the adjacent posts in date order and hides the missing direction at the ends", () => {
    const first = renderAt("/devlog/markdown-verification");
    const firstNav = first.container.querySelector('nav[aria-label="Adjacent posts"]');

    expect(firstNav?.textContent).not.toContain("←");
    expect(firstNav?.textContent).toContain("Hello, Retro World!");

    const last = renderAt("/devlog/hello-retro-world");
    const lastNav = last.container.querySelector('nav[aria-label="Adjacent posts"]');

    expect(lastNav?.textContent).toContain("←");
    expect(lastNav?.textContent).not.toContain("→");
  });

  it("renders the not-found screen for an unknown slug", () => {
    const { container } = renderAt("/devlog/no-such-post");

    expect(container.querySelector("h1")?.textContent).toContain("does not exist");
    expect(container.querySelector('a[href="/devlog"]')).not.toBeNull();
  });
});
