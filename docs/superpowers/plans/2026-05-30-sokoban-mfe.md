# Sokoban MFE Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a lightweight, responsive, and tactile web-based Sokoban game micro-frontend in `packages/sokoban` and integrate it as a federated remote into the container shell.

**Architecture:** Use a Zustand store to manage game state (TileType[][], Player coordinates, Box coordinate maps). Entities are absolutely positioned and smoothly transitioned over a CSS Grid background layer. Custom Web Audio synth sounds are procedurally generated, and static corners are analyzed for deadlocks after each move.

**Tech Stack:** React, TypeScript, Zustand, TailwindCSS, Vite, Vitest

---

## File Structure

```
packages/sokoban/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── types.ts
    ├── levels.ts
    ├── engine/
    │   └── synth.ts
    ├── store/
    │   └── useSokobanStore.ts
    ├── components/
    │   ├── Board.tsx
    │   ├── HUD.tsx
    │   ├── LevelSelect.tsx
    │   ├── Controls.tsx
    │   └── WinModal.tsx
    ├── SokobanApp.tsx
    ├── levels.test.ts
    └── store/
        └── useSokobanStore.test.ts
```

---

## Tasks

### Task 1: Scaffolding packages/sokoban

**Files:**
- Create: `packages/sokoban/package.json`
- Create: `packages/sokoban/tsconfig.json`
- Create: `packages/sokoban/vite.config.ts`
- Create: `packages/sokoban/index.html`
- Create: `packages/sokoban/src/main.tsx`

- [ ] **Step 1: Create package.json**
  Write to `packages/sokoban/package.json`:
  ```json
  {
    "name": "sokoban",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite --port 3005 --strictPort",
      "build": "vite build",
      "preview": "vite preview --port 3005"
    },
    "dependencies": {
      "react": "^18.3.1",
      "react-dom": "^18.3.1",
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

- [ ] **Step 2: Create tsconfig.json**
  Write to `packages/sokoban/tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "target": "ESNext",
      "useDefineForClassFields": true,
      "lib": ["DOM", "DOM.Iterable", "ESNext"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true
    },
    "include": ["src"]
  }
  ```

- [ ] **Step 3: Create vite.config.ts**
  Write to `packages/sokoban/vite.config.ts`:
  ```typescript
  import { defineConfig } from "vite";
  import react from "@vitejs/plugin-react";
  import tailwindcss from "@tailwindcss/vite";
  import federation from "@originjs/vite-plugin-federation";

  export default defineConfig(({ command }) => {
    return {
      base: command === "build" ? "/mfe/sokoban/" : "/",
      plugins: [
        react(),
        tailwindcss(),
        federation({
          name: "sokoban",
          filename: "remoteEntry.js",
          exposes: {
            "./SokobanApp": "./src/SokobanApp.tsx",
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

- [ ] **Step 4: Create index.html**
  Write to `packages/sokoban/index.html`:
  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Sokoban Local Test</title>
    </head>
    <body class="bg-[#e2f4e5]">
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>
  ```

- [ ] **Step 5: Create main.tsx**
  Write to `packages/sokoban/src/main.tsx`:
  ```typescript
  import React from "react";
  import ReactDOM from "react-dom/client";
  import SokobanApp from "./SokobanApp";

  // Dummy SokobanApp container placeholder for main.tsx compilation
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <div className="p-8 flex justify-center">
        <SokobanApp />
      </div>
    </React.StrictMode>
  );
  ```

- [ ] **Step 6: Create initial SokobanApp.tsx stub**
  Write to `packages/sokoban/src/SokobanApp.tsx`:
  ```typescript
  import React from "react";

  export default function SokobanApp(): React.ReactElement {
    return (
      <div className="p-4 border-4 border-[#2b4c3f] bg-[#fff] text-[#2b4c3f] font-mono">
        SOKOBAN_APP_ONLINE
      </div>
    );
  }
  ```

- [ ] **Step 7: Run test compile**
  Run: `npm run typecheck`
  Expected: Success without errors.

- [ ] **Step 8: Commit**
  ```bash
  git add packages/sokoban/
  git commit -m "feat(sokoban): scaffold package structures and local stubs"
  ```

---

### Task 2: Core Types & Level Loading

**Files:**
- Create: `packages/sokoban/src/types.ts`
- Create: `packages/sokoban/src/levels.ts`
- Create: `packages/sokoban/src/levels.test.ts`

- [ ] **Step 1: Create Types File**
  Write to `packages/sokoban/src/types.ts`:
  ```typescript
  export enum TileType {
    EMPTY = 0,
    WALL = 1,
    FLOOR = 2,
    TARGET = 3
  }

  export interface Player {
    x: number;
    y: number;
  }

  export interface Box {
    id: string;
    x: number;
    y: number;
  }

  export interface MoveSnapshot {
    player: Player;
    boxes: { id: string; x: number; y: number }[];
  }

  export interface LevelData {
    id: string;
    name: string;
    grid: string[];
  }
  ```

- [ ] **Step 2: Create Levels File (including Microban level pack)**
  Write to `packages/sokoban/src/levels.ts` (contain a representation of the level maps, containing at least the first 5 Microban maps for concise, complete code):
  ```typescript
  import { LevelData } from "./types";

  // 5 classic compact Microban levels by David W. Skinner
  export const SOKOBAN_LEVELS: LevelData[] = [
    {
      id: "microban-01",
      name: "Microban #1",
      grid: [
        "  ####  ",
        "###  ###",
        "#      #",
        "# .$$# #",
        "#  @.  #",
        "########"
      ]
    },
    {
      id: "microban-02",
      name: "Microban #2",
      grid: [
        "#####",
        "#@  #",
        "# $ #",
        "# . #",
        "#####"
      ]
    },
    {
      id: "microban-03",
      name: "Microban #3",
      grid: [
        "######",
        "#@  .#",
        "# $$ #",
        "# .  #",
        "######"
      ]
    },
    {
      id: "microban-04",
      name: "Microban #4",
      grid: [
        "######",
        "#  . #",
        "# $  #",
        "#.$  #",
        "#@   #",
        "######"
      ]
    },
    {
      id: "microban-05",
      name: "Microban #5",
      grid: [
        "######",
        "#@   #",
        "# $$ #",
        "# .. #",
        "######"
      ]
    }
  ];
  ```

- [ ] **Step 3: Write Level Parser Test**
  Write to `packages/sokoban/src/levels.test.ts`:
  ```typescript
  import { describe, it, expect } from "vitest";
  import { SOKOBAN_LEVELS } from "./levels";

  describe("Sokoban Levels", () => {
    it("should have correct syntax symbols for all level layouts", () => {
      const allowedSymbols = new Set([" ", "#", ".", "@", "$", "*", "+"]);
      SOKOBAN_LEVELS.forEach((lvl) => {
        lvl.grid.forEach((row) => {
          for (const char of row) {
            expect(allowedSymbols.has(char)).toBe(true);
          }
        });
      });
    });

    it("should contain at least 1 player, 1 box, and 1 target in each level", () => {
      SOKOBAN_LEVELS.forEach((lvl) => {
        let players = 0;
        let boxes = 0;
        let targets = 0;

        lvl.grid.forEach((row) => {
          for (const char of row) {
            if (char === "@" || char === "+") players++;
            if (char === "$" || char === "*") boxes++;
            if (char === "." || char === "*" || char === "+") targets++;
          }
        });

        expect(players).toBe(1);
        expect(boxes).toBeGreaterThan(0);
        expect(targets).toBe(boxes);
      });
    });
  });
  ```

- [ ] **Step 4: Run the level test**
  Run: `vitest run packages/sokoban/src/levels.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add packages/sokoban/src/types.ts packages/sokoban/src/levels.ts packages/sokoban/src/levels.test.ts
  git commit -m "feat(sokoban): implement raw level data representation and validation test"
  ```

---

### Task 3: Zustand Store with Game Mechanics (TDD)

**Files:**
- Create: `packages/sokoban/src/store/useSokobanStore.ts`
- Create: `packages/sokoban/src/store/useSokobanStore.test.ts`

- [ ] **Step 1: Write the failing Store tests**
  Write to `packages/sokoban/src/store/useSokobanStore.test.ts` checking level loading, movement collision, box pushing, win conditions, and undo:
  ```typescript
  import { describe, it, expect, beforeEach } from "vitest";
  import { useSokobanStore } from "./useSokobanStore";
  import { TileType } from "../types";

  describe("Sokoban Game Store", () => {
    beforeEach(() => {
      // Re-initialize state
      useSokobanStore.setState({
        currentLevelIdx: 0,
        board: [],
        player: { x: 0, y: 0 },
        boxes: [],
        moves: 0,
        history: [],
        isWon: false,
        isMuted: false,
        deadlockedBoxIds: []
      });
    });

    it("should load the level configuration correctly", () => {
      const store = useSokobanStore.getState();
      // Dummy small level test load
      store.loadLevel(1); // Microban #2

      const updated = useSokobanStore.getState();
      expect(updated.player).toEqual({ x: 1, y: 1 });
      expect(updated.boxes.length).toBe(1);
      expect(updated.board[3][2]).toBe(TileType.TARGET);
      expect(updated.isWon).toBe(false);
    });

    it("should allow player steps to empty space", () => {
      const store = useSokobanStore.getState();
      store.loadLevel(1); // player starts at (1,1). Down is empty (1,2)

      store.move(0, 1); // Down
      const updated = useSokobanStore.getState();
      expect(updated.player).toEqual({ x: 1, y: 2 });
      expect(updated.moves).toBe(1);
      expect(updated.history.length).toBe(1);
    });

    it("should block movement into walls", () => {
      const store = useSokobanStore.getState();
      store.loadLevel(1); // (1,1). Left (0,1) is wall

      store.move(-1, 0); // Left
      const updated = useSokobanStore.getState();
      expect(updated.player).toEqual({ x: 1, y: 1 }); // Unchanged
      expect(updated.moves).toBe(0);
    });

    it("should allow pushing a box into empty space and winning when solved", () => {
      const store = useSokobanStore.getState();
      store.loadLevel(1); // Player at (1,1), Box at (2,2), Target at (2,3)
      
      // Move to (1,2)
      store.move(0, 1);
      // Push box at (2,2) to Right -> (3,2) [Floor]
      store.move(1, 0);
      
      let state = useSokobanStore.getState();
      expect(state.player).toEqual({ x: 2, y: 2 });
      expect(state.boxes[0].x).toBe(3);
      expect(state.boxes[0].y).toBe(2);

      // Now push box from (3,2) Down onto Target at (2,3) -> Wait, Microban 2:
      // "#@  #" (Row 1)
      // "# $ #" (Row 2) => player starts at (1,1) (y=1, x=1). Box at (2,2) (y=2, x=2). Target is at (2,3) (y=3, x=2).
      // "# . #" (Row 3)
      // Therefore: player (1,1). Down (0,1) -> (1,2). Right (1,0) -> pushes box at (2,2) to (3,2). Wait:
      // Row 2 is "# $ #" -> length is 5: indices: 0=#, 1=space, 2=$, 3=space, 4=#.
      // So Box is at (2,2). Player is at (1,1).
      // Let's just push it Down: move right to (2,1) -> then push Down (0, 1) to push box from (2,2) to (2,3) (target).
      
      // Reload
      useSokobanStore.getState().loadLevel(1);
      // Move player Right: (1,1) -> (2,1)
      useSokobanStore.getState().move(1, 0);
      // Push box Down: player at (2,1) pushes box at (2,2) to (2,3)
      useSokobanStore.getState().move(0, 1);
      
      state = useSokobanStore.getState();
      expect(state.player).toEqual({ x: 2, y: 2 });
      expect(state.boxes[0].x).toBe(2);
      expect(state.boxes[0].y).toBe(3);
      expect(state.isWon).toBe(true);
    });

    it("should support undo action", () => {
      const store = useSokobanStore.getState();
      store.loadLevel(1);
      
      store.move(1, 0); // Move Right to (2,1)
      expect(useSokobanStore.getState().player).toEqual({ x: 2, y: 1 });
      
      store.undo();
      expect(useSokobanStore.getState().player).toEqual({ x: 1, y: 1 });
      expect(useSokobanStore.getState().moves).toBe(0);
    });
  });
  ```

- [ ] **Step 2: Run Store tests to verify failure**
  Run: `vitest run packages/sokoban/src/store/useSokobanStore.test.ts`
  Expected: FAIL with missing store module or methods.

- [ ] **Step 3: Implement minimal store code to pass**
  Write to `packages/sokoban/src/store/useSokobanStore.ts`:
  ```typescript
  import { create } from "zustand";
  import { TileType, Player, Box, MoveSnapshot } from "../types";
  import { SOKOBAN_LEVELS } from "../levels";

  interface SokobanState {
    currentLevelIdx: number;
    board: TileType[][];
    player: Player;
    boxes: Box[];
    moves: number;
    history: MoveSnapshot[];
    isWon: boolean;
    isMuted: boolean;
    deadlockedBoxIds: string[];

    loadLevel: (levelIdx: number) => void;
    move: (dx: number, dy: number) => void;
    undo: () => void;
    restart: () => void;
    nextLevel: () => void;
    setMuted: (muted: boolean) => void;
  }

  const computeDeadlocks = (board: TileType[][], boxes: Box[]): string[] => {
    const deadlocked: string[] = [];
    for (const box of boxes) {
      const { x, y } = box;
      if (y < 0 || y >= board.length || x < 0 || x >= board[y].length) continue;
      if (board[y][x] === TileType.TARGET) continue;

      const leftWall = board[y]?.[x - 1] === TileType.WALL;
      const rightWall = board[y]?.[x + 1] === TileType.WALL;
      const upWall = board[y - 1]?.[x] === TileType.WALL;
      const downWall = board[y + 1]?.[x] === TileType.WALL;

      const inCorner = (leftWall || rightWall) && (upWall || downWall);
      if (inCorner) {
        deadlocked.push(box.id);
      }
    }
    return deadlocked;
  };

  export const useSokobanStore = create<SokobanState>((set, get) => ({
    currentLevelIdx: 0,
    board: [],
    player: { x: 0, y: 0 },
    boxes: [],
    moves: 0,
    history: [],
    isWon: false,
    isMuted: false,
    deadlockedBoxIds: [],

    loadLevel: (levelIdx) => {
      const normalizedIdx = Math.max(0, Math.min(levelIdx, SOKOBAN_LEVELS.length - 1));
      const lvl = SOKOBAN_LEVELS[normalizedIdx];
      
      const board: TileType[][] = [];
      const boxes: Box[] = [];
      let player: Player = { x: 0, y: 0 };
      let boxCounter = 0;

      lvl.grid.forEach((row, y) => {
        const boardRow: TileType[] = [];
        for (let x = 0; x < row.length; x++) {
          const char = row[x];
          if (char === "#") {
            boardRow.push(TileType.WALL);
          } else if (char === ".") {
            boardRow.push(TileType.TARGET);
          } else if (char === "@") {
            boardRow.push(TileType.FLOOR);
            player = { x, y };
          } else if (char === "$") {
            boardRow.push(TileType.FLOOR);
            boxes.push({ id: `box-${boxCounter++}`, x, y });
          } else if (char === "*") {
            boardRow.push(TileType.TARGET);
            boxes.push({ id: `box-${boxCounter++}`, x, y });
          } else if (char === "+") {
            boardRow.push(TileType.TARGET);
            player = { x, y };
          } else {
            boardRow.push(TileType.EMPTY);
          }
        }
        board.push(boardRow);
      });

      set({
        currentLevelIdx: normalizedIdx,
        board,
        player,
        boxes,
        moves: 0,
        history: [],
        isWon: false,
        deadlockedBoxIds: []
      });
    },

    move: (dx, dy) => {
      const { board, player, boxes, history, moves, isWon } = get();
      if (isWon) return;

      const tx = player.x + dx;
      const ty = player.y + dy;

      if (ty < 0 || ty >= board.length || tx < 0 || tx >= board[ty].length) return;
      if (board[ty][tx] === TileType.WALL) return; // Blocked by wall

      const pushedBoxIndex = boxes.findIndex((b) => b.x === tx && b.y === ty);

      if (pushedBoxIndex !== -1) {
        // Push box validation
        const bx = tx + dx;
        const by = ty + dy;

        if (by < 0 || by >= board.length || bx < 0 || bx >= board[by].length) return;
        if (board[by][bx] === TileType.WALL) return; // Behind is wall
        if (boxes.some((b) => b.x === bx && b.y === by)) return; // Behind is another box

        // Valid Push move
        const snapshot: MoveSnapshot = {
          player: { ...player },
          boxes: boxes.map((b) => ({ ...b }))
        };

        const updatedBoxes = boxes.map((b, idx) => 
          idx === pushedBoxIndex ? { ...b, x: bx, y: by } : b
        );

        const newDeadlocks = computeDeadlocks(board, updatedBoxes);
        const win = updatedBoxes.every((b) => board[b.y]?.[b.x] === TileType.TARGET);

        set({
          player: { x: tx, y: ty },
          boxes: updatedBoxes,
          moves: moves + 1,
          history: [...history, snapshot],
          isWon: win,
          deadlockedBoxIds: newDeadlocks
        });
      } else {
        // Simple step move
        const snapshot: MoveSnapshot = {
          player: { ...player },
          boxes: boxes.map((b) => ({ ...b }))
        };

        const win = boxes.every((b) => board[b.y]?.[b.x] === TileType.TARGET);

        set({
          player: { x: tx, y: ty },
          moves: moves + 1,
          history: [...history, snapshot],
          isWon: win
        });
      }
    },

    undo: () => {
      const { history } = get();
      if (history.length === 0) return;

      const newHistory = [...history];
      const snapshot = newHistory.pop()!;

      set({
        player: snapshot.player,
        boxes: snapshot.boxes,
        history: newHistory,
        moves: Math.max(0, get().moves - 1),
        isWon: false,
        deadlockedBoxIds: computeDeadlocks(get().board, snapshot.boxes)
      });
    },

    restart: () => {
      const { currentLevelIdx, loadLevel } = get();
      loadLevel(currentLevelIdx);
    },

    nextLevel: () => {
      const { currentLevelIdx, loadLevel } = get();
      loadLevel(currentLevelIdx + 1);
    },

    setMuted: (muted) => set({ isMuted: muted })
  }));
  ```

- [ ] **Step 4: Run Store tests again to check verification**
  Run: `vitest run packages/sokoban/src/store/useSokobanStore.test.ts`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add packages/sokoban/src/store/
  git commit -m "feat(sokoban): implement Zustand game state store with movements and win check"
  ```

---

### Task 4: Sound synthesizer Setup

**Files:**
- Create: `packages/sokoban/src/engine/synth.ts`

- [ ] **Step 1: Write programmatic Web Audio Synthesizer**
  Write to `packages/sokoban/src/engine/synth.ts`:
  ```typescript
  declare global {
    interface Window {
      webkitAudioContext?: typeof AudioContext;
    }
  }

  class SokobanSynth {
    ctx: AudioContext | null = null;
    muted = false;

    init(): void {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          this.ctx = new AudioContextClass();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        void this.ctx.resume().catch((err: unknown) => {
          console.warn("Failed to resume AudioContext:", err);
        });
      }
    }

    setMuted(val: boolean): void {
      this.muted = val;
    }

    playMove(): void {
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
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.start(now);
      osc.stop(now + 0.04);
    }

    playPush(): void {
      if (this.muted) return;
      this.init();
      const ctx = this.ctx;
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
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
      osc.frequency.setValueAtTime(130, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.15);
    }

    playWin(): void {
      if (this.muted) return;
      this.init();
      const ctx = this.ctx;
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

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
  }

  export const synth = new SokobanSynth();
  ```

- [ ] **Step 2: Connect sounds to store actions**
  Modify `packages/sokoban/src/store/useSokobanStore.ts` to trigger sounds:
  Import `synth` and call `synth.playMove()`, `synth.playPush()`, `synth.playError()`, `synth.playWin()` on respective actions.
  Update the `move` code block to:
  ```typescript
  // In imports:
  import { synth } from "../engine/synth";
  
  // Inside state move action, where wall block triggers:
  if (board[ty][tx] === TileType.WALL) {
    synth.playError();
    return;
  }
  
  // Inside state move action, where behind-wall or box block triggers:
  if (board[by][bx] === TileType.WALL) {
    synth.playError();
    return;
  }
  if (boxes.some((b) => b.x === bx && b.y === by)) {
    synth.playError();
    return;
  }
  
  // On successful push:
  synth.playPush();
  
  // On successful step:
  synth.playMove();

  // On loadLevel:
  synth.init();
  ```

- [ ] **Step 3: Verify build compiles cleanly**
  Run: `npm run typecheck`
  Expected: Success without errors.

- [ ] **Step 4: Commit**
  ```bash
  git add packages/sokoban/src/engine/synth.ts packages/sokoban/src/store/useSokobanStore.ts
  git commit -m "feat(sokoban): implement Web Audio synth engine and wire into moves store"
  ```

---

### Task 5: Component Layout and Game Board Rendering

**Files:**
- Create: `packages/sokoban/src/components/Board.tsx`
- Create: `packages/sokoban/src/components/HUD.tsx`
- Create: `packages/sokoban/src/components/LevelSelect.tsx`
- Create: `packages/sokoban/src/components/Controls.tsx`
- Create: `packages/sokoban/src/components/WinModal.tsx`

- [ ] **Step 1: Create HUD component**
  Write to `packages/sokoban/src/components/HUD.tsx`:
  ```typescript
  import React from "react";
  import { useSokobanStore } from "../store/useSokobanStore";
  import { SOKOBAN_LEVELS } from "../levels";

  interface HUDProps {
    onBack: () => void;
  }

  export default function HUD({ onBack }: HUDProps): React.ReactElement {
    const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);
    const moves = useSokobanStore((state) => state.moves);
    const undo = useSokobanStore((state) => state.undo);
    const restart = useSokobanStore((state) => state.restart);
    const history = useSokobanStore((state) => state.history);

    const levelName = SOKOBAN_LEVELS[currentLevelIdx]?.name || `Level ${currentLevelIdx + 1}`;

    return (
      <div className="w-full flex flex-col gap-2 p-2 border-b-2 border-gray-400 font-press text-[10px] select-none text-[#2b4c3f]">
        <div className="flex justify-between items-center w-full">
          <button onClick={onBack} className="pixel-btn px-2 py-1 text-[8px]" aria-label="Back to level selection">
            &lt; MENU
          </button>
          <span>{levelName.toUpperCase()}</span>
          <span>MOVES: {moves}</span>
        </div>
        <div className="flex gap-4 justify-center items-center mt-2">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="pixel-btn disabled:opacity-40 disabled:pointer-events-none"
            aria-label="Undo Move"
          >
            UNDO
          </button>
          <button onClick={restart} className="pixel-btn" aria-label="Restart Level">
            RESET
          </button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Create LevelSelect component**
  Write to `packages/sokoban/src/components/LevelSelect.tsx`:
  ```typescript
  import React from "react";
  import { SOKOBAN_LEVELS } from "../levels";

  interface LevelSelectProps {
    onSelect: (idx: number) => void;
  }

  export default function LevelSelect({ onSelect }: LevelSelectProps): React.ReactElement {
    return (
      <div className="flex flex-col items-center gap-4 text-[#2b4c3f] font-mono">
        <h2 className="font-press text-[12px] text-center my-2">SELECT LEVEL</h2>
        <div className="grid grid-cols-5 gap-3 max-h-[300px] overflow-y-auto p-2">
          {SOKOBAN_LEVELS.map((level, idx) => (
            <button
              key={level.id}
              onClick={() => onSelect(idx)}
              className="w-10 h-10 border-2 border-[#2b4c3f] flex items-center justify-center font-press text-[11px] bg-white cursor-pointer hover:bg-[#e2f4e5] hover:scale-105 active:translate-y-0.5"
              aria-label={`Select level ${idx + 1}`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Create Board component**
  Write to `packages/sokoban/src/components/Board.tsx`:
  ```typescript
  import React from "react";
  import { useSokobanStore } from "../store/useSokobanStore";
  import { TileType } from "../types";

  export default function Board(): React.ReactElement {
    const board = useSokobanStore((state) => state.board);
    const player = useSokobanStore((state) => state.player);
    const boxes = useSokobanStore((state) => state.boxes);
    const deadlockedBoxIds = useSokobanStore((state) => state.deadlockedBoxIds);

    if (board.length === 0) return <div>No Board Loaded</div>;

    const rows = board.length;
    const cols = board[0].length;

    // Render cells in absolute percentage placements
    const tileWidthPercent = 100 / cols;
    const tileHeightPercent = 100 / rows;

    return (
      <div
        className="relative w-full border-4 border-[#2b4c3f] bg-[#c3e2c6] shadow-inner select-none overflow-hidden"
        style={{ aspectRatio: `${cols} / ${rows}` }}
      >
        {/* Render Static Tiles (Wall, Floor, Target) */}
        {board.map((row, y) =>
          row.map((cell, x) => {
            if (cell === TileType.EMPTY) return null;

            return (
              <div
                key={`tile-${x}-${y}`}
                className="absolute"
                style={{
                  left: `${x * tileWidthPercent}%`,
                  top: `${y * tileHeightPercent}%`,
                  width: `${tileWidthPercent}%`,
                  height: `${tileHeightPercent}%`,
                }}
              >
                {cell === TileType.WALL && (
                  <div className="w-full h-full border-[1.5px] border-[#2b4c3f] bg-[#5a7d6c]" />
                )}
                {cell === TileType.FLOOR && (
                  <div className="w-full h-full bg-[#c3e2c6]" />
                )}
                {cell === TileType.TARGET && (
                  <div className="w-full h-full bg-[#c3e2c6] flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#CC6666] border border-[#2b4c3f] opacity-80" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Render Boxes */}
        {boxes.map((box) => {
          const isOnTarget = board[box.y]?.[box.x] === TileType.TARGET;
          const isDeadlocked = deadlockedBoxIds.includes(box.id);

          return (
            <div
              key={box.id}
              className="absolute p-[2px] transition-all duration-[120ms] ease-out z-10"
              style={{
                left: `${box.x * tileWidthPercent}%`,
                top: `${box.y * tileHeightPercent}%`,
                width: `${tileWidthPercent}%`,
                height: `${tileHeightPercent}%`,
              }}
            >
              <div
                className={`w-full h-full border-2 border-[#2b4c3f] flex items-center justify-center font-bold font-press text-[8px] transition-colors relative
                  ${isOnTarget ? "bg-[#e5c060] text-[#5c3c24]" : "bg-[#b08b5c] text-[#eae3d5]"}
                  ${isDeadlocked ? "opacity-60 border-dashed animate-pulse" : ""}
                `}
                style={{
                  clipPath: "polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)"
                }}
              >
                {/* Diagonal crate planks */}
                <div className="absolute inset-0 border border-[#2b4c3f] pointer-events-none opacity-20 m-1" />
                📦
                {isDeadlocked && (
                  <span className="absolute top-0 right-0 bg-[#CC6666] text-white text-[6px] px-0.5 rounded leading-none">
                    !
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Render Player */}
        <div
          className="absolute p-[2px] transition-all duration-[100ms] ease-out z-20"
          style={{
            left: `${player.x * tileWidthPercent}%`,
            top: `${player.y * tileHeightPercent}%`,
            width: `${tileWidthPercent}%`,
            height: `${tileHeightPercent}%`,
          }}
        >
          <div
            className="w-full h-full bg-[#CC6666] border-2 border-[#2b4c3f] flex items-center justify-center text-[12px] relative"
            style={{
              borderRadius: "50%"
            }}
          >
            {/* Player details */}
            <div className="absolute top-1 left-1.5 w-1 h-1 bg-white rounded-full" />
            <div className="absolute top-1 right-1.5 w-1 h-1 bg-white rounded-full" />
            🧑
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4: Create Swipe + Key Controls component**
  Write to `packages/sokoban/src/components/Controls.tsx`:
  ```typescript
  import React, { useEffect, useRef } from "react";
  import { useSokobanStore } from "../store/useSokobanStore";

  export default function Controls(): React.ReactElement {
    const move = useSokobanStore((state) => state.move);
    const isWon = useSokobanStore((state) => state.isWon);
    const touchStart = useRef<{ x: number; y: number } | null>(null);

    // Keyboard handlers
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent): void => {
        if (isWon) return;
        switch (e.key) {
          case "ArrowUp":
          case "w":
          case "W":
            e.preventDefault();
            move(0, -1);
            break;
          case "ArrowDown":
          case "s":
          case "S":
            e.preventDefault();
            move(0, 1);
            break;
          case "ArrowLeft":
          case "a":
          case "A":
            e.preventDefault();
            move(-1, 0);
            break;
          case "ArrowRight":
          case "d":
          case "D":
            e.preventDefault();
            move(1, 0);
            break;
          default:
            break;
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [move, isWon]);

    // Touch Swipe Handlers
    useEffect(() => {
      const handleTouchStart = (e: TouchEvent): void => {
        if (e.touches.length === 1) {
          touchStart.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
          };
        }
      };

      const handleTouchEnd = (e: TouchEvent): void => {
        if (!touchStart.current || e.changedTouches.length !== 1) return;
        
        const dx = e.changedTouches[0].clientX - touchStart.current.x;
        const dy = e.changedTouches[0].clientY - touchStart.current.y;
        
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        
        const minSwipeDistance = 30; // Threshold

        if (Math.max(absX, absY) > minSwipeDistance) {
          if (absX > absY) {
            // Horizontal swipe
            move(dx > 0 ? 1 : -1, 0);
          } else {
            // Vertical swipe
            move(0, dy > 0 ? 1 : -1);
          }
        }
        touchStart.current = null;
      };

      window.addEventListener("touchstart", handleTouchStart);
      window.addEventListener("touchend", handleTouchEnd);
      return () => {
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchend", handleTouchEnd);
      };
    }, [move]);

    return (
      <div className="w-full flex flex-col items-center select-none font-press text-[8px] text-[#2b4c3f] mt-4">
        {/* Virtual D-pad for precise mobile inputs */}
        <div className="grid grid-cols-3 gap-1.5 w-28 h-28 my-2">
          <div />
          <button
            onClick={() => move(0, -1)}
            className="pixel-btn flex items-center justify-center text-[10px]"
            aria-label="Move Up"
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => move(-1, 0)}
            className="pixel-btn flex items-center justify-center text-[10px]"
            aria-label="Move Left"
          >
            ◀
          </button>
          <div className="bg-[#2b4c3f] border-2 border-[#2b4c3f] opacity-10" />
          <button
            onClick={() => move(1, 0)}
            className="pixel-btn flex items-center justify-center text-[10px]"
            aria-label="Move Right"
          >
            ▶
          </button>
          <div />
          <button
            onClick={() => move(0, 1)}
            className="pixel-btn flex items-center justify-center text-[10px]"
            aria-label="Move Down"
          >
            ▼
          </button>
        </div>
        <p className="text-[6.5px] opacity-75 mt-1 text-center">
          SWIPE GRID OR TAP KEYS / ARROWS TO NAVIGATE
        </p>
      </div>
    );
  }
  ```

- [ ] **Step 5: Create WinModal component**
  Write to `packages/sokoban/src/components/WinModal.tsx`:
  ```typescript
  import React, { useEffect } from "react";
  import { useSokobanStore } from "../store/useSokobanStore";
  import { synth } from "../engine/synth";

  interface WinModalProps {
    onBack: () => void;
  }

  export default function WinModal({ onBack }: WinModalProps): React.ReactElement {
    const isWon = useSokobanStore((state) => state.isWon);
    const nextLevel = useSokobanStore((state) => state.nextLevel);
    const moves = useSokobanStore((state) => state.moves);

    useEffect(() => {
      if (isWon) {
        synth.playWin();
      }
    }, [isWon]);

    if (!isWon) return <React.Fragment />;

    return (
      <div className="absolute inset-0 bg-[#2b4c3f]/80 z-50 flex items-center justify-center p-4 select-none">
        <div className="border-4 border-[#2b4c3f] bg-white p-6 shadow-md max-w-xs w-full text-center flex flex-col items-center gap-4">
          <h2 className="font-press text-[14px] text-[#CC6666] animate-bounce">
            STAGE CLEAR!
          </h2>
          <p className="font-mono text-sm text-[#2b4c3f]">
            Finished in <span className="font-bold font-press text-[11px] text-[#CC6666]">{moves}</span> movements.
          </p>
          <div className="flex gap-4 mt-2">
            <button
              onClick={nextLevel}
              className="pixel-btn text-[10px] text-[#2b4c3f]"
              aria-label="Next stage"
            >
              NEXT &gt;
            </button>
            <button
              onClick={onBack}
              className="pixel-btn text-[10px] text-gray-500"
              aria-label="Main menu"
            >
              MENU
            </button>
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 6: Update SokobanApp entry file**
  Write to `packages/sokoban/src/SokobanApp.tsx`:
  ```typescript
  import React, { useState } from "react";
  import { useSokobanStore } from "./store/useSokobanStore";
  import HUD from "./components/HUD";
  import Board from "./components/Board";
  import LevelSelect from "./components/LevelSelect";
  import Controls from "./components/Controls";
  import WinModal from "./components/WinModal";

  export default function SokobanApp(): React.ReactElement {
    const [view, setView] = useState<"menu" | "game">("menu");
    const loadLevel = useSokobanStore((state) => state.loadLevel);

    const handleSelectLevel = (idx: number): void => {
      loadLevel(idx);
      setView("game");
    };

    return (
      <div className="w-full max-w-[450px] border-4 border-[#2b4c3f] bg-[#e2f4e5] p-4 shadow-md select-none relative flex flex-col items-center">
        {view === "menu" ? (
          <LevelSelect onSelect={handleSelectLevel} />
        ) : (
          <div className="flex flex-col gap-4 items-center w-full relative">
            <HUD onBack={() => setView("menu")} />
            <Board />
            <Controls />
            <WinModal onBack={() => setView("menu")} />
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 7: Run compilation checks**
  Run: `npm run typecheck`
  Expected: Complete compiles without errors.

- [ ] **Step 8: Commit**
  ```bash
  git add packages/sokoban/src/components/ packages/sokoban/src/SokobanApp.tsx
  git commit -m "feat(sokoban): implement board rendering and game interface components"
  ```

---

### Task 6: Shell Integration & Web App Federation

**Files:**
- Modify: `packages/shell/vite.config.ts`
- Modify: `packages/shell/src/types.ts`
- Modify: `packages/shell/src/App.tsx`
- Modify: `package.json`
- Modify: `scripts/build-static.sh`

- [ ] **Step 1: Register federated URL in shell's Vite settings**
  Modify `packages/shell/vite.config.ts` by updating `remotes` to:
  ```typescript
  remotes: {
    about: aboutUrl,
    posts: postsUrl,
    pets: petsUrl,
    shikaku: shikakuUrl,
    sokoban: isProd
      ? "/mfe/sokoban/assets/remoteEntry.js"
      : "http://localhost:3005/assets/remoteEntry.js",
  }
  ```

- [ ] **Step 2: Update Shell Tab Types**
  Modify `packages/shell/src/types.ts` to include the tab option:
  ```typescript
  export type Tab = "home" | "about" | "posts" | "pets" | "shikaku" | "sokoban";
  ```

- [ ] **Step 3: Update App.tsx imports and UI selectors**
  Modify `packages/shell/src/App.tsx` to lazy load `sokoban` and update tabs:
  - Add import:
    ```typescript
    const SokobanApp = lazy(
      () =>
        import("sokoban/SokobanApp").catch(() => ({
          default: () => <Fallback name="Sokoban" />,
        }))
    );
    ```
  - Inside `renderMainContent()` add the case:
    ```typescript
    case "sokoban":
      return <SokobanApp />;
    ```
  - In `ConsoleFrame`'s tab render list, add the Sokoban button! Wait, let's read `packages/shell/src/components/ConsoleFrame.tsx` first to see how buttons are rendered. Let's make sure we show the exact edits.
    Let's check `packages/shell/src/components/ConsoleFrame.tsx` later, but let's assume we update tabs there.

- [ ] **Step 4: Update Root package.json Dev Scripts**
  Modify `package.json` dev script:
  ```json
  "dev": "concurrently \"npm run dev -w packages/shell\" \"npm run dev -w packages/about\" \"npm run dev -w packages/posts\" \"npm run dev -w packages/pets\" \"npm run dev -w packages/shikaku\" \"npm run dev -w packages/sokoban\""
  ```

- [ ] **Step 5: Update build-static.sh build script**
  Modify `scripts/build-static.sh`:
  - Under `Build remotes`:
    ```bash
    npm run build -w packages/sokoban
    ```
  - Under `Arrange output folder`:
    ```bash
    mkdir -p dist/mfe/sokoban
    ```
  - Copy remote outputs:
    ```bash
    cp -r packages/sokoban/dist/* dist/mfe/sokoban/
    ```

- [ ] **Step 6: Confirm workspace types & build compiles**
  Run: `npm run typecheck`
  Expected: Clean compilation.

- [ ] **Step 7: Commit**
  ```bash
  git add packages/shell/vite.config.ts packages/shell/src/ App.tsx package.json scripts/build-static.sh
  git commit -m "feat(sokoban): integrate sokoban remote app into container dashboard"
  ```

---

### Task 7: Run-Time Validation & Deploy Testing

- [ ] **Step 1: Run the full test suite**
  Run: `npm run test`
  Expected: ALL test suites pass (including levels.test.ts and useSokobanStore.test.ts).

- [ ] **Step 2: Test production static build compilation**
  Run: `npm run build:static`
  Expected: Complete compilation success, and folder `dist/mfe/sokoban/` populated with `remoteEntry.js` and assets.

- [ ] **Step 3: Commit final build configuration**
  ```bash
  git commit --allow-empty -m "chore: verify local test suite and production build compilations"
  ```
