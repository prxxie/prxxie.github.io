import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!["dist", "node_modules", ".git"].includes(entry.name)) walk(path, out);
    } else if (/\.(ts|tsx|json|yml|yaml|sh)$/.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}

const sources = walk(join(root, "packages")).filter((path) => !path.endsWith("package.json"));
const workflows = walk(join(root, ".github"));
const manifests = readdirSync(join(root, "packages"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(root, "packages", entry.name, "package.json"));

describe("progress is local only", () => {
  it("keeps no supabase code in the packages", () => {
    const offenders = sources.filter((path) => /supabase/i.test(readFileSync(path, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("references no supabase secret or client in the workflows", () => {
    const offenders = workflows.filter((path) => /SUPABASE/i.test(readFileSync(path, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("declares no supabase dependency", () => {
    const offenders = manifests.filter((path) => /supabase/i.test(readFileSync(path, "utf8")));
    expect(offenders).toEqual([]);
  });

  it("builds the progress service on the local adaptor", () => {
    const hook = readFileSync(join(root, "packages/shell/src/hooks/useProgressService.tsx"), "utf8");
    expect(hook).toContain("new LocalProgressRepository()");
    expect(hook).not.toContain("Supabase");
  });
});
