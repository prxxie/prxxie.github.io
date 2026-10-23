#!/usr/bin/env node
/**
 * US-HOME-003: the proof section prints numbers the build measured, never numbers
 * somebody typed. This script runs the gates that need no artifact, counts what it
 * can read, and writes the facts both to the source tree (so the page can import
 * them at build time) and to `dist/` once the artifact exists.
 *
 * A gate that fails stops the script: the build never reaches the page.
 */
import { execFile } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "packages/shell/src/generated/build-facts.json");

const GATES = [
  { name: "typecheck", command: "npx", args: ["tsc", "--noEmit"] },
  { name: "lint", command: "npx", args: ["eslint", ".", "--max-warnings=0"] },
  { name: "test", command: "npx", args: ["vitest", "run", "--reporter=json", "--outputFile=/tmp/vitest-facts.json"] },
];

async function runGate(gate) {
  try {
    await run(gate.command, gate.args, { cwd: root, maxBuffer: 64 * 1024 * 1024 });
    return { name: gate.name, passing: true };
  } catch (error) {
    const detail = error instanceof Error ? error.message.split("\n")[0] : String(error);
    throw new Error(`[build-facts] the ${gate.name} gate failed, so the proof cannot claim it: ${detail}`);
  }
}

/** The count the test runner actually reported, and the files it found them in. */
async function testCounts() {
  const report = JSON.parse(await readFile("/tmp/vitest-facts.json", "utf8"));

  return { tests: report.numTotalTests, files: await testFileCount(root) };
}

async function testFileCount(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let total = 0;

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name.startsWith(".")) continue;

    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) total += await testFileCount(entryPath);
    else if (/\.test\.tsx?$/.test(entry.name)) total += 1;
  }

  return total;
}

async function remotes() {
  const config = await readFile(path.join(root, "packages/shell/vite.config.ts"), "utf8");
  const list = /const mfePackages = \[([^\]]+)\]/.exec(config)?.[1] ?? "";

  return list.split(",").map((entry) => entry.trim().replace(/"/g, "")).filter(Boolean).length;
}

async function levels() {
  const shellConfig = await readFile(path.join(root, "packages/shell/src/routes.tsx"), "utf8");
  const counts = [...shellConfig.matchAll(/levelCount:\s*(\d+)/g)].map((match) => Number(match[1]));

  return counts.length > 0 ? counts.reduce((total, count) => total + count, 0) : null;
}

async function main() {
  const gates = [];

  for (const gate of GATES) {
    gates.push(await runGate(gate));
  }

  const { tests, files } = await testCounts();
  const facts = {
    tests,
    files,
    gates,
    remotes: await remotes(),
    levels: await levels(),
  };

  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(facts, null, 2)}\n`, "utf8");
  console.log(`build facts: ${tests} tests, ${files} files, ${facts.remotes} remotes`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
