import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const read = (file: string): string => readFileSync(path.join(root, file), "utf8");

const stylesheet = read("packages/shell/src/index.css");
const header = read("packages/shell/src/components/regions/Header.tsx");
const footer = read("packages/shell/src/components/regions/Footer.tsx");
const regions = [header, footer].join("\n");

const block = (selector: string): string => {
  const start = stylesheet.indexOf(selector);
  if (start === -1) throw new Error(`missing selector: ${selector}`);

  return stylesheet.slice(start, stylesheet.indexOf("}", start));
};

describe("the chrome", () => {
  it("draws the focus ring in the action colour, offset so it is not clipped", () => {
    const ring = block(":focus-visible");

    expect(ring).toContain("outline: 2px solid var(--color-primary)");
    expect(ring).toContain("outline-offset: 2px");
  });

  it("never clips a control inside a surface", () => {
    expect(block(".panel {")).not.toContain("overflow: hidden");
    expect(block("body {")).not.toContain("overflow-x: hidden");
    expect(regions).not.toMatch(/overflow-hidden/);
  });

  it("lets the navigation and the header wrap at 360px instead of scrolling sideways", () => {
    expect(header).toMatch(/<nav[^>]*className="[^"]*flex-wrap/);
    expect(header).toMatch(/max-w-5xl flex-wrap/);
    expect(header).toContain("whitespace-nowrap");
    expect(block(".btn {")).toContain("white-space: nowrap");
  });

  it("removes every animation and transition under prefers-reduced-motion", () => {
    const reduce = stylesheet.slice(stylesheet.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(reduce).toContain("animation: none !important");
    expect(reduce).toContain("transition: none !important");
    expect(reduce).toMatch(/^\s*\*\s*,/m);
    expect(reduce).toContain("scroll-behavior: auto !important");
  });

  it("gives the primary button the full state recipe", () => {
    expect(block(".btn-primary {")).toContain("background-color: var(--color-primary)");
    expect(block(".btn-primary:hover {")).toContain("var(--color-primary-active)");
    expect(block(".btn-primary:active {")).toContain("var(--color-primary-active)");
    expect(block('.btn:disabled,')).toContain("var(--color-primary-disabled)");
    expect(block('.btn:disabled,')).toContain("cursor: not-allowed");
  });
});
