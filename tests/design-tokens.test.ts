import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const shellSrc = join(__dirname, "..", "packages/shell/src");
const stylesheet = readFileSync(join(shellSrc, "index.css"), "utf8");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const sources = walk(shellSrc).filter((path) => /\.(tsx?|css)$/.test(path));
const componentSources = sources.filter((path) => path.endsWith(".tsx"));

describe("one design system", () => {
  it("keeps no trace of the amber terminal palette", () => {
    expect(stylesheet).not.toMatch(/cozy/i);
    expect(stylesheet).not.toMatch(/--font-pixel|--font-press/);
    expect(stylesheet).not.toMatch(/#FFB000|#FFC400|#FFE082|#FFF9C4|#FFD54F/i);
    expect(stylesheet).not.toMatch(/terminal-bg/);
    expect(stylesheet).not.toMatch(/\.pixel-(btn|border)/);
    expect(stylesheet).not.toMatch(/\.retro-window/);
    expect(stylesheet).not.toMatch(/daisyui/);
  });

  it("paints the body from the cream tokens", () => {
    const body = stylesheet.slice(stylesheet.indexOf("body {"), stylesheet.indexOf("}", stylesheet.indexOf("body {")));
    expect(body).toContain("var(--color-canvas)");
    expect(body).toContain("var(--color-body)");
    expect(body).not.toMatch(/#000|#FF/i);
  });

  it("leaks no legacy class into a component", () => {
    const offenders = componentSources.filter((path) =>
      /(text|bg|border)-cozy-|font-press|font-pixel|retro-window|pixel-btn|pixel-border/.test(
        readFileSync(path, "utf8"),
      ),
    );
    expect(offenders).toEqual([]);
  });

  it("declares every token it ships and uses every token it declares", () => {
    const declared = [...stylesheet.matchAll(/^\s+(--(?:color|radius|font)-[a-z-]+):/gm)].map((match) => match[1]);
    expect(declared.length).toBeGreaterThan(20);

    const consumers = sources.map((path) => readFileSync(path, "utf8"));
    const unused = declared.filter((token) => {
      // --color-primary-active -> primary-active, --radius-xl -> xl, --font-code -> code
      const tailwindName = token.slice(token.indexOf("-", 2) + 1);
      const usedByVar = consumers.some((source) => source.includes(`var(${token})`));
      const usedByClass = consumers.some((source) =>
        new RegExp(`(text|bg|border|fill|stroke|from|to|rounded|font)-${tailwindName}\\b`).test(source),
      );
      return !usedByVar && !usedByClass;
    });

    expect(unused).toEqual([]);
  });
});
