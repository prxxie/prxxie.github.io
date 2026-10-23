#!/usr/bin/env node
/**
 * US-FND-006: accessibility is a gate, not an audit (ADR-0008).
 *
 * Two passes, both on the built artifact only:
 *   1. axe-core over every prerendered document in `dist/route-manifest.json` —
 *      landmarks, headings, labels, ARIA, duplicate ids. Serious and critical
 *      violations fail; moderate and minor are reported for triage.
 *   2. colour contrast over the design tokens, because a headless parser has no
 *      layout and cannot measure a painted element. Every text-on-surface pair the
 *      design system declares is measured against the WCAG 2.2 AA ratio (4.5:1 for
 *      body copy, 3:1 for large text and UI edges).
 *
 * Writes `dist/a11y-report.json` and exits non-zero on the first failure, naming
 * the route (or token pair) and the node.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { JSDOM } from "jsdom";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.join(root, "dist");

/** Text on surface pairs the design system ships, with the ratio each one needs. */
export const CONTRAST_PAIRS = [
  { foreground: "color-ink", background: "color-canvas", minimum: 4.5, note: "body copy on the page" },
  { foreground: "color-ink", background: "color-surface-card", minimum: 4.5, note: "a headline on a card" },
  { foreground: "color-body", background: "color-canvas", minimum: 4.5, note: "secondary copy on the page" },
  { foreground: "color-body", background: "color-surface-card", minimum: 4.5, note: "secondary copy on a card" },
  { foreground: "color-muted", background: "color-canvas", minimum: 4.5, note: "small labels on the page" },
  { foreground: "color-muted", background: "color-surface-card", minimum: 4.5, note: "small labels on a card" },
  { foreground: "color-ink", background: "color-primary", minimum: 4.5, note: "ink on a coral fill" },
  { foreground: "color-on-dark", background: "color-surface-dark", minimum: 4.5, note: "text on the inverted surface" },
  { foreground: "color-on-dark-soft", background: "color-surface-dark", minimum: 4.5, note: "secondary text on the inverted surface" },
  { foreground: "color-on-dark-soft", background: "color-surface-dark-elevated", minimum: 4.5, note: "secondary text on a raised inverted surface" },
  { foreground: "color-primary", background: "color-surface-dark", minimum: 4.5, note: "the coral link on the inverted surface" },
  { foreground: "color-primary-active", background: "color-canvas", minimum: 4.5, note: "a link on the page" },
  { foreground: "color-primary-active", background: "color-surface-card", minimum: 4.5, note: "a link on a card" },
  { foreground: "color-accent-teal", background: "color-surface-dark", minimum: 4.5, note: "the teal label on the inverted surface" },
  { foreground: "color-accent-teal", background: "color-surface-dark-elevated", minimum: 4.5, note: "the teal label on a raised inverted surface" },
  { foreground: "color-success-on-dark", background: "color-surface-dark", minimum: 4.5, note: "a status dot on the inverted surface" },
  { foreground: "color-success-on-dark", background: "color-surface-dark-elevated", minimum: 4.5, note: "a status dot on a raised inverted surface" },
  { foreground: "color-warning-on-dark", background: "color-surface-dark", minimum: 4.5, note: "a warning on the inverted surface" },
  { foreground: "color-error-on-dark", background: "color-surface-dark", minimum: 4.5, note: "an error on the inverted surface" },
  { foreground: "color-error", background: "color-canvas", minimum: 4.5, note: "an error message on the page" },
  { foreground: "color-success", background: "color-canvas", minimum: 4.5, note: "a success message on the page" },
];

const RULES_OF_CONCERN = ["serious", "critical"];

export function luminance(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? [...value].map((digit) => digit + digit).join("") : value;

  if (!/^[0-9a-f]{6}$/i.test(full)) {
    throw new Error(`not a hex colour: ${hex}`);
  }

  const channel = (offset) => {
    const srgb = parseInt(full.slice(offset, offset + 2), 16) / 255;

    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export function contrastRatio(foreground, background) {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The colour tokens as the built stylesheet declares them. The theme block is
 * compiled into `:root`, so that is where the values are read from.
 */
export function readTokens(css) {
  const tokens = new Map();
  const root = css.match(/:root[^{]*\{([\s\S]*?)\}/);

  if (!root) throw new Error("the built stylesheet declares no :root block");

  for (const [, name, value] of root[1].matchAll(/--([a-z0-9-]+):\s*(#[0-9a-f]{3,8});/gi)) {
    tokens.set(name, value);
  }

  return tokens;
}

export function checkContrast(tokens) {
  const findings = [];
  const measured = [];

  for (const pair of CONTRAST_PAIRS) {
    const foreground = tokens.get(pair.foreground);
    const background = tokens.get(pair.background);

    if (!foreground || !background) {
      findings.push({ pair: `${pair.foreground} on ${pair.background}`, reason: "a token the pair needs is missing" });
      continue;
    }

    const ratio = Number(contrastRatio(foreground, background).toFixed(2));
    measured.push({ pair: `${pair.foreground} on ${pair.background}`, ratio, minimum: pair.minimum, note: pair.note });

    if (ratio < pair.minimum) {
      findings.push({
        pair: `${pair.foreground} on ${pair.background}`,
        reason: `${ratio}:1 is below the ${pair.minimum}:1 this pair needs`,
        note: pair.note,
      });
    }
  }

  return { measured, findings };
}

export function seriousViolations(results) {
  return results.violations
    .filter((violation) => RULES_OF_CONCERN.includes(violation.impact ?? "minor"))
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      help: violation.help,
      nodes: violation.nodes.map((node) => node.target.join(" ")),
    }));
}

/** The stylesheets the front page actually links, so a stale asset in `dist/` is ignored. */
async function readStylesheet() {
  const html = await readFile(path.join(distDir, "index.html"), "utf8");
  const hrefs = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map((match) => match[1]);

  if (hrefs.length === 0) throw new Error("the front page links no stylesheet — run the build first");

  return (
    await Promise.all(
      hrefs.map((href) => readFile(path.join(distDir, href.replace(/^\//, "")), "utf8")),
    )
  ).join("\n");
}

async function auditRoute(route, file, axe) {
  const html = await readFile(path.join(distDir, file), "utf8");
  const dom = new JSDOM(html, { runScripts: "outside-only", pretendToBeVisual: true });

  // jsdom paints nothing: give canvas a stub so the label rules can measure text
  // without throwing "not implemented" onto the console for every node.
  dom.window.HTMLCanvasElement.prototype.getContext = () => ({
    measureText: () => ({ width: 0 }),
    getImageData: () => ({ data: [] }),
  });
  dom.window.eval(axe.source);
  const results = await dom.window.axe.run(dom.window.document, {
    // Contrast is measured on the tokens instead: jsdom paints nothing.
    rules: { "color-contrast": { enabled: false } },
  });
  dom.window.close();

  return seriousViolations(results);
}

async function main() {
  const manifest = JSON.parse(await readFile(path.join(distDir, "route-manifest.json"), "utf8"));
  const axe = await import("axe-core");
  const { measured, findings } = checkContrast(readTokens(await readStylesheet()));

  const routes = [];

  for (const entry of manifest) {
    const violations = await auditRoute(entry.path, entry.file, axe.default ?? axe);

    routes.push({ path: entry.path, file: entry.file, serious: violations.length, violations });
  }

  const failingRoutes = routes.filter((route) => route.serious > 0);
  const report = {
    checkedRoutes: routes.length,
    routes,
    contrast: measured,
    contrastFindings: findings,
    passed: failingRoutes.length === 0 && findings.length === 0,
  };

  await writeFile(path.join(distDir, "a11y-report.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");

  for (const route of failingRoutes) {
    for (const violation of route.violations) {
      console.error(`${route.path}: ${violation.id} (${violation.impact}) — ${violation.help} — ${violation.nodes.join(", ")}`);
    }
  }

  for (const finding of findings) {
    console.error(`contrast: ${finding.pair} — ${finding.reason}`);
  }

  console.log(`a11y gate: checked ${routes.length} routes and ${measured.length} contrast pairs`);

  if (!report.passed) process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
