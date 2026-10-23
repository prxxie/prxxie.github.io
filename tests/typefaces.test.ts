import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const shellSrc = path.join(root, "packages/shell/src");
const shellHtml = readFileSync(path.join(root, "packages/shell/index.html"), "utf8");
const stylesheet = readFileSync(path.join(shellSrc, "index.css"), "utf8");
const fontsModule = readFileSync(path.join(shellSrc, "fonts.ts"), "utf8");

describe("shipped typefaces", () => {
  it("names the self-hosted families in the token block", () => {
    expect(stylesheet).toMatch(/--font-display: "Cormorant Garamond"/);
    expect(stylesheet).toMatch(/--font-body: "Inter"/);
    expect(stylesheet).toMatch(/--font-code: "JetBrains Mono"/);
  });

  it("imports every shipped face from a local package, with the weights the design uses", () => {
    const imports = [...fontsModule.matchAll(/import "(@fontsource\/[^"]+)";/g)].map((match) => match[1]);

    expect(imports).toEqual([
      "@fontsource/inter/latin-400.css",
      "@fontsource/inter/latin-500.css",
      "@fontsource/inter/latin-600.css",
      "@fontsource/inter/latin-700.css",
      "@fontsource/cormorant-garamond/latin-400.css",
      "@fontsource/jetbrains-mono/latin-400.css",
      "@fontsource/jetbrains-mono/latin-500.css",
      "@fontsource/jetbrains-mono/latin-700.css",
    ]);
  });

  it("loads no font from a third-party origin", () => {
    const sources = [shellHtml, stylesheet, fontsModule].join("\n");

    expect(sources).not.toMatch(/fonts\.googleapis\.com/);
    expect(sources).not.toMatch(/fonts\.gstatic\.com/);
    expect(sources).not.toMatch(/cdn\.jsdelivr\.net/);
  });

  it("records the licence of every shipped family", () => {
    const notes = readFileSync(path.join(shellSrc, "fonts/LICENSE-NOTES.md"), "utf8");

    for (const family of ["Inter", "Cormorant Garamond", "JetBrains Mono"]) {
      expect(notes).toContain(family);
    }
    expect(notes).toMatch(/OFL-1\.1/);
  });

  it("declares font-display: swap for every face", () => {
    const fontsourceCss = readdirSync(path.join(root, "node_modules/.pnpm"))
      .filter((entry) => entry.startsWith("@fontsource+cormorant-garamond@"))
      .map((entry) =>
        readFileSync(
          path.join(root, "node_modules/.pnpm", entry, "node_modules/@fontsource/cormorant-garamond/latin-400.css"),
          "utf8",
        ),
      )
      .join("\n");

    expect(fontsourceCss).toContain("font-display: swap");
  });
});
