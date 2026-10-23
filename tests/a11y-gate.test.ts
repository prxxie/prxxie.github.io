import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { CONTRAST_PAIRS, checkContrast, contrastRatio, readTokens, seriousViolations } from "../scripts/a11y-gate.mjs";

/** The tokens as the stylesheet ships them — the gate must pass on these (AC3). */
const shippedTokens = () => {
  const source = readFileSync(path.resolve(__dirname, "../packages/shell/src/index.css"), "utf8");
  const theme = /@theme static \{([\s\S]*?)\n\}/.exec(source);
  const tokens = new Map<string, string>();

  if (theme === null) throw new Error("the stylesheet declares no @theme static block");

  for (const [, name, value] of theme[1].matchAll(/--(color-[a-z-]+):\s*(#[0-9a-f]{6});/gi)) {
    tokens.set(name, value);
  }

  return tokens;
};

describe("the accessibility gate", () => {
  it("measures the WCAG ratio between two colours", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#ffffff", "#ffffff")).toBeCloseTo(1, 1);
    expect(contrastRatio("#777777", "#ffffff")).toBeCloseTo(4.48, 1);
  });

  it("reads the tokens from the compiled :root block, ignoring what it cannot parse", () => {
    const tokens = readTokens(":root{--color-ink:#141413;--color-canvas:#faf9f5;--radius-md:8px}");

    expect(tokens.get("color-ink")).toBe("#141413");
    expect(tokens.get("color-canvas")).toBe("#faf9f5");
    expect(tokens.has("radius-md")).toBe(false);
  });

  it("refuses a stylesheet that declares no tokens", () => {
    expect(() => readTokens("body{color:red}")).toThrow(/no :root block/);
  });

  it("passes a tree whose every declared pair clears its minimum", () => {
    const { findings, measured } = checkContrast(shippedTokens());

    expect(findings).toEqual([]);
    expect(measured).toHaveLength(CONTRAST_PAIRS.length);
  });

  it("fails a seeded contrast violation and names the pair (AC2)", () => {
    const tokens = shippedTokens();

    tokens.set("color-success", "#5db872");

    const { findings } = checkContrast(tokens);

    expect(findings).toHaveLength(1);
    expect(findings[0].pair).toBe("color-success on color-canvas");
    expect(findings[0].reason).toMatch(/2\.\d+:1 is below the 4\.5:1/);
  });

  it("treats a missing token as a failure rather than a skip", () => {
    const tokens = shippedTokens();

    tokens.delete("color-on-dark");

    const missing = checkContrast(tokens).findings.find((finding) => finding.pair === "color-on-dark on color-surface-dark");

    expect(missing?.reason).toMatch(/missing/);
  });

  it("fails serious and critical violations and reports the rest", () => {
    const results = {
      violations: [
        { id: "image-alt", impact: "critical", help: "Images must have alternate text", nodes: [{ target: ["img.hero"] }] },
        { id: "landmark-one-main", impact: "moderate", help: "Document should have one main landmark", nodes: [{ target: ["html"] }] },
        { id: "listitem", impact: "serious", help: "li must be in ul", nodes: [{ target: ["li", "span"] }] },
      ],
    };

    expect(seriousViolations(results)).toEqual([
      { id: "image-alt", impact: "critical", help: "Images must have alternate text", nodes: ["img.hero"] },
      { id: "listitem", impact: "serious", help: "li must be in ul", nodes: ["li span"] },
    ]);
  });
});
