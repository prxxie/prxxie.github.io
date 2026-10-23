/**
 * The pure part of `scripts/prerender.mjs`, kept importable: paths, template
 * injection and the checks that make a bad document fail the build by name.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const distDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../dist");

/** The origin the site is published on (OQ-08): a root user site, no base path. */
export const SITE_ORIGIN = "https://prxxie.github.io";

/**
 * The canonical URL is slash-less (AC1, AC2): GitHub Pages answers a directory
 * path with a redirect to the trailing-slash form, so the slash-less URL is the
 * one that stays put.
 */
export function canonicalUrl(route) {
  return route === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${route}`;
}

/**
 * GitHub Pages serves `/games/sokoban` with a 200 only when `games/sokoban.html`
 * exists; the directory index serves the trailing-slash form. Both are written so
 * neither URL 404s and neither needs a rewrite rule.
 */
export function outputFiles(route) {
  if (route === "/") return [path.join(distDir, "index.html")];
  if (route === "/404") return [path.join(distDir, "404.html")];

  return [path.join(distDir, `${route}.html`), path.join(distDir, route, "index.html")];
}

export function assertReadable(route, page) {
  const fail = (reason) => {
    throw new Error(`prerender failed for ${route}: ${reason}`);
  };

  if (!page.title || page.title.trim() === "") fail("no title");
  if (!page.html.includes("<main")) fail("no main region");
  if (!page.html.includes('id="main"')) fail("no skip-link target");
  if (page.html.includes("data-msg=")) fail("a Suspense boundary never finished on the server");
  if (page.html.length < 800) fail(`only ${page.html.length} bytes of markup`);
  if (route !== "/404" && !/<h1[^>]*>/.test(page.html)) fail("no headline");

  if (route.startsWith("/games/")) {
    if (!page.html.includes("data-game-container")) fail("no game container");
    if (!page.html.includes("data-game-placeholder")) fail("no loading placeholder");
    if (page.html.includes("data-game-board")) fail("a board was rendered during the build");
  }
}

export function inject(template, page) {
  const withTitle = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`);
  const withCanonical = withTitle.includes("</head>")
    ? withTitle.replace("</head>", `    <link rel="canonical" href="${canonicalUrl(page.path)}" />\n  </head>`)
    : withTitle;

  if (!withCanonical.includes('<div id="root"></div>')) {
    throw new Error('the shell template has no <div id="root"></div> to render into');
  }

  return withCanonical.replace('<div id="root"></div>', `<div id="root">${page.html}</div>`);
}
