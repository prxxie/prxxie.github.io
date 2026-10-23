import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { assertReadable, canonicalUrl, inject, outputFiles, robotsTxt, sitemap } from "../scripts/prerender-helpers.mjs";

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const page = (overrides: Partial<{ title: string; description: string; html: string }> = {}) => ({
  path: "/",
  title: "prxxie.dev — small, finished things",
  description: "prxxie builds small, finished things.",
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

describe("share metadata (US-LAUNCH-001)", () => {
  const helpers = readFileSync(path.join(root, "scripts/prerender-helpers.mjs"), "utf8");
  const entry = readFileSync(path.join(root, "packages/shell/src/entry-server.tsx"), "utf8");

  it("describes every route in one sentence, including a fallback for a route added later", () => {
    expect(entry).toContain("export function descriptionForPath");
    expect(entry).toContain("descriptionForPath(pathname)");
    expect(entry).toMatch(/return "prxxie builds small, finished things/);
  });

  it("emits the description, the Open Graph tags and a large share card", () => {
    for (const tag of ['"description"', '"og:title"', '"og:description"', '"og:image"', '"og:image:alt"']) {
      expect(helpers).toContain(tag);
    }
    expect(helpers).toContain('["name", "twitter:card", "summary_large_image"]');
  });

  it("points the share image at an absolute URL that the build copies", () => {
    expect(helpers).toContain("${SITE_ORIGIN}${SHARE_IMAGE.path}");
    expect(helpers).toContain('path: "/og.png"');
    expect(helpers).toContain('width: "1200"');
    expect(helpers).toContain('height: "630"');
  });

  it("calls a post an article and everything else a website", () => {
    expect(helpers).toContain('page.path.startsWith("/devlog/") ? "article" : "website"');
  });

  it("refuses to prerender a route with no description", () => {
    expect(helpers).toContain('if (!page.description || page.description.trim() === "") fail("no description")');
  });
});

describe("the share card on disk (US-LAUNCH-001)", () => {
  const png = readFileSync(path.join(root, "public/og.png"));

  it("is a real 1200x630 PNG, not a placeholder", () => {
    expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });

  it("is drawn by a script the build runs, so it cannot go stale by hand", () => {
    const scripts = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const build = readFileSync(path.join(root, "scripts/build-static.sh"), "utf8");

    expect(scripts.scripts["build:assets"]).toBe("node scripts/make-og-image.mjs");
    expect(build).toContain("pnpm run build:assets");
    expect(build.indexOf("pnpm run build:assets")).toBeLessThan(build.indexOf("pnpm -F shell run build"));
  });
});

describe("the crawl surface (US-LAUNCH-002)", () => {
  const routes = ["/", "/games", "/games/sokoban", "/devlog", "/devlog/hello-retro-world", "/404"];

  it("lists every prerendered route with its canonical URL, once each", () => {
    const xml = sitemap(routes);
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

    expect(locs).toEqual([
      "https://prxxie.github.io/",
      "https://prxxie.github.io/games",
      "https://prxxie.github.io/games/sokoban",
      "https://prxxie.github.io/devlog",
      "https://prxxie.github.io/devlog/hello-retro-world",
    ]);
    expect(new Set(locs).size).toBe(locs.length);
  });

  it("declares the sitemap namespace and stays well formed", () => {
    const xml = sitemap(routes);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect((xml.match(/<urlset/g) ?? []).length).toBe(1);
    expect((xml.match(/<\/urlset>/g) ?? []).length).toBe(1);
  });

  it("keeps the 404 page out of the sitemap and out of crawling", () => {
    expect(sitemap(routes)).not.toContain("/404");
    expect(robotsTxt()).toContain("Disallow: /404");
    expect(robotsTxt()).toContain("Sitemap: https://prxxie.github.io/sitemap.xml");
  });

  it("allows the site and points at the sitemap", () => {
    const robots = robotsTxt();

    expect(robots).toContain("User-agent: *");
    expect(robots).toContain("Allow: /");
  });

  it("is written by the prerender step from the manifest, not by hand", () => {
    const script = readFileSync(path.join(root, "scripts/prerender.mjs"), "utf8");

    expect(script).toContain('"sitemap.xml"');
    expect(script).toContain('"robots.txt"');
    expect(script).toContain("sitemap(manifest.map((entry) => entry.path))");
  });
});
