import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
const packages = readdirSync(join(root, "packages"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

function sourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "dist" && entry.name !== "node_modules") sourceFiles(path, out);
    } else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}

const files = packages.flatMap((name) => sourceFiles(join(root, "packages", name, "src")));

describe("the type gate is honest", () => {
  it("has sources to check", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it("suppresses no type error anywhere in the packages", () => {
    const offenders = files.filter((file) => /@ts-ignore|@ts-expect-error|@ts-nocheck/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("does not widen a type to escape the gate", () => {
    const offenders = files.filter((file) => /\bas any\b|<any>/.test(readFileSync(file, "utf8")));
    expect(offenders).toEqual([]);
  });
});
