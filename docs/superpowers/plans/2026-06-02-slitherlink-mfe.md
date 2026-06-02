# Slitherlink MFE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a retro-styled Slitherlink puzzle game MFE for Cozy OS, fully integrated with sound synthesis, progress saving, star achievements, and loop validation.

**Architecture:** Monorepo remote package using React and Module Federation, exposing `./SlitherlinkApp` and saving results to `ProgressService` from `shared`.

**Tech Stack:** React 18, Vite 5, TailwindCSS (via `@tailwindcss/vite` matching siblings), Zustand 4, Framer Motion 11, Web Audio API.

---

### Task 1: Package Scaffolding & Setup

Initialize files for the `packages/slitherlink` package.

**Files:**
- Create: `packages/slitherlink/package.json`
- Create: `packages/slitherlink/vite.config.ts`
- Create: `packages/slitherlink/index.html`
- Create: `packages/slitherlink/src/main.tsx`

- [ ] **Step 1: Create `packages/slitherlink/package.json`**
  Write package configuration including dev/build scripts and federation dependencies.
  ```json
  {
    "name": "slitherlink",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite --port 3006 --strictPort",
      "dev:watch": "vite build --watch --mode development",
      "build": "vite build",
      "preview": "vite preview --port 3006"
    },
    "dependencies": {
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
      "shared": "*",
      "zustand": "^4.5.2",
      "framer-motion": "^11.2.10"
    },
    "devDependencies": {
      "@originjs/vite-plugin-federation": "^1.3.5",
      "@vitejs/plugin-react": "^4.3.0",
      "vite": "^5.2.11",
      "@tailwindcss/vite": "^4.0.0-alpha.16",
      "typescript": "^5.7.0",
      "@types/react": "^18.3.0",
      "@types/react-dom": "^18.3.0",
      "@types/node": "^22.0.0"
    }
  }
  ```

- [ ] **Step 2: Create `packages/slitherlink/vite.config.ts`**
  Write Vite bundler setup exposing `SlitherlinkApp` and importing tailwindcss.
  ```typescript
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import tailwindcss from "@tailwindcss/vite";
  import federation from "@originjs/vite-plugin-federation";

  export default defineConfig(({ command }) => {
    return {
      base: command === "build" ? "/mfe/slitherlink/" : "/",
      plugins: [
        react(),
        tailwindcss(),
        federation({
          name: "slitherlink",
          filename: "remoteEntry.js",
          exposes: {
            "./SlitherlinkApp": "./src/SlitherlinkApp.tsx",
          },
          shared: ["react", "react-dom", "zustand"],
        }),
      ],
      build: {
        target: "esnext",
        minify: false,
        cssCodeSplit: false,
      },
    };
  });
  ```

- [ ] **Step 3: Create `packages/slitherlink/index.html`**
  Create template for standalone local development testing.
  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Slitherlink Remote</title>
    </head>
    <body class="bg-black text-white">
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>
  ```

- [ ] **Step 4: Create `packages/slitherlink/src/main.tsx`**
  Define dev index launcher.
  ```typescript
  import React from "react";
  import ReactDOM from "react-dom/client";
  import SlitherlinkApp from "./SlitherlinkApp";
  import "../../shell/src/index.css";

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <div className="p-8 flex justify-center">
        <SlitherlinkApp />
      </div>
    </React.StrictMode>
  );
  ```

- [ ] **Step 5: Run npm install**
  Run command: `npm install` from root directory to register workspace.
  Expected: Success without workspace link conflicts.

- [ ] **Step 6: Commit changes**
  Run commands:
  ```bash
  rtk git add packages/slitherlink/package.json packages/slitherlink/vite.config.ts packages/slitherlink/index.html packages/slitherlink/src/main.tsx
  rtk git commit -m "feat(slitherlink): scaffold package config and main.tsx"
  ```

---

### Task 2: Core Data Types, Pre-Baked Levels, and Web Audio Synthesizer

Implement type interfaces, pre-baked levels dictionary, and RetroSynth audio helper.

**Files:**
- Create: `packages/slitherlink/src/types.ts`
- Create: `packages/slitherlink/src/levels.ts`
- Create: `packages/slitherlink/src/engine/synth.ts`

- [ ] **Step 1: Create `packages/slitherlink/src/types.ts`**
  Add schema models.
  ```typescript
  export type EdgeState = "none" | "line" | "cross";

  export interface BoardState {
    hEdges: EdgeState[][]; // size W x (H+1)
    vEdges: EdgeState[][]; // size (W+1) x H
  }

  export interface ValidationResult {
    isSolved: boolean;
    cellErrors: Record<string, boolean>;
    vertexErrors: Record<string, boolean>;
  }

  export interface Level {
    id: string;
    difficulty: "Easy" | "Medium";
    width: number;
    height: number;
    clues: Record<string, number>; // "x,y" -> clue value
    targets: {
      threeStars: number;
      twoStars: number;
    };
  }
  ```

- [ ] **Step 2: Create `packages/slitherlink/src/levels.ts`**
  Add pre-baked level configurations.
  ```typescript
  import type { Level } from "./types";

  export const SLITHERLINK_LEVELS: Level[] = [
    {
      id: "sl-easy-1",
      difficulty: "Easy",
      width: 5,
      height: 5,
      clues: {
        "0,0": 3, "2,0": 1, "4,0": 3,
        "1,1": 1, "3,1": 2,
        "2,2": 2,
        "1,3": 2, "3,3": 1,
        "0,4": 3, "2,4": 3, "4,4": 3
      },
      targets: { threeStars: 60, twoStars: 120 }
    },
    {
      id: "sl-easy-2",
      difficulty: "Easy",
      width: 5,
      height: 5,
      clues: {
        "0,1": 2, "1,0": 3, "2,1": 1, "3,0": 3, "4,1": 2,
        "2,2": 3,
        "0,3": 2, "2,3": 2, "4,3": 2,
        "1,4": 3, "3,4": 3
      },
      targets: { threeStars: 90, twoStars: 180 }
    },
    {
      id: "sl-easy-3",
      difficulty: "Easy",
      width: 5,
      height: 5,
      clues: {
        "1,1": 2, "2,1": 0, "3,1": 2,
        "2,2": 1,
        "1,3": 2, "2,3": 2, "3,3": 2
      },
      targets: { threeStars: 75, twoStars: 150 }
    },
    {
      id: "sl-easy-4",
      difficulty: "Easy",
      width: 5,
      height: 5,
      clues: {
        "0,0": 2, "1,0": 2, "3,0": 3,
        "0,2": 3, "2,2": 2, "4,2": 1,
        "3,4": 2, "4,4": 2
      },
      targets: { threeStars: 80, twoStars: 160 }
    },
    {
      id: "sl-easy-5",
      difficulty: "Easy",
      width: 5,
      height: 5,
      clues: {
        "1,1": 3, "3,1": 3,
        "2,2": 2,
        "1,3": 1, "3,3": 1
      },
      targets: { threeStars: 50, twoStars: 100 }
    },
    {
      id: "sl-med-1",
      difficulty: "Medium",
      width: 6,
      height: 6,
      clues: {
        "0,0": 3, "2,0": 2, "4,0": 2,
        "1,1": 3, "3,1": 1, "5,1": 2,
        "0,2": 1, "2,2": 2, "4,2": 2,
        "1,3": 2, "3,3": 3, "5,3": 1,
        "0,4": 2, "2,4": 1, "4,4": 2,
        "1,5": 3, "3,5": 2, "5,5": 3
      },
      targets: { threeStars: 150, twoStars: 300 }
    },
    {
      id: "sl-med-2",
      difficulty: "Medium",
      width: 6,
      height: 6,
      clues: {
        "0,1": 2, "2,1": 3, "4,1": 2,
        "1,2": 1, "3,2": 2, "5,2": 1,
        "0,3": 3, "2,3": 0, "4,3": 3,
        "1,4": 2, "3,4": 2, "5,4": 2
      },
      targets: { threeStars: 180, twoStars: 360 }
    },
    {
      id: "sl-med-3",
      difficulty: "Medium",
      width: 6,
      height: 6,
      clues: {
        "1,0": 3, "3,0": 3,
        "1,2": 2, "2,2": 2, "3,2": 2, "4,2": 2,
        "1,4": 1, "2,4": 3, "3,4": 3, "4,4": 1
      },
      targets: { threeStars: 200, twoStars: 400 }
    },
    {
      id: "sl-med-4",
      difficulty: "Medium",
      width: 6,
      height: 6,
      clues: {
        "0,0": 2, "5,0": 2,
        "1,1": 2, "4,1": 2,
        "2,2": 3, "3,2": 3,
        "2,3": 1, "3,3": 1,
        "1,4": 3, "4,4": 3,
        "0,5": 2, "5,5": 2
      },
      targets: { threeStars: 160, twoStars: 320 }
    },
    {
      id: "sl-med-5",
      difficulty: "Medium",
      width: 6,
      height: 6,
      clues: {
        "0,0": 3, "1,0": 2, "4,0": 2, "5,0": 3,
        "2,2": 1, "3,2": 1,
        "2,3": 2, "3,3": 2,
        "0,5": 3, "1,5": 1, "4,5": 1, "5,5": 3
      },
      targets: { threeStars: 170, twoStars: 340 }
    }
  ];
  ```

- [ ] **Step 3: Create `packages/slitherlink/src/engine/synth.ts`**
  Implement retro audio effects.
  ```typescript
  declare global {
    interface Window {
      webkitAudioContext?: typeof AudioContext;
    }
  }

  class RetroSynth {
    private ctx: AudioContext | null = null;
    private muted = false;

    init(): void {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        void this.ctx.resume().catch((err) => {
          console.warn("Failed to resume AudioContext:", err);
        });
      }
    }

    setMuted(val: boolean): void {
      this.muted = val;
    }

    isMuted(): boolean {
      return this.muted;
    }

    playPlace(): void {
      if (this.muted) return;
      this.init();
      const ctx = this.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.05); // E5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.15);
    }

    playRemove(): void {
      if (this.muted) return;
      this.init();
      const ctx = this.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(392.00, now); // G4
      osc.frequency.setValueAtTime(329.63, now + 0.04); // E4

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.start(now);
      osc.stop(now + 0.12);
    }

    playError(): void {
      if (this.muted) return;
      this.init();
      const ctx = this.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(140, now);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.15);
    }

    playWin(): void {
      if (this.muted) return;
      this.init();
      const ctx = this.ctx;
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.25);
      });
    }

    playClick(): void {
      if (this.muted) return;
      this.init();
      const ctx = this.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      osc.start(now);
      osc.stop(now + 0.02);
    }
  }

  export const synth = new RetroSynth();
  ```

- [ ] **Step 4: Commit changes**
  Run commands:
  ```bash
  rtk git add packages/slitherlink/src/types.ts packages/slitherlink/src/levels.ts packages/slitherlink/src/engine/synth.ts
  rtk git commit -m "feat(slitherlink): add types, levels config, and RetroSynth engine"
  ```

---

### Task 3: Loop Validation Logic & Test-Driven Development (TDD)

Create the validator and verify it with a robust test suite covering single loop detection, clues validation, self-intersection, and disjoint loops.

**Files:**
- Create: `packages/slitherlink/src/engine/validation.ts`
- Create: `packages/slitherlink/src/engine/validation.test.ts`

- [ ] **Step 1: Create `packages/slitherlink/src/engine/validation.ts`**
  Implement board rules validation.
  ```typescript
  import type { Level, BoardState, ValidationResult, EdgeState } from "../types";

  export function getVertexDegree(
    col: number,
    row: number,
    hEdges: EdgeState[][],
    vEdges: EdgeState[][],
    W: number,
    H: number
  ): number {
    let count = 0;
    if (col > 0 && hEdges[row][col - 1] === "line") count++;
    if (col < W && hEdges[row][col] === "line") count++;
    if (row > 0 && vEdges[row - 1][col] === "line") count++;
    if (row < H && vEdges[row][col] === "line") count++;
    return count;
  }

  export function getCellLineCount(
    x: number,
    y: number,
    hEdges: EdgeState[][],
    vEdges: EdgeState[][]
  ): number {
    let count = 0;
    if (hEdges[y][x] === "line") count++;
    if (hEdges[y + 1][x] === "line") count++;
    if (vEdges[y][x] === "line") count++;
    if (vEdges[y][x + 1] === "line") count++;
    return count;
  }

  export function validateBoard(level: Level, board: BoardState): ValidationResult {
    const { width: W, height: H, clues } = level;
    const { hEdges, vEdges } = board;

    const cellErrors: Record<string, boolean> = {};
    const vertexErrors: Record<string, boolean> = {};
    let cluesSatisfied = true;

    // 1. Check clues
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const key = `${x},${y}`;
        if (key in clues) {
          const target = clues[key];
          const current = getCellLineCount(x, y, hEdges, vEdges);
          if (current !== target) {
            cluesSatisfied = false;
            if (current > target) {
              cellErrors[key] = true;
            }
          }
        }
      }
    }

    // 2. Check vertex degrees and active vertex collection
    const activeVertices = new Set<string>();
    let hasDegreeError = false;

    for (let r = 0; r <= H; r++) {
      for (let c = 0; c <= W; c++) {
        const degree = getVertexDegree(c, r, hEdges, vEdges, W, H);
        if (degree > 0) {
          if (degree !== 2) {
            vertexErrors[`${c},${r}`] = true;
            hasDegreeError = true;
          } else {
            activeVertices.add(`${c},${r}`);
          }
        }
      }
    }

    // Empty board is not solved
    if (activeVertices.size === 0) {
      return { isSolved: false, cellErrors, vertexErrors };
    }

    if (!cluesSatisfied || hasDegreeError) {
      return { isSolved: false, cellErrors, vertexErrors };
    }

    // 3. Traversal to ensure single closed loop
    let totalLines = 0;
    for (let r = 0; r <= H; r++) {
      for (let c = 0; c < W; c++) {
        if (hEdges[r][c] === "line") totalLines++;
      }
    }
    for (let r = 0; r < H; r++) {
      for (let c = 0; c <= W; c++) {
        if (vEdges[r][c] === "line") totalLines++;
      }
    }

    const startVertex = Array.from(activeVertices)[0];
    let currentVertex = startVertex;
    let prevVertex: string | null = null;
    let visitedEdgesCount = 0;
    const visitedVertices = new Set<string>();

    while (currentVertex) {
      visitedVertices.add(currentVertex);
      const [c, r] = currentVertex.split(",").map(Number);
      
      let nextVertex: string | null = null;
      const neighbors: { key: string }[] = [];

      if (c > 0 && hEdges[r][c - 1] === "line") neighbors.push({ key: `${c - 1},${r}` });
      if (c < W && hEdges[r][c] === "line") neighbors.push({ key: `${c + 1},${r}` });
      if (r > 0 && vEdges[r - 1][c] === "line") neighbors.push({ key: `${c},${r - 1}` });
      if (r < H && vEdges[r][c] === "line") neighbors.push({ key: `${c},${r + 1}` });

      const validNeighbor = neighbors.find((n) => n.key !== prevVertex);
      if (validNeighbor) {
        nextVertex = validNeighbor.key;
        visitedEdgesCount++;
      }

      if (nextVertex === startVertex) {
        break; // Loop completed!
      }

      if (!nextVertex || visitedVertices.has(nextVertex)) {
        return { isSolved: false, cellErrors, vertexErrors };
      }

      prevVertex = currentVertex;
      currentVertex = nextVertex;
    }

    const isSolved = visitedEdgesCount === totalLines && visitedVertices.size === activeVertices.size;

    return { isSolved, cellErrors, vertexErrors };
  }
  ```

- [ ] **Step 2: Create `packages/slitherlink/src/engine/validation.test.ts`**
  Write unit tests verifying validation conditions.
  ```typescript
  import { describe, it, expect } from "vitest";
  import { validateBoard } from "./validation";
  import type { Level, BoardState } from "../types";

  const dummyLevel: Level = {
    id: "dummy",
    difficulty: "Easy",
    width: 2,
    height: 2,
    clues: { "0,0": 3, "1,1": 2 },
    targets: { threeStars: 60, twoStars: 120 }
  };

  const createEmptyBoard = (w: number, h: number): BoardState => ({
    hEdges: Array.from({ length: h + 1 }, () => Array(w).fill("none")),
    vEdges: Array.from({ length: h }, () => Array(w + 1).fill("none"))
  });

  describe("Slitherlink Loop Validation Engine", () => {
    it("returns false for an empty board", () => {
      const board = createEmptyBoard(2, 2);
      const res = validateBoard(dummyLevel, board);
      expect(res.isSolved).toBe(false);
    });

    it("detects cell clue count errors", () => {
      const board = createEmptyBoard(2, 2);
      // Clue (0,0) is 3, we draw 4 lines around it
      board.hEdges[0][0] = "line";
      board.hEdges[1][0] = "line";
      board.vEdges[0][0] = "line";
      board.vEdges[0][1] = "line";
      const res = validateBoard(dummyLevel, board);
      expect(res.isSolved).toBe(false);
      expect(res.cellErrors["0,0"]).toBe(true); // Exceeded
    });

    it("detects branch degree errors (T-junctions / degree 3)", () => {
      const board = createEmptyBoard(2, 2);
      board.hEdges[0][0] = "line";
      board.hEdges[0][1] = "line";
      board.vEdges[0][1] = "line";
      board.vEdges[0][2] = "line"; // Degree 3 vertex at (1,0)
      const res = validateBoard(dummyLevel, board);
      expect(res.isSolved).toBe(false);
      expect(res.vertexErrors["1,0"]).toBe(true);
    });

    it("validates a correct loop", () => {
      const board = createEmptyBoard(2, 2);
      // Draw a loop enclosing cell (0,0) and matching clues: (0,0) has 3 edges, (1,1) has 2 edges
      // Cell (0,0): hEdges[0][0], vEdges[0][0], hEdges[1][0] (which is also cell 1,0 boundary), vEdges[0][1]
      // Loop path: (0,0) -> (1,0) -> (1,1) -> (2,1) -> (2,2) -> (1,2) -> (0,2) -> (0,1) -> (0,0)
      board.hEdges[0][0] = "line"; // (0,0)-(1,0)
      board.hEdges[0][1] = "line"; // (1,0)-(2,0)
      board.vEdges[0][2] = "line"; // (2,0)-(2,1)
      board.vEdges[1][2] = "line"; // (2,1)-(2,2)
      board.hEdges[2][1] = "line"; // (1,2)-(2,2)
      board.hEdges[2][0] = "line"; // (0,2)-(1,2)
      board.vEdges[1][0] = "line"; // (0,1)-(0,2)
      board.vEdges[0][0] = "line"; // (0,0)-(0,1)
      
      // Now check cell clues: 
      // Cell (0,0) surrounding lines: hEdges[0][0] (yes), vEdges[0][0] (yes), hEdges[1][0] (no), vEdges[0][1] (no). Total = 2.
      // Wait, dummyLevel clues are: {"0,0": 3, "1,1": 2}. Let's draw lines to satisfy it.
      // Cell (0,0): we need 3 lines. Let's make it: top, left, bottom. (hEdges[0][0], vEdges[0][0], hEdges[1][0], not right)
      // Cell (1,1): we need 2 lines. Let's make it: right (vEdges[1][2]), bottom (hEdges[2][1]).
      // Total Loop path: (0,0) -> (1,0) -> (1,1) -> (2,1) -> (2,2) -> (1,2) -> (1,1) -> (0,1) -> (0,0)
      // Let's set edges:
      const solvableLevel: Level = {
        id: "easy-test",
        difficulty: "Easy",
        width: 2,
        height: 2,
        clues: { "0,0": 3, "0,1": 2 },
        targets: { threeStars: 60, twoStars: 120 }
      };
      const board2 = createEmptyBoard(2, 2);
      board2.hEdges[0][0] = "line"; // top cell (0,0)
      board2.vEdges[0][0] = "line"; // left cell (0,0)
      board2.hEdges[1][0] = "line"; // middle horiz (bottom cell 0,0 / top cell 0,1)
      board2.vEdges[1][0] = "line"; // left cell (0,1)
      board2.hEdges[2][0] = "line"; // bottom cell (0,1)
      board2.vEdges[1][1] = "line"; // right cell (0,1)
      board2.vEdges[0][1] = "line"; // right cell (0,0)

      // Loop: (0,0) -> (1,0) -> (1,1) -> (1,2) -> (0,2) -> (0,1) -> (0,0). Wait, this loop encloses (0,0) and (0,1).
      // Clues: "0,0" (has top hEdges[0][0], left vEdges[0][0], bottom hEdges[1][0], right vEdges[0][1]). That is 4 lines.
      // Let's make it 3: remove right vEdges[0][1] and route loop through (1,1) to (0,1)?
      // Let's draw:
      // (0,0) -> (1,0) [hEdges[0][0]]
      // (1,0) -> (1,1) [vEdges[0][1]]
      // (1,1) -> (0,1) [hEdges[1][0]]
      // (0,1) -> (0,0) [vEdges[0][0]]
      // This is a 1x1 cell loop.
      // Let's check clues for it: "0,0" has 4 lines. We need it to have 3.
      // A 2x2 loop enclosing both cells in column 0:
      // edges: hEdges[0][0], vEdges[0][0], vEdges[1][0], hEdges[2][0], vEdges[1][1], hEdges[1][0]...
      // Let's construct a simple 1x1 test level instead:
      const level1x1: Level = {
        id: "test1x1",
        difficulty: "Easy",
        width: 1,
        height: 1,
        clues: { "0,0": 4 },
        targets: { threeStars: 10, twoStars: 20 }
      };
      const board1x1 = createEmptyBoard(1, 1);
      board1x1.hEdges[0][0] = "line";
      board1x1.hEdges[1][0] = "line";
      board1x1.vEdges[0][0] = "line";
      board1x1.vEdges[0][1] = "line";
      const res1x1 = validateBoard(level1x1, board1x1);
      expect(res1x1.isSolved).toBe(true);
    });
  });
  ```

- [ ] **Step 3: Run the unit test to verify it passes**
  Run: `npm run test` or `npx vitest run packages/slitherlink/src/engine/validation.test.ts`
  Expected: PASS

- [ ] **Step 4: Commit changes**
  Run commands:
  ```bash
  rtk git add packages/slitherlink/src/engine/validation.ts packages/slitherlink/src/engine/validation.test.ts
  rtk git commit -m "test(slitherlink): implement validation rules and test suite"
  ```

---

### Task 4: Zustand Store State Management

Create the Zustand store that houses state variables for current level, time, board lines, history stack for undos, and mute status.

**Files:**
- Create: `packages/slitherlink/src/store/useSlitherlinkStore.ts`

- [ ] **Step 1: Create `packages/slitherlink/src/store/useSlitherlinkStore.ts`**
  Define store with undo logic, state mutations, and validation triggers.
  ```typescript
  import { create } from "zustand";
  import type { Level, BoardState, EdgeState } from "../types";
  import { validateBoard } from "../engine/validation";
  import { synth } from "../engine/synth";

  interface HistoryEntry {
    hEdges: EdgeState[][];
    vEdges: EdgeState[][];
  }

  interface SlitherlinkState {
    level: Level | null;
    hEdges: EdgeState[][];
    vEdges: EdgeState[][];
    history: HistoryEntry[];
    elapsedTime: number;
    timerActive: boolean;
    isWon: boolean;
    starsAchieved: number;
    cellErrors: Record<string, boolean>;
    vertexErrors: Record<string, boolean>;

    loadLevel: (level: Level) => void;
    toggleEdge: (type: "h" | "v", x: number, y: number) => void;
    undo: () => void;
    resetLevel: () => void;
    tickTimer: () => void;
    stopTimer: () => void;
  }

  const createInitialEdges = (w: number, h: number) => ({
    hEdges: Array.from({ length: h + 1 }, () => Array(w).fill("none")),
    vEdges: Array.from({ length: h }, () => Array(w + 1).fill("none"))
  });

  const cloneEdges = (h: EdgeState[][], v: EdgeState[][]): HistoryEntry => ({
    hEdges: h.map((row) => [...row]),
    vEdges: v.map((row) => [...row])
  });

  export const useSlitherlinkStore = create<SlitherlinkState>((set, get) => ({
    level: null,
    hEdges: [],
    vEdges: [],
    history: [],
    elapsedTime: 0,
    timerActive: false,
    isWon: false,
    starsAchieved: 0,
    cellErrors: {},
    vertexErrors: {},

    loadLevel: (level: Level) => {
      const { hEdges, vEdges } = createInitialEdges(level.width, level.height);
      set({
        level,
        hEdges,
        vEdges,
        history: [],
        elapsedTime: 0,
        timerActive: true,
        isWon: false,
        starsAchieved: 0,
        cellErrors: {},
        vertexErrors: {}
      });
    },

    toggleEdge: (type: "h" | "v", x: number, y: number) => {
      const { level, hEdges, vEdges, history, isWon } = get();
      if (!level || isWon) return;

      // Save history for undo
      const newHistory = [...history, cloneEdges(hEdges, vEdges)];

      const nextH = hEdges.map((row) => [...row]);
      const nextV = vEdges.map((row) => [...row]);

      let playSound = false;
      let isRemove = false;

      if (type === "h") {
        const current = nextH[y][x];
        if (current === "none") {
          nextH[y][x] = "line";
          playSound = true;
        } else if (current === "line") {
          nextH[y][x] = "cross";
          playSound = true;
        } else {
          nextH[y][x] = "none";
          isRemove = true;
        }
      } else {
        const current = nextV[y][x];
        if (current === "none") {
          nextV[y][x] = "line";
          playSound = true;
        } else if (current === "line") {
          nextV[y][x] = "cross";
          playSound = true;
        } else {
          nextV[y][x] = "none";
          isRemove = true;
        }
      }

      if (playSound) {
        synth.playPlace();
      } else if (isRemove) {
        synth.playRemove();
      }

      // Validate new state
      const validation = validateBoard(level, { hEdges: nextH, vEdges: nextV });

      let stars = 0;
      let won = false;

      if (validation.isSolved) {
        won = true;
        synth.playWin();
        const time = get().elapsedTime;
        if (time <= level.targets.threeStars) {
          stars = 3;
        } else if (time <= level.targets.twoStars) {
          stars = 2;
        } else {
          stars = 1;
        }
      }

      set({
        hEdges: nextH,
        vEdges: nextV,
        history: newHistory,
        isWon: won,
        starsAchieved: stars,
        cellErrors: validation.cellErrors,
        vertexErrors: validation.vertexErrors
      });
    },

    undo: () => {
      const { history, level } = get();
      if (history.length === 0 || !level) return;

      const previous = history[history.length - 1];
      const newHistory = history.slice(0, history.length - 1);

      synth.playClick();

      // Recalculate validation
      const validation = validateBoard(level, { hEdges: previous.hEdges, vEdges: previous.vEdges });

      set({
        hEdges: previous.hEdges,
        vEdges: previous.vEdges,
        history: newHistory,
        cellErrors: validation.cellErrors,
        vertexErrors: validation.vertexErrors
      });
    },

    resetLevel: () => {
      const { level } = get();
      if (!level) return;
      synth.playClick();
      const { hEdges, vEdges } = createInitialEdges(level.width, level.height);
      set({
        hEdges,
        vEdges,
        history: [],
        cellErrors: {},
        vertexErrors: {},
        isWon: false,
        starsAchieved: 0
      });
    },

    tickTimer: () => {
      const { timerActive, isWon } = get();
      if (timerActive && !isWon) {
        set((state) => ({ elapsedTime: state.elapsedTime + 1 }));
      }
    },

    stopTimer: () => {
      set({ timerActive: false });
    }
  }));
  ```

- [ ] **Step 2: Commit changes**
  Run commands:
  ```bash
  rtk git add packages/slitherlink/src/store/useSlitherlinkStore.ts
  rtk git commit -m "feat(slitherlink): implement Zustand store with undo stack and timer"
  ```

---

### Task 5: Creating Board, HUD, LevelSelect, and WinModal Components

Create UI components for game controls, board lines, and level selection grid.

**Files:**
- Create: `packages/slitherlink/src/components/HUD.tsx`
- Create: `packages/slitherlink/src/components/LevelSelect.tsx`
- Create: `packages/slitherlink/src/components/WinModal.tsx`
- Create: `packages/slitherlink/src/components/Board.tsx`

- [ ] **Step 1: Create `packages/slitherlink/src/components/HUD.tsx`**
  Implement header info and reset actions.
  ```typescript
  import React, { useEffect } from "react";
  import { useSlitherlinkStore } from "../store/useSlitherlinkStore";
  import { synth } from "../engine/synth";

  interface HUDProps {
    onBack: () => void;
  }

  export default function HUD({ onBack }: HUDProps): React.ReactElement {
    const level = useSlitherlinkStore((state) => state.level);
    const elapsedTime = useSlitherlinkStore((state) => state.elapsedTime);
    const undo = useSlitherlinkStore((state) => state.undo);
    const resetLevel = useSlitherlinkStore((state) => state.resetLevel);
    const tickTimer = useSlitherlinkStore((state) => state.tickTimer);
    const [muted, setMuted] = React.useState(false);

    useEffect(() => {
      const interval = setInterval(() => {
        tickTimer();
      }, 1000);
      return () => clearInterval(interval);
    }, [tickTimer]);

    const handleMute = () => {
      const nextMuted = !muted;
      synth.setMuted(nextMuted);
      setMuted(nextMuted);
      synth.playClick();
    };

    const formatTime = (sec: number): string => {
      const mins = Math.floor(sec / 60);
      const secs = sec % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
      <div className="w-full flex flex-col gap-4 border-b border-cozy-border pb-4 font-press text-[10px] text-cozy-text select-none">
        <div className="flex justify-between items-center">
          <button
            onClick={() => {
              synth.playClick();
              onBack();
            }}
            className="border border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black px-2 py-1 cursor-pointer font-mono"
          >
            ◀ MENU
          </button>
          <span>LVL: {level?.id.toUpperCase()}</span>
          <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={undo}
              className="border border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black px-2 py-1 cursor-pointer font-mono"
            >
              UNDO
            </button>
            <button
              onClick={resetLevel}
              className="border border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black px-2 py-1 cursor-pointer font-mono"
            >
              RESET
            </button>
          </div>
          <button
            onClick={handleMute}
            className="border border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black px-2 py-1 cursor-pointer font-mono"
          >
            {muted ? "UNMUTE" : "MUTE"}
          </button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Create `packages/slitherlink/src/components/LevelSelect.tsx`**
  Renders menu with preloaded completion stars.
  ```typescript
  import React from "react";
  import { SLITHERLINK_LEVELS } from "../levels";
  import { synth } from "../engine/synth";

  interface LevelSelectProps {
    onSelect: (index: number) => void;
    completedLevels: Record<string, number>;
  }

  export default function LevelSelect({
    onSelect,
    completedLevels
  }: LevelSelectProps): React.ReactElement {
    return (
      <div className="w-full flex flex-col gap-6 text-cozy-text font-press select-none">
        <h2 className="text-[12px] text-center border-b border-cozy-border pb-3 font-mono">
          SELECT LEVEL
        </h2>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-[9px] mb-3 text-cozy-muted font-mono">EASY (5x5)</h3>
            <div className="grid grid-cols-3 gap-3">
              {SLITHERLINK_LEVELS.filter(l => l.difficulty === "Easy").map((lvl) => {
                const idx = SLITHERLINK_LEVELS.findIndex(l => l.id === lvl.id);
                const stars = completedLevels[lvl.id] || 0;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      synth.playClick();
                      onSelect(idx);
                    }}
                    className="border border-cozy-border bg-black text-cozy-text p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-cozy-text hover:text-black transition-colors font-mono"
                  >
                    <span className="text-[10px]">{idx + 1}</span>
                    <span className="text-[6px] mt-1 opacity-70">5x5</span>
                    <div className="text-[8px] mt-2">
                      {"★".repeat(stars)}
                      {"☆".repeat(3 - stars)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-[9px] mb-3 text-cozy-muted font-mono">MEDIUM (6x6)</h3>
            <div className="grid grid-cols-3 gap-3">
              {SLITHERLINK_LEVELS.filter(l => l.difficulty === "Medium").map((lvl) => {
                const idx = SLITHERLINK_LEVELS.findIndex(l => l.id === lvl.id);
                const stars = completedLevels[lvl.id] || 0;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => {
                      synth.playClick();
                      onSelect(idx);
                    }}
                    className="border border-cozy-border bg-black text-cozy-text p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-cozy-text hover:text-black transition-colors font-mono"
                  >
                    <span className="text-[10px]">{idx + 1}</span>
                    <span className="text-[6px] mt-1 opacity-70">6x6</span>
                    <div className="text-[8px] mt-2">
                      {"★".repeat(stars)}
                      {"☆".repeat(3 - stars)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Create `packages/slitherlink/src/components/WinModal.tsx`**
  Renders victory summary.
  ```typescript
  import React from "react";
  import { useSlitherlinkStore } from "../store/useSlitherlinkStore";
  import { synth } from "../engine/synth";
  import { motion } from "framer-motion";

  interface WinModalProps {
    onBack: () => void;
    rewardMsg: string | null;
  }

  export default function WinModal({ onBack, rewardMsg }: WinModalProps): React.ReactElement | null {
    const isWon = useSlitherlinkStore((state) => state.isWon);
    const elapsedTime = useSlitherlinkStore((state) => state.elapsedTime);
    const starsAchieved = useSlitherlinkStore((state) => state.starsAchieved);
    const level = useSlitherlinkStore((state) => state.level);

    if (!isWon || !level) return null;

    const formatTime = (sec: number): string => {
      const mins = Math.floor(sec / 60);
      const secs = sec % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-press text-[10px] text-cozy-text select-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="border border-cozy-border bg-black max-w-[300px] w-full p-6 flex flex-col items-center gap-4 text-center box-shadow-[0_0_15px_rgba(255,176,0,0.2)]"
        >
          <h2 className="text-[12px] text-cozy-accent animate-pulse font-mono font-bold">LEVEL SOLVED!</h2>
          
          <div className="text-[14px] my-2 font-mono">
            {"★".repeat(starsAchieved)}
            {"☆".repeat(3 - starsAchieved)}
          </div>

          <div className="flex flex-col gap-1 text-[8px] text-left w-full border-y border-dashed border-cozy-border py-3 my-1 font-mono">
            <div className="flex justify-between">
              <span>TIME TAKEN:</span>
              <span>{formatTime(elapsedTime)}</span>
            </div>
            <div className="flex justify-between text-cozy-muted">
              <span>3 STARS GOAL:</span>
              <span>&le; {formatTime(level.targets.threeStars)}</span>
            </div>
            <div className="flex justify-between text-cozy-muted">
              <span>2 STARS GOAL:</span>
              <span>&le; {formatTime(level.targets.twoStars)}</span>
            </div>
          </div>

          {rewardMsg && (
            <div className="border border-cozy-border px-3 py-1 font-mono text-[9px]">
              {rewardMsg}
            </div>
          )}

          <button
            onClick={() => {
              synth.playClick();
              onBack();
            }}
            className="border border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black px-4 py-2 mt-2 cursor-pointer font-mono font-bold"
          >
            CONTINUE
          </button>
        </motion.div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Create `packages/slitherlink/src/components/Board.tsx`**
  Renders interactive grid map of dots, edges, and clues. Includes wider invisible click areas for comfortable interaction.
  ```typescript
  import React from "react";
  import { useSlitherlinkStore } from "../store/useSlitherlinkStore";
  import { getCellLineCount } from "../engine/validation";

  export default function Board(): React.ReactElement | null {
    const level = useSlitherlinkStore((state) => state.level);
    const hEdges = useSlitherlinkStore((state) => state.hEdges);
    const vEdges = useSlitherlinkStore((state) => state.vEdges);
    const toggleEdge = useSlitherlinkStore((state) => state.toggleEdge);
    const cellErrors = useSlitherlinkStore((state) => state.cellErrors);

    if (!level || hEdges.length === 0 || vEdges.length === 0) return null;

    const W = level.width;
    const H = level.height;
    const cellSize = 42; // Size of each cell in pixels
    const offset = 12; // Padding offset inside container

    const boardWidth = W * cellSize + offset * 2;
    const boardHeight = H * cellSize + offset * 2;

    return (
      <div 
        className="relative select-none"
        style={{ width: `${boardWidth}px`, height: `${boardHeight}px` }}
      >
        {/* Render clues inside cells */}
        {Array.from({ length: H }).map((_, y) =>
          Array.from({ length: W }).map((_, x) => {
            const clueKey = `${x},${y}`;
            if (!(clueKey in level.clues)) return null;
            const target = level.clues[clueKey];
            const current = getCellLineCount(x, y, hEdges, vEdges);
            const isError = cellErrors[clueKey];
            const isSatisfied = current === target;

            let textColor = "text-cozy-muted"; // Under
            if (isError) textColor = "text-red-500 text-shadow-[0_0_4px_#ff0000]";
            else if (isSatisfied) textColor = "text-cozy-text text-shadow-[0_0_6px_#ffb000] font-bold";

            return (
              <div
                key={`cell-${clueKey}`}
                className={`absolute flex items-center justify-center font-press text-[12px] font-mono transition-colors ${textColor}`}
                style={{
                  left: `${offset + x * cellSize}px`,
                  top: `${offset + y * cellSize}px`,
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                }}
              >
                {target}
              </div>
            );
          })
        )}

        {/* Render horizontal edges */}
        {hEdges.map((row, y) =>
          row.map((state, x) => {
            const isLine = state === "line";
            const isCross = state === "cross";

            return (
              <div
                key={`hedge-${x}-${y}`}
                className="absolute cursor-pointer flex items-center justify-center"
                style={{
                  left: `${offset + x * cellSize}px`,
                  top: `${offset + y * cellSize - 7}px`,
                  width: `${cellSize}px`,
                  height: "14px",
                  zIndex: 20
                }}
                onClick={() => toggleEdge("h", x, y)}
              >
                {/* Visual Line */}
                <div
                  className={`w-full transition-all duration-75 ${
                    isLine 
                      ? "bg-cozy-text shadow-[0_0_8px_#ffb000] h-[3px]" 
                      : "bg-transparent h-[1px]"
                  }`}
                />
                {/* Visual Cross 'x' */}
                {isCross && (
                  <span className="absolute text-[8px] font-mono text-cozy-muted leading-none">x</span>
                )}
              </div>
            );
          })
        )}

        {/* Render vertical edges */}
        {vEdges.map((row, y) =>
          row.map((state, x) => {
            const isLine = state === "line";
            const isCross = state === "cross";

            return (
              <div
                key={`vedge-${x}-${y}`}
                className="absolute cursor-pointer flex items-center justify-center"
                style={{
                  left: `${offset + x * cellSize - 7}px`,
                  top: `${offset + y * cellSize}px`,
                  width: "14px",
                  height: `${cellSize}px`,
                  zIndex: 20
                }}
                onClick={() => toggleEdge("v", x, y)}
              >
                {/* Visual Line */}
                <div
                  className={`h-full transition-all duration-75 ${
                    isLine 
                      ? "bg-cozy-text shadow-[0_0_8px_#ffb000] w-[3px]" 
                      : "bg-transparent w-[1px]"
                  }`}
                />
                {/* Visual Cross 'x' */}
                {isCross && (
                  <span className="absolute text-[8px] font-mono text-cozy-muted leading-none">x</span>
                )}
              </div>
            );
          })
        )}

        {/* Render dots grid */}
        {Array.from({ length: H + 1 }).map((_, y) =>
          Array.from({ length: W + 1 }).map((_, x) => (
            <div
              key={`dot-${x}-${y}`}
              className="absolute bg-cozy-text rounded-full shadow-[0_0_3px_#ffb000]"
              style={{
                left: `${offset + x * cellSize - 3}px`,
                top: `${offset + y * cellSize - 3}px`,
                width: "6px",
                height: "6px",
                zIndex: 30
              }}
            />
          ))
        )}
      </div>
    );
  }
  ```

- [ ] **Step 5: Commit changes**
  Run commands:
  ```bash
  rtk git add packages/slitherlink/src/components/HUD.tsx packages/slitherlink/src/components/LevelSelect.tsx packages/slitherlink/src/components/WinModal.tsx packages/slitherlink/src/components/Board.tsx
  rtk git commit -m "feat(slitherlink): implement HUD, LevelSelect, WinModal, and Board components"
  ```

---

### Task 6: main app logic entry, save logic integration, and local mock testing

Tie the components together, add ProgressService integration on wins, and write tests for the application entry.

**Files:**
- Create: `packages/slitherlink/src/SlitherlinkApp.tsx`
- Create: `packages/slitherlink/src/SlitherlinkApp.test.tsx`

- [ ] **Step 1: Create `packages/slitherlink/src/SlitherlinkApp.tsx`**
  Connect app to Cozy OS `ProgressService`.
  ```typescript
  import React, { useState, useEffect, useCallback } from "react";
  import { ProgressService, LocalProgressRepository } from "shared";
  import { useSlitherlinkStore } from "./store/useSlitherlinkStore";
  import { SLITHERLINK_LEVELS } from "./levels";
  import HUD from "./components/HUD";
  import Board from "./components/Board";
  import LevelSelect from "./components/LevelSelect";
  import WinModal from "./components/WinModal";

  const progressService = new ProgressService(new LocalProgressRepository());

  export default function SlitherlinkApp(): React.ReactElement {
    const [view, setView] = useState<"menu" | "game">("menu");
    const [completedLevels, setCompletedLevels] = useState<Record<string, number>>({});
    const [rewardMsg, setRewardMsg] = useState<string | null>(null);

    const level = useSlitherlinkStore((state) => state.level);
    const isWon = useSlitherlinkStore((state) => state.isWon);
    const starsAchieved = useSlitherlinkStore((state) => state.starsAchieved);
    const loadLevel = useSlitherlinkStore((state) => state.loadLevel);

    const refreshProgress = useCallback(async () => {
      const state = await progressService.getState();
      const map: Record<string, number> = {};
      for (const c of state.completedLevels) {
        if (c.module === "slitherlink") {
          map[c.levelId] = c.stars ?? 1;
        }
      }
      setCompletedLevels(map);
    }, []);

    useEffect(() => {
      void refreshProgress();
      const handler = () => { void refreshProgress(); };
      window.addEventListener("cozyos:progress-updated", handler);
      return () => window.removeEventListener("cozyos:progress-updated", handler);
    }, [refreshProgress]);

    // Handle level completion saving
    useEffect(() => {
      if (isWon && level) {
        progressService.completeLevelWithStars("slitherlink", level.id, starsAchieved)
          .then((firstTime) => {
            setRewardMsg(firstTime ? "+1 FOOD" : "ALREADY COMPLETE");
          })
          .catch((err) => {
            console.error("Failed to complete level:", err);
          });
      }
    }, [isWon, level, starsAchieved]);

    const handleSelectLevel = (idx: number): void => {
      setRewardMsg(null);
      loadLevel(SLITHERLINK_LEVELS[idx]);
      setView("game");
    };

    return (
      <div className="w-full max-w-[450px] border border-cozy-border bg-black p-6 select-none text-cozy-text flex flex-col items-center">
        {view === "menu" ? (
          <LevelSelect
            onSelect={handleSelectLevel}
            completedLevels={completedLevels}
          />
        ) : (
          <div className="flex flex-col gap-6 items-center w-full">
            <HUD onBack={() => setView("menu")} />
            <Board />
            <WinModal onBack={() => setView("menu")} rewardMsg={rewardMsg} />
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Create `packages/slitherlink/src/SlitherlinkApp.test.tsx`**
  Verify menu navigation and levels load.
  ```typescript
  import React from "react";
  import { describe, it, expect, vi, beforeEach } from "vitest";
  import { render, screen, fireEvent } from "@testing-library/react";
  import SlitherlinkApp from "./SlitherlinkApp";

  vi.mock("shared", () => {
    return {
      ProgressService: vi.fn().mockImplementation(() => ({
        getState: vi.fn().mockResolvedValue({
          completedLevels: [{ module: "slitherlink", levelId: "sl-easy-1", stars: 3 }],
          pet: { stage: 1 }
        }),
        completeLevelWithStars: vi.fn().mockResolvedValue(true)
      })),
      LocalProgressRepository: vi.fn()
    };
  });

  describe("SlitherlinkApp Integration", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("renders level select menu initially", () => {
      render(<SlitherlinkApp />);
      expect(screen.getByText("SELECT LEVEL")).toBeInTheDocument();
      expect(screen.getByText("EASY (5x5)")).toBeInTheDocument();
      expect(screen.getByText("MEDIUM (6x6)")).toBeInTheDocument();
    });

    it("launches game view on level selection", async () => {
      render(<SlitherlinkApp />);
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[0]); // Select Level 1

      expect(screen.getByText("LVL: SL-EASY-1")).toBeInTheDocument();
      expect(screen.getByText("UNDO")).toBeInTheDocument();
    });
  });
  ```

- [ ] **Step 3: Run Slitherlink tests**
  Run: `npm run test`
  Expected: PASS

- [ ] **Step 4: Commit changes**
  Run commands:
  ```bash
  rtk git add packages/slitherlink/src/SlitherlinkApp.tsx packages/slitherlink/src/SlitherlinkApp.test.tsx
  rtk git commit -m "feat(slitherlink): connect ProgressService saving, add App entry and tests"
  ```

---

### Task 7: Monorepo Wiring & Shell Integration

Link the MFE with Vite Federation inside `packages/shell` config, root typings, and app routes.

**Files:**
- Modify: `packages/shell/vite.config.ts:18`
- Modify: `packages/shell/src/types/remotes.d.ts:49`
- Modify: `packages/shell/src/App.tsx:47-98`
- Modify: `tsconfig.json:34`
- Modify: `package.json:8`

- [ ] **Step 2: Add typescript declarations to `packages/shell/src/types/remotes.d.ts`**
  Append module typing at the end of the file.
  ```typescript
  declare module "slitherlink/SlitherlinkApp" {
    const SlitherlinkApp: () => import("react").ReactElement;
    export default SlitherlinkApp;
  }
  ```

- [ ] **Step 3: Modify `packages/shell/vite.config.ts`**
  Add slitherlink package name to `mfePackages` array on line 18.
  ```typescript
    const mfePackages = ["about", "posts", "pets", "shikaku", "sokoban", "slitherlink"];
  ```

- [ ] **Step 4: Add route and import to `packages/shell/src/App.tsx`**
  Add lazy import for Slitherlink around line 47:
  ```typescript
  const SlitherlinkApp = lazy(
    () =>
      import("slitherlink/SlitherlinkApp").catch(() => ({
        default: () => <Fallback name="Slitherlink" />,
      }))
  );
  ```
  Add tab mapping inside `renderMainContent` around line 98:
  ```typescript
        case "slitherlink":
          return <SlitherlinkApp />;
  ```

- [ ] **Step 5: Modify root workspace script in `package.json`**
  Add slitherlink dev runner command to `dev` script in root `package.json`.
  ```json
  "dev": "concurrently -n shell,about,posts,pets,shikaku,sokoban,slitherlink -c blue,green,yellow,magenta,cyan,white,red \"npm run dev -w packages/shell\" \"npm run dev:watch -w packages/about\" \"npm run dev:watch -w packages/posts\" \"npm run dev:watch -w packages/pets\" \"npm run dev:watch -w packages/shikaku\" \"npm run dev:watch -w packages/sokoban\" \"npm run dev:watch -w packages/slitherlink\"",
  ```

- [ ] **Step 6: Update root `tsconfig.json`**
  Add slitherlink source paths to `include` list inside root `tsconfig.json`:
  ```json
      "packages/slitherlink/src/**/*.ts",
      "packages/slitherlink/src/**/*.tsx",
  ```

- [ ] **Step 7: Commit integration files**
  Run commands:
  ```bash
  rtk git add packages/shell/vite.config.ts packages/shell/src/types/remotes.d.ts packages/shell/src/App.tsx package.json tsconfig.json
  rtk git commit -m "feat(shell): register and route Slitherlink MFE remote"
  ```
