import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const workflow = readFileSync(join(__dirname, "..", ".github/workflows/deploy.yml"), "utf8");

const position = (needle: string) => workflow.indexOf(needle);

describe("the deploy workflow refuses a red tree", () => {
  it("runs the suite, the linter and the type checker", () => {
    expect(position("run: pnpm test")).toBeGreaterThan(-1);
    expect(position("run: pnpm run lint")).toBeGreaterThan(-1);
    expect(position("run: pnpm run typecheck")).toBeGreaterThan(-1);
  });

  it("runs the gates before the game bundles are downloaded and the site is assembled", () => {
    const gates = Math.max(
      position("run: pnpm test"),
      position("run: pnpm run lint"),
      position("run: pnpm run typecheck"),
    );
    expect(gates).toBeLessThan(position("Download MFE pre-built artifacts"));
    expect(gates).toBeLessThan(position("run: pnpm run build:static"));
    expect(gates).toBeLessThan(position("peaceiris/actions-gh-pages"));
  });

  it("publishes only through a job that needs the gates", () => {
    expect(workflow).toMatch(/build-and-deploy:\s*\n\s*needs: verify/);
  });

  it("installs a frozen pnpm tree with a warm store", () => {
    expect(workflow).toContain("pnpm install --frozen-lockfile");
    expect(workflow).toContain("cache: pnpm");
  });

  it("keeps a deploy triggered by a game release", () => {
    expect(workflow).toContain("repository_dispatch");
    expect(workflow).toContain("mfe-updated");
  });

  it("reports the dependency audit without blocking the deploy", () => {
    const audit = workflow.slice(position("pnpm audit --prod") - 120, position("pnpm audit --prod"));
    expect(audit).toContain("continue-on-error: true");
  });
});
