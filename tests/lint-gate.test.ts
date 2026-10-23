import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
const config = readFileSync(join(root, "eslint.config.mjs"), "utf8");
const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  scripts: Record<string, string>;
};

describe("the lint gate", () => {
  it("fails on warnings, not only on errors", () => {
    expect(manifest.scripts.lint).toContain("--max-warnings=0");
  });

  it("lints the puzzle engines instead of excluding them", () => {
    const ignores = /ignores:\s*\[([\s\S]*?)\]/.exec(config)?.[1] ?? "";
    expect(ignores).not.toMatch(/engine/);
  });

  it("keeps type-aware rules switched on", () => {
    expect(config).toContain("recommendedTypeChecked");
    expect(config).toContain("projectService: true");
  });

  it("does not disable a rule repository-wide without a reason", () => {
    const disabled = [...config.matchAll(/"(@?[\w-]+\/[\w-]+)":\s*"off"/g)].map((match) => match[1]);
    const lines = config.split("\n");
    const unexplained = disabled.filter((rule) => {
      const index = lines.findIndex((text) => text.includes(`"${rule}"`));
      const context = [lines[index - 1] ?? "", lines[index] ?? ""].join("\n");
      return !context.includes("//");
    });
    expect(unexplained).toEqual([]);
  });
});
