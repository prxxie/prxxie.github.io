import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

/*
 * Module Federation registers each remote under its package name, so a host
 * alias spelled `posts/content` silently becomes the remote module
 * `./content` in a production build — and throws at runtime, because the
 * remote does not expose it. The prerender step cannot catch it: the SSR
 * config resolves the alias to a local file. US-DEVLOG-002 shipped that bug.
 */
const config = readFileSync(path.resolve(__dirname, "../packages/shell/vite.config.ts"), "utf8");

const remotes = [...(/const mfePackages = \[([^\]]+)\]/.exec(config)?.[1] ?? "").matchAll(/"([^"]+)"/g)].map(
  (match) => match[1],
);

const aliasKeys = [...config.matchAll(/^\s+"([^"]+)":\s*resolve\(/gm)].map((match) => match[1]);

describe("host aliases and federated remotes", () => {
  it("knows the remotes the host registers", () => {
    expect(remotes).toEqual(["about", "posts", "pets", "shikaku", "sokoban", "slitherlink"]);
  });

  it("never starts an alias with a remote name", () => {
    expect(aliasKeys.length).toBeGreaterThan(0);

    const collisions = aliasKeys.filter((key) => remotes.includes(key.split("/")[0]));

    expect(collisions).toEqual([]);
  });
});
