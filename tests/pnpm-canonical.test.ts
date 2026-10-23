import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..");
interface Manifest {
  packageManager?: string;
  workspaces?: string[];
  files?: string[];
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
}

const read = (path: string) => readFileSync(join(root, path), "utf8");
const readJson = (path: string): Manifest =>
  JSON.parse(read(path)) as Manifest;

const packages = readdirSync(join(root, "packages"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe("pnpm is the only package manager", () => {
  it("pins the package manager in the root manifest", () => {
    const manifest = readJson("package.json");
    expect(manifest.packageManager).toMatch(/^pnpm@\d+\.\d+\.\d+$/);
    expect(manifest.workspaces).toBeUndefined();
  });

  it("declares every internal dependency as a workspace link", () => {
    const offenders = packages
      .map((name) => ({ name, manifest: readJson(`packages/${name}/package.json`) }))
      .filter(({ manifest }) => {
        const specifier = manifest.dependencies?.shared;
        return specifier !== undefined && specifier !== "workspace:*";
      })
      .map(({ name }) => name);

    expect(offenders).toEqual([]);
  });

  it("publishes the shared sources to the packages that import them", () => {
    const manifest = readJson("packages/shared/package.json");
    expect(manifest.files).toEqual(["src"]);
  });

  it("keeps a single lockfile at the root", () => {
    const strays = packages
      .flatMap((name) => [
        `packages/${name}/package-lock.json`,
        `packages/${name}/pnpm-lock.yaml`,
        `packages/${name}/yarn.lock`,
      ])
      .filter((path) => existsSync(join(root, path)));

    expect(strays).toEqual([]);
    expect(existsSync(join(root, "pnpm-lock.yaml"))).toBe(true);
  });

  it("runs the workspace from pnpm in the root scripts", () => {
    const scripts = readJson("package.json").scripts ?? {};
    expect(scripts.dev).toContain("pnpm");
    expect(scripts.build).toContain("pnpm");
    expect(scripts.dev).not.toContain("npm run");
    expect(scripts.build).not.toContain("npm run");
  });

  it("builds the deploy artifact with pnpm", () => {
    const script = read("scripts/build-static.sh");
    expect(script).toContain("pnpm -F");
    expect(script).not.toMatch(/^\s*npm run/m);
  });

  it("installs with pnpm and a frozen lockfile in the deploy workflow", () => {
    const workflow = read(".github/workflows/deploy.yml");
    expect(workflow).toContain("pnpm/action-setup");
    expect(workflow).toContain("--frozen-lockfile");
    expect(workflow).not.toMatch(/run: npm install/);
  });
});
