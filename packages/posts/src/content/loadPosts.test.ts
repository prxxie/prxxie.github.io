import { describe, expect, it } from "vitest";
import { loadPosts, parsePost, sortPosts } from "./loadPosts";

const VALID = `---
title: "A post"
date: "2026-05-28"
summary: "One line."
---

Body text.
`;

function frontmatter(lines: string[]): string {
  return `---\n${lines.join("\n")}\n---\n\nBody.\n`;
}

describe("parsePost", () => {
  it("reads the frontmatter contract and keeps the body", () => {
    const post = parsePost(VALID, "./posts/a-post.md");

    expect(post).toEqual({
      slug: "a-post",
      title: "A post",
      date: "2026-05-28",
      summary: "One line.",
      teaserGame: undefined,
      teaserLevel: undefined,
      body: "Body text.\n",
    });
  });

  it("carries an optional teaser", () => {
    const post = parsePost(
      frontmatter([
        'title: "Sokoban, finished"',
        'date: "2026-06-01"',
        'summary: "Two levels fixed."',
        'teaserGame: "sokoban"',
        'teaserLevel: "hack-10"',
      ]),
      "./posts/teaser.md",
    );

    expect(post.teaserGame).toBe("sokoban");
    expect(post.teaserLevel).toBe("hack-10");
  });

  it("names the file and the missing field", () => {
    expect(() => parsePost(frontmatter(['title: "No date"', 'summary: "x"']), "./posts/broken.md")).toThrow(
      /\.\/posts\/broken\.md.*missing required frontmatter field "date"/,
    );
  });

  it("rejects an unknown frontmatter field instead of ignoring it", () => {
    expect(() =>
      parsePost(frontmatter(['title: "x"', 'date: "2026-05-28"', 'summary: "y"', 'categroy: "typo"']), "./posts/typo.md"),
    ).toThrow(/unknown frontmatter field "categroy"/);
  });

  it("rejects a date that is not YYYY-MM-DD", () => {
    expect(() =>
      parsePost(frontmatter(['title: "x"', 'date: "28/05/2026"', 'summary: "y"']), "./posts/date.md"),
    ).toThrow(/must be YYYY-MM-DD/);
  });

  it("rejects a post without a frontmatter block", () => {
    expect(() => parsePost("# Just markdown\n", "./posts/raw.md")).toThrow(/missing frontmatter block/);
  });
});

describe("sortPosts", () => {
  it("orders posts newest first", () => {
    const older = parsePost(frontmatter(['title: "Old"', 'date: "2026-01-01"', 'summary: "a"']), "./posts/old.md");
    const newer = parsePost(frontmatter(['title: "New"', 'date: "2026-07-01"', 'summary: "b"']), "./posts/new.md");

    expect(sortPosts([older, newer]).map((post) => post.slug)).toEqual(["new", "old"]);
  });

  it("keeps a stable order when two posts share a date", () => {
    const b = parsePost(frontmatter(['title: "B"', 'date: "2026-02-02"', 'summary: "b"']), "./posts/b.md");
    const a = parsePost(frontmatter(['title: "A"', 'date: "2026-02-02"', 'summary: "a"']), "./posts/a.md");

    expect(sortPosts([b, a]).map((post) => post.slug)).toEqual(["a", "b"]);
  });
});

describe("loadPosts", () => {
  it("compiles every post file in the content directory", () => {
    const slugs = loadPosts().map((post) => post.slug);

    expect(slugs).toContain("hello-retro-world");
    expect(slugs).toContain("markdown-verification");
  });

  it("returns them newest first", () => {
    const dates = loadPosts().map((post) => post.date);

    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
  });
});
