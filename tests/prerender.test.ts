import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { assertReadable, canonicalUrl, inject, outputFiles } from "../scripts/prerender-helpers.mjs";

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const page = (overrides: Partial<{ title: string; html: string }> = {}) => ({
  path: "/",
  title: "prxxie.dev — small, finished things",
  html: `<main id="main"><h1>Hello</h1>${"x".repeat(900)}</main>`,
  ...overrides,
});

describe("the prerender step", () => {
  it("writes both the file GitHub Pages answers without a redirect and the directory index", () => {
    expect(outputFiles("/")).toEqual([path.join(dist, "index.html")]);
    expect(outputFiles("/404")).toEqual([path.join(dist, "404.html")]);
    expect(outputFiles("/games/sokoban")).toEqual([
      path.join(dist, "games/sokoban.html"),
      path.join(dist, "games/sokoban/index.html"),
    ]);
    expect(outputFiles("/devlog/hello-retro-world")).toEqual([
      path.join(dist, "devlog/hello-retro-world.html"),
      path.join(dist, "devlog/hello-retro-world/index.html"),
    ]);
  });

  it("canonicalises to the slash-less URL on the root user site", () => {
    expect(canonicalUrl("/")).toBe("https://prxxie.github.io/");
    expect(canonicalUrl("/devlog/a-post")).toBe("https://prxxie.github.io/devlog/a-post");
  });

  it("injects the rendered markup and the route title into the shell template", () => {
    const template = '<html><head><title>shell</title></head><body><div id="root"></div></body></html>';
    const html = inject(template, page());

    expect(html).toContain("<title>prxxie.dev — small, finished things</title>");
    expect(html).toContain('<link rel="canonical" href="https://prxxie.github.io/" />');
    expect(html).toContain('<div id="root"><main id="main"><h1>Hello</h1>');
    expect(html).not.toContain(">shell<");
  });

  it("refuses a template it cannot render into", () => {
    expect(() => inject("<html></html>", page())).toThrow(/no <div id="root">/);
  });

  it("names an empty document, an unfinished boundary and a rendered board as build failures", () => {
    expect(() => assertReadable("/devlog/x", page({ html: '<main id="main"></main>' }))).toThrow(
      /prerender failed for \/devlog\/x: only \d+ bytes/,
    );
    expect(() => assertReadable("/", page({ title: " " }))).toThrow(/no title/);
    expect(() =>
      assertReadable("/", page({ html: `<main id="main"><h1>a</h1><!--$!--><template data-msg="suspended"></template>${"x".repeat(900)}` })),
    ).toThrow(/Suspense boundary never finished/);
    expect(() =>
      assertReadable(
        "/games/sokoban",
        page({
          html: `<main id="main"><h1>a</h1><section data-game-container="sokoban"><div data-game-board=""></div></section>${"x".repeat(900)}`,
        }),
      ),
    ).toThrow(/no loading placeholder/);
  });

  it("accepts a game document that carries the container and the placeholder", () => {
    const html = `<main id="main"><h1>Sokoban</h1><section data-game-container="sokoban"><div data-game-placeholder="">Loading</div></section>${"x".repeat(900)}`;

    expect(() => assertReadable("/games/sokoban", page({ html }))).not.toThrow();
  });
});

describe("the build script", () => {
  const script = readFileSync(path.join(root, "scripts/build-static.sh"), "utf8");

  it("runs the prerender after the artifact is assembled and before it is published", () => {
    const shellCopy = script.lastIndexOf("cp -r packages/shell/dist/* dist/");
    const prerender = script.indexOf("node scripts/prerender.mjs");

    expect(shellCopy).toBeGreaterThan(-1);
    expect(prerender).toBeGreaterThan(shellCopy);
    expect(script.indexOf("deploy", prerender)).toBe(-1);
  });

  it("keeps the build failing when the prerender step fails", () => {
    expect(script.startsWith("#!/bin/bash\nset -e")).toBe(true);
  });
});

describe("GitHub Pages hosting", () => {
  const script = readFileSync(path.join(root, "scripts/build-static.sh"), "utf8");
  const shellConfig = readFileSync(path.join(root, "packages/shell/vite.config.ts"), "utf8");

  it("marks the artifact so Pages serves it verbatim", () => {
    expect(script).toContain("touch dist/.nojekyll");
  });

  it("bakes no base path into the asset URLs", () => {
    expect(shellConfig).not.toMatch(/^\s*base:/m);
  });

  it("needs no rewrite rule, redirect page or service worker to fake clean URLs", () => {
    expect(script).not.toContain("_redirects");
    expect(script).not.toContain("404.html?");
    expect(readFileSync(path.join(root, "packages/shell/index.html"), "utf8")).not.toContain("serviceWorker");
  });
});
