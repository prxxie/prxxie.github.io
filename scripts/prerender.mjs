#!/usr/bin/env node
/**
 * US-SITE-003: one HTML document per route.
 *
 * Renders the route table through React Router's static handler, writes
 * `dist/<path>/index.html` for every entry, and leaves `dist/route-manifest.json`
 * behind for the accessibility gate (US-FND-006) and the sitemap (US-LAUNCH-002).
 *
 * Runs after `scripts/build-static.sh` has copied the shell and the remotes into
 * `dist/`, and before anything is published (AC6).
 */
import { build } from "vite";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { assertReadable, inject, outputFiles } from "./prerender-helpers.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shellDir = path.join(root, "packages/shell");
const distDir = path.join(root, "dist");
const ssrDir = path.join(shellDir, ".prerender");
const postsDir = path.join(root, "packages/posts/src/content/posts");

/** `hello-retro-world.md` → `hello-retro-world`; the slug is the file name. */
async function readPostSlugs() {
  const entries = await readdir(postsDir).catch(() => []);

  return entries.filter((entry) => entry.endsWith(".md")).map((entry) => entry.replace(/\.md$/, ""));
}

/** AC3/AC4/AC5: a document that cannot stand alone fails the build, named. */
async function main() {
  const postSlugs = await readPostSlugs();

  await rm(ssrDir, { recursive: true, force: true });
  await build({
    root: shellDir,
    configFile: path.join(shellDir, "vite.ssr.config.ts"),
    logLevel: "warn",
  });

  const entry = pathToFileURL(path.join(ssrDir, "entry-server.js")).href;
  const { listRoutes, renderPage } = await import(entry);
  // The template is the shell's own SPA output, never `dist/index.html`: the
  // prerendered front page replaces that file, and it must stay reproducible.
  const template = await readFile(path.join(shellDir, "dist/index.html"), "utf8");
  const manifest = [];

  for (const route of listRoutes(postSlugs)) {
    const page = await renderPage(route);
    assertReadable(route, page);

    const html = inject(template, page);
    const files = outputFiles(route);

    for (const file of files) {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, html, "utf8");
    }

    manifest.push({
      path: route,
      title: page.title,
      file: path.relative(distDir, files[files.length - 1]),
      files: files.map((file) => path.relative(distDir, file)),
    });
  }

  await writeFile(path.join(distDir, "route-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await rm(ssrDir, { recursive: true, force: true });

  console.log(`prerendered ${manifest.length} routes into dist/`);
}

// Importable from the test suite; only a direct run builds and writes.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
