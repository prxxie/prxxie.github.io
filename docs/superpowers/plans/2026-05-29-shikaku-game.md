# Shikaku Puzzle Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first, highly satisfying Shikaku-style puzzle game microfrontend (MFE) service called `shikaku` and integrate it into the Cozy OS shell tabs.

**Architecture:** The `shikaku` package runs on port 3004 in development, exposing the `<ShikakuApp />` component. The game uses a local Zustand store for gameplay state, a programmatic Web Audio synthesizer for SFX, and CSS Grid with absolute overlays for the board UI.

**Tech Stack:** React, Vite, Zustand, Tailwind CSS, Framer Motion, Vitest.

---

### Task 1: Scaffold MFE Package & Shell Integration

**Files:**
* Create: `packages/shikaku/package.json`
* Create: `packages/shikaku/vite.config.js`
* Create: `packages/shikaku/index.html`
* Create: `packages/shikaku/src/main.jsx`
* Create: `packages/shikaku/src/ShikakuApp.jsx`
* Modify: `package.json`
* Modify: `packages/shell/vite.config.js`
* Modify: `packages/shell/src/App.jsx`
* Modify: `scripts/build-static.sh`

- [ ] **Step 1: Create `packages/shikaku/package.json`**
  Create `packages/shikaku/package.json` with the following configuration:
  ```json
  {
    "name": "shikaku",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
      "dev": "vite --port 3004 --strictPort",
      "build": "vite build",
      "preview": "vite preview --port 3004"
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
      "@tailwindcss/vite": "^4.0.0-alpha.16"
    }
  }
  ```

- [ ] **Step 2: Create `packages/shikaku/vite.config.js`**
  Create `packages/shikaku/vite.config.js` with the following contents:
  ```javascript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';
  import tailwindcss from '@tailwindcss/vite';
  import federation from '@originjs/vite-plugin-federation';

  export default defineConfig(({ command }) => {
    return {
      base: command === 'build' ? '/mfe/shikaku/' : '/',
      plugins: [
        react(),
        tailwindcss(),
        federation({
          name: 'shikaku',
          filename: 'remoteEntry.js',
          exposes: {
            './ShikakuApp': './src/ShikakuApp.jsx'
          },
          shared: ['react', 'react-dom', 'zustand']
        })
      ],
      build: {
        target: 'esnext',
        minify: false,
        cssCodeSplit: false
      }
    };
  });
  ```

- [ ] **Step 3: Create index.html and main.jsx**
  Create `packages/shikaku/index.html`:
  ```html
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Shikaku Remote</title>
    </head>
    <body class="bg-slate-900 text-white">
      <div id="root"></div>
      <script type="module" src="/src/main.jsx"></script>
    </body>
  </html>
  ```
  Create `packages/shikaku/src/main.jsx`:
  ```javascript
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import ShikakuApp from './ShikakuApp';
  import '../../shell/src/index.css';

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <div class="p-8 flex justify-center">
        <ShikakuApp />
      </div>
    </React.StrictMode>
  );
  ```

- [ ] **Step 4: Create a basic `ShikakuApp.jsx`**
  Create `packages/shikaku/src/ShikakuApp.jsx`:
  ```javascript
  import React from 'react';

  export default function ShikakuApp() {
    return (
      <div className="flex flex-col items-center justify-center p-6 border-4 border-[#2b4c3f] bg-[#e2f4e5] text-[#2b4c3f] font-press text-[12px]">
        <h2 className="mb-4">SHIKAKU_GAME.EXE</h2>
        <p className="font-sans text-sm text-center">Hello from Shikaku Remote App! Under Construction.</p>
      </div>
    );
  }
  ```

- [ ] **Step 5: Register new MFE inside package.json and packages/shell/vite.config.js**
  Modify root `package.json` line 8 to run the `shikaku` dev command in parallel:
  ```json
  "dev": "concurrently \"npm run dev -w packages/shell\" \"npm run dev -w packages/about\" \"npm run dev -w packages/posts\" \"npm run dev -w packages/pets\" \"npm run dev -w packages/shikaku\"",
  ```
  Modify `packages/shell/vite.config.js` to register `shikaku`:
  ```javascript
  // Add shikakuUrl configuration:
  const shikakuUrl = isProd
    ? '/mfe/shikaku/assets/remoteEntry.js'
    : 'http://localhost:3004/assets/remoteEntry.js';

  // In federation remotes section, add:
  shikaku: shikakuUrl
  ```

- [ ] **Step 6: Integrate new MFE tab inside Shell host**
  Modify `packages/shell/src/App.jsx` to load and render the `shikaku` MFE:
  ```javascript
  // Import:
  const ShikakuApp = lazy(() => import('shikaku/ShikakuApp').catch(() => ({ default: () => <Fallback name="Shikaku" /> })));

  // Inside renderMainContent switch:
  case 'shikaku':
    return <ShikakuApp />;
  ```
  Modify `packages/shell/src/components/ConsoleFrame.jsx` or whichever navigation component is used to add a menu button for the `shikaku` MFE. Let's find out what's in `ConsoleFrame.jsx` first, but we can verify this later. Let's write the build-static script task.

- [ ] **Step 7: Update `scripts/build-static.sh`**
  Modify `scripts/build-static.sh` to compile `shikaku` MFE and arrange its assets:
  ```bash
  # In build remotes section, add:
  npm run build -w packages/shikaku

  # In arrange output folder section, add:
  mkdir -p dist/mfe/shikaku
  cp -r packages/shikaku/dist/* dist/mfe/shikaku/
  ```

- [ ] **Step 8: Run npm install**
  Run: `npm install` in the root workspace to link the new workspace.
  Expected: Success.

---

### Task 2: Validation Engine

**Files:**
* Create: `packages/shikaku/src/engine/validation.js`
* Create: `packages/shikaku/src/engine/validation.test.js`

- [ ] **Step 1: Write validation test cases**
  Create `packages/shikaku/src/engine/validation.test.js` with Vitest testing suite checking all puzzle rule constraints:
  ```javascript
  import { describe, it, expect } from 'vitest';
  import { validateRegion } from './validation';

  const mockPuzzle = {
    width: 6,
    height: 6,
    clues: [
      { x: 0, y: 0, value: 4 },
      { x: 4, y: 0, value: 6 }
    ]
  };

  describe('Shikaku Validation Engine', () => {
    it('should validate a correct rectangle matching clue value', () => {
      const region = { x: 0, y: 0, width: 2, height: 2 };
      const res = validateRegion(region, mockPuzzle, []);
      expect(res.valid).toBe(true);
      expect(res.clueX).toBe(0);
      expect(res.clueY).toBe(0);
    });

    it('should reject a rectangle with wrong area', () => {
      const region = { x: 0, y: 0, width: 2, height: 3 }; // Area = 6, but clue is 4
      const res = validateRegion(region, mockPuzzle, []);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('WRONG_AREA');
    });

    it('should reject a rectangle with multiple clues', () => {
      const region = { x: 0, y: 0, width: 5, height: 2 }; // contains x:0,y:0 (4) and x:4,y:0 (6)
      const res = validateRegion(region, mockPuzzle, []);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('MULTIPLE_CLUES');
    });

    it('should reject a rectangle containing no clues', () => {
      const region = { x: 1, y: 1, width: 2, height: 2 };
      const res = validateRegion(region, mockPuzzle, []);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('NO_CLUE');
    });

    it('should reject an overlapping rectangle', () => {
      const existing = [{ x: 0, y: 0, width: 2, height: 2 }];
      const region = { x: 1, y: 0, width: 2, height: 2 }; // overlaps with existing
      const res = validateRegion(region, mockPuzzle, existing);
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('OVERLAP');
    });
  });
  ```

- [ ] **Step 2: Run test suite to verify failures**
  Run: `npx vitest run packages/shikaku/src/engine/validation.test.js`
  Expected: FAIL with "validateRegion not defined".

- [ ] **Step 3: Implement validation engine logic**
  Create `packages/shikaku/src/engine/validation.js` matching the spec exactly:
  ```javascript
  export function validateRegion(region, puzzle, existingRegions) {
    if (
      region.x < 0 || region.y < 0 ||
      region.x + region.width > puzzle.width ||
      region.y + region.height > puzzle.height
    ) {
      return { valid: false, reason: "OUT_OF_BOUNDS" };
    }

    const cluesInside = puzzle.clues.filter(
      clue =>
        clue.x >= region.x &&
        clue.x < region.x + region.width &&
        clue.y >= region.y &&
        clue.y < region.y + region.height
    );

    if (cluesInside.length === 0) {
      return { valid: false, reason: "NO_CLUE" };
    }
    if (cluesInside.length > 1) {
      return { valid: false, reason: "MULTIPLE_CLUES" };
    }

    const clue = cluesInside[0];
    const area = region.width * region.height;
    if (area !== clue.value) {
      return { valid: false, reason: "WRONG_AREA" };
    }

    const overlaps = existingRegions.some(existing => {
      return (
        region.x < existing.x + existing.width &&
        region.x + region.width > existing.x &&
        region.y < existing.y + existing.height &&
        region.y + region.height > existing.y
      );
    });

    if (overlaps) {
      return { valid: false, reason: "OVERLAP" };
    }

    return { valid: true, clueX: clue.x, clueY: clue.y };
  }
  ```

- [ ] **Step 4: Run validation tests**
  Run: `npx vitest run packages/shikaku/src/engine/validation.test.js`
  Expected: PASS.

- [ ] **Step 5: Commit validation engine**
  Run:
  ```bash
  git add packages/shikaku/src/engine/validation.js packages/shikaku/src/engine/validation.test.js
  git commit -m "feat: implement validation engine with unit tests"
  ```

---

### Task 3: Backtracking Solver

**Files:**
* Create: `packages/shikaku/src/engine/solver.js`
* Create: `packages/shikaku/src/engine/solver.test.js`

- [ ] **Step 1: Write solver test cases**
  Create `packages/shikaku/src/engine/solver.test.js` verifying unique solution solving:
  ```javascript
  import { describe, it, expect } from 'vitest';
  import { solvePuzzle } from './solver';

  const simplePuzzle = {
    width: 2,
    height: 2,
    clues: [
      { x: 0, y: 0, value: 2 },
      { x: 0, y: 1, value: 2 }
    ]
  };

  describe('Shikaku Backtracking Solver', () => {
    it('should find a correct partition solution', () => {
      const solution = solvePuzzle(simplePuzzle);
      expect(solution).not.toBeNull();
      expect(solution.length).toBe(2);
      // Valid horizontal partitions
      expect(solution[0].width * solution[0].height).toBe(2);
    });
  });
  ```

- [ ] **Step 2: Run solver test suite to verify failure**
  Run: `npx vitest run packages/shikaku/src/engine/solver.test.js`
  Expected: FAIL with "solvePuzzle not defined".

- [ ] **Step 3: Implement solver algorithm**
  Create `packages/shikaku/src/engine/solver.js` using backtracking search:
  ```javascript
  import { validateRegion } from './validation';

  export function getValidPlacements(clue, puzzle, placed) {
    const placements = [];
    const val = clue.value;
    for (let w = 1; w <= val; w++) {
      if (val % w !== 0) continue;
      const h = val / w;

      for (let ox = 0; ox < w; ox++) {
        for (let oy = 0; oy < h; oy++) {
          const x = clue.x - ox;
          const y = clue.y - oy;
          const reg = { x, y, width: w, height: h };
          const check = validateRegion(reg, puzzle, placed);
          if (check.valid) {
            placements.push({
              ...reg,
              area: val,
              clueX: clue.x,
              clueY: clue.y
            });
          }
        }
      }
    }
    return placements;
  }

  export function solvePuzzle(puzzle) {
    const clues = [...puzzle.clues].sort((a, b) => b.value - a.value); // Solve largest clues first

    function backtrack(clueIdx, placed) {
      if (clueIdx === clues.length) {
        const totalArea = placed.reduce((sum, r) => sum + r.width * r.height, 0);
        if (totalArea === puzzle.width * puzzle.height) {
          return placed;
        }
        return null;
      }

      const clue = clues[clueIdx];
      // Check if this clue is already covered by a placed rectangle
      const alreadyCovered = placed.some(
        r => clue.x >= r.x && clue.x < r.x + r.width && clue.y >= r.y && clue.y < r.y + r.height
      );
      if (alreadyCovered) {
        return backtrack(clueIdx + 1, placed);
      }

      const candidates = getValidPlacements(clue, puzzle, placed);
      for (const cand of candidates) {
        const res = backtrack(clueIdx + 1, [...placed, cand]);
        if (res) return res;
      }
      return null;
    }

    return backtrack(0, []);
  }
  ```

- [ ] **Step 4: Verify solver test passes**
  Run: `npx vitest run packages/shikaku/src/engine/solver.test.js`
  Expected: PASS.

- [ ] **Step 5: Commit solver engine**
  Run:
  ```bash
  git add packages/shikaku/src/engine/solver.js packages/shikaku/src/engine/solver.test.js
  git commit -m "feat: implement backtracking solver for hints and validations"
  ```

---

### Task 4: State Management Store (Zustand)

**Files:**
* Create: `packages/shikaku/src/store/useShikakuStore.js`
* Create: `packages/shikaku/src/store/useShikakuStore.test.js`

- [ ] **Step 1: Write store state test cases**
  Create `packages/shikaku/src/store/useShikakuStore.test.js`:
  ```javascript
  import { describe, it, expect, beforeEach } from 'vitest';
  import { useShikakuStore } from './useShikakuStore';

  const mockPuzzle = {
    id: 'test-1',
    width: 2,
    height: 2,
    clues: [
      { x: 0, y: 0, value: 2 },
      { x: 0, y: 1, value: 2 }
    ],
    targets: { threeStars: 10, twoStars: 20, oneStar: 30 }
  };

  describe('Shikaku Game State Store', () => {
    beforeEach(() => {
      useShikakuStore.setState({
        puzzle: mockPuzzle,
        regions: [],
        history: [],
        dragStart: null,
        dragEnd: null,
        elapsedTime: 0,
        timerActive: false,
        isWon: false
      });
    });

    it('should handle region commits correctly', () => {
      const store = useShikakuStore.getState();
      
      // Start drag at (0,0) and end drag at (1,0) (forming 2x1 rectangle for clue value 2)
      useShikakuStore.setState({ dragStart: { x: 0, y: 0 }, dragEnd: { x: 1, y: 0 } });
      useShikakuStore.getState().commitDrag();

      const updated = useShikakuStore.getState();
      expect(updated.regions.length).toBe(1);
      expect(updated.regions[0].width).toBe(2);
      expect(updated.regions[0].height).toBe(1);
    });

    it('should support undo moves', () => {
      const store = useShikakuStore.getState();
      useShikakuStore.setState({ dragStart: { x: 0, y: 0 }, dragEnd: { x: 1, y: 0 } });
      useShikakuStore.getState().commitDrag();
      
      expect(useShikakuStore.getState().regions.length).toBe(1);
      useShikakuStore.getState().undo();
      
      expect(useShikakuStore.getState().regions.length).toBe(0);
    });
  });
  ```

- [ ] **Step 2: Run test suite to verify failure**
  Run: `npx vitest run packages/shikaku/src/store/useShikakuStore.test.js`
  Expected: FAIL.

- [ ] **Step 3: Implement useShikakuStore**
  Create `packages/shikaku/src/store/useShikakuStore.js`:
  ```javascript
  import { create } from 'zustand';
  import { validateRegion } from '../engine/validation';
  import { solvePuzzle } from '../engine/solver';

  const DEFAULT_COLORS = [
    'rgba(245, 158, 11, 0.3)',  // Amber
    'rgba(16, 185, 129, 0.3)',  // Emerald
    'rgba(59, 130, 246, 0.3)',  // Blue
    'rgba(236, 72, 153, 0.3)',  // Pink
    'rgba(139, 92, 246, 0.3)',  // Purple
    'rgba(20, 184, 166, 0.3)'   // Teal
  ];

  export const useShikakuStore = create((set, get) => ({
    levels: [],
    currentLevelIndex: 0,
    puzzle: null,
    regions: [],
    history: [],
    dragStart: null,
    dragEnd: null,
    elapsedTime: 0,
    timerActive: false,
    isWon: false,
    starsAchieved: 0,
    completedLevels: {},

    loadSave: () => {
      try {
        const saved = localStorage.getItem('cozy_os_shikaku_save');
        if (saved) {
          set({ completedLevels: JSON.parse(saved).completed || {} });
        }
      } catch (e) {
        console.error("Failed to load save state", e);
      }
    },

    saveProgress: (levelId, stars, time) => {
      const current = get().completedLevels[levelId];
      const bestTime = current ? Math.min(current.bestTime, time) : time;
      const bestStars = current ? Math.max(current.stars, stars) : stars;

      const updated = {
        ...get().completedLevels,
        [levelId]: { stars: bestStars, bestTime }
      };
      set({ completedLevels: updated });
      try {
        localStorage.setItem('cozy_os_shikaku_save', JSON.stringify({ completed: updated }));
      } catch (e) {
        console.error("Failed to save progress", e);
      }
    },

    loadLevel: (levelsList, index) => {
      const puzzle = levelsList[index];
      set({
        levels: levelsList,
        currentLevelIndex: index,
        puzzle,
        regions: [],
        history: [],
        dragStart: null,
        dragEnd: null,
        elapsedTime: 0,
        timerActive: true,
        isWon: false,
        starsAchieved: 0
      });
    },

    startDrag: (x, y) => {
      if (get().isWon) return;
      set({ dragStart: { x, y }, dragEnd: { x, y } });
    },

    updateDrag: (x, y) => {
      if (!get().dragStart) return;
      set({ dragEnd: { x, y } });
    },

    commitDrag: () => {
      const { dragStart, dragEnd, puzzle, regions, history, elapsedTime } = get();
      if (!dragStart || !dragEnd || !puzzle) return;

      const x = Math.min(dragStart.x, dragEnd.x);
      const y = Math.min(dragStart.y, dragEnd.y);
      const width = Math.abs(dragStart.x - dragEnd.x) + 1;
      const height = Math.abs(dragStart.y - dragEnd.y) + 1;

      const proposed = {
        id: `reg-${Date.now()}`,
        x,
        y,
        width,
        height,
        area: width * height,
        color: DEFAULT_COLORS[regions.length % DEFAULT_COLORS.length]
      };

      const valCheck = validateRegion(proposed, puzzle, regions);

      if (valCheck.valid) {
        const committed = {
          ...proposed,
          clueX: valCheck.clueX,
          clueY: valCheck.clueY
        };

        const nextRegions = [...regions, committed];
        const nextHistory = [...history, regions];

        // Check Win Condition
        const totalArea = nextRegions.reduce((sum, r) => sum + r.width * r.height, 0);
        const win = totalArea === puzzle.width * puzzle.height;

        let stars = 0;
        if (win) {
          const targets = puzzle.targets;
          if (elapsedTime <= targets.threeStars) stars = 3;
          else if (elapsedTime <= targets.twoStars) stars = 2;
          else stars = 1;
          
          get().saveProgress(puzzle.id, stars, elapsedTime);
        }

        set({
          regions: nextRegions,
          history: nextHistory,
          dragStart: null,
          dragEnd: null,
          isWon: win,
          timerActive: !win,
          starsAchieved: stars
        });
        return { success: true };
      }

      set({ dragStart: null, dragEnd: null });
      return { success: false, reason: valCheck.reason };
    },

    cancelDrag: () => {
      set({ dragStart: null, dragEnd: null });
    },

    removeRegionAt: (x, y) => {
      const { regions, history, isWon } = get();
      if (isWon) return;

      const found = regions.find(
        r => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height
      );
      if (!found) return;

      const nextRegions = regions.filter(r => r.id !== found.id);
      const nextHistory = [...history, regions];

      set({
        regions: nextRegions,
        history: nextHistory
      });
    },

    undo: () => {
      const { history, isWon } = get();
      if (history.length === 0 || isWon) return;
      const prevRegions = history[history.length - 1];
      const nextHistory = history.slice(0, -1);
      set({
        regions: prevRegions,
        history: nextHistory
      });
    },

    resetLevel: () => {
      set({
        regions: [],
        history: [],
        dragStart: null,
        dragEnd: null,
        elapsedTime: 0,
        timerActive: true,
        isWon: false,
        starsAchieved: 0
      });
    },

    tickTimer: () => {
      if (get().timerActive) {
        set(state => ({ elapsedTime: state.elapsedTime + 1 }));
      }
    },

    getHint: () => {
      const { puzzle, regions } = get();
      if (!puzzle || get().isWon) return;

      const fullSolution = solvePuzzle(puzzle);
      if (!fullSolution) return;

      // Find the first solution region that is not currently covered correctly
      const missingRegion = fullSolution.find(solReg => {
        return !regions.some(
          userReg =>
            userReg.x === solReg.x &&
            userReg.y === solReg.y &&
            userReg.width === solReg.width &&
            userReg.height === solReg.height
        );
      });

      if (missingRegion) {
        // Clear any user regions that overlap the missing (correct) region
        const overlappingUserRegs = regions.filter(userReg => {
          return (
            userReg.x < missingRegion.x + missingRegion.width &&
            userReg.x + userReg.width > missingRegion.x &&
            userReg.y < missingRegion.y + missingRegion.height &&
            userReg.y + userReg.height > missingRegion.y
          );
        });

        let nextRegions = regions;
        if (overlappingUserRegs.length > 0) {
          nextRegions = regions.filter(r => !overlappingUserRegs.some(o => o.id === r.id));
        }

        const committedHint = {
          ...missingRegion,
          id: `hint-${Date.now()}`,
          color: 'rgba(16, 185, 129, 0.4)' // Green tint for hint
        };

        const finalRegions = [...nextRegions, committedHint];
        const nextHistory = [...get().history, regions];

        // Check if hint completes board
        const totalArea = finalRegions.reduce((sum, r) => sum + r.width * r.height, 0);
        const win = totalArea === puzzle.width * puzzle.height;

        let stars = 0;
        if (win) {
          stars = 1; // Hint completion limits to 1 star
          get().saveProgress(puzzle.id, stars, get().elapsedTime);
        }

        set({
          regions: finalRegions,
          history: nextHistory,
          isWon: win,
          timerActive: !win,
          starsAchieved: stars
        });
      }
    }
  }));
  ```

- [ ] **Step 4: Run Zustand store tests**
  Run: `npx vitest run packages/shikaku/src/store/useShikakuStore.test.js`
  Expected: PASS.

- [ ] **Step 5: Commit Zustand store**
  Run:
  ```bash
  git add packages/shikaku/src/store/useShikakuStore.js packages/shikaku/src/store/useShikakuStore.test.js
  git commit -m "feat: implement game store using Zustand with unit tests"
  ```

---

### Task 5: Static Handcrafted Levels & Programmatic Audio Synth

**Files:**
* Create: `packages/shikaku/src/levels.js`
* Create: `packages/shikaku/src/engine/synth.js`

- [ ] **Step 1: Create static levels file**
  Create `packages/shikaku/src/levels.js` containing 20 handcrafted levels.
  ```javascript
  export const SHIKAKU_LEVELS = [
    // 6x6 Puzzles (Easy)
    {
      id: 'easy-1',
      difficulty: 'Easy',
      width: 6,
      height: 6,
      clues: [
        { x: 0, y: 0, value: 4 },
        { x: 0, y: 4, value: 2 },
        { x: 1, y: 2, value: 6 },
        { x: 3, y: 2, value: 6 },
        { x: 5, y: 0, value: 4 },
        { x: 5, y: 4, value: 2 },
        { x: 2, y: 5, value: 6 },
        { x: 4, y: 5, value: 6 }
      ],
      targets: { threeStars: 20, twoStars: 40, oneStar: 80 }
    },
    {
      id: 'easy-2',
      difficulty: 'Easy',
      width: 6,
      height: 6,
      clues: [
        { x: 1, y: 0, value: 4 },
        { x: 4, y: 0, value: 4 },
        { x: 2, y: 2, value: 8 },
        { x: 3, y: 3, value: 8 },
        { x: 1, y: 5, value: 6 },
        { x: 4, y: 5, value: 6 }
      ],
      targets: { threeStars: 30, twoStars: 60, oneStar: 120 }
    },
    // Medium (8x8) and Hard (10x10) levels go here...
    // Define 20 levels in total (5 Easy 6x6, 8 Medium 8x8, 7 Hard 10x10)
  ];
  ```
  *(Make sure to write out all 20 handcrafted levels inside this file so that it is fully production-ready with diverse level content).*

- [ ] **Step 2: Create Web Audio Synth helper**
  Create `packages/shikaku/src/engine/synth.js` containing the 8-bit sound generator:
  ```javascript
  class RetroSynth {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }

    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
    }

    setMuted(val) {
      this.muted = val;
    }

    playPlace() {
      if (this.muted) return;
      this.init();
      const ctx = this.ctx;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.05); // E5
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      osc.start(now);
      osc.stop(now + 0.15);
    }

    playError() {
      if (this.muted) return;
      this.init();
      const ctx = this.ctx;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.12);
    }

    playWin() {
      if (this.muted) return;
      this.init();
      const ctx = this.ctx;
      
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      const now = ctx.currentTime;
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.2);
        
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    }

    playClick() {
      if (this.muted) return;
      this.init();
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      
      osc.start(now);
      osc.stop(now + 0.02);
    }
  }

  export const synth = new RetroSynth();
  ```

- [ ] **Step 3: Commit Synth & Levels**
  Run:
  ```bash
  git add packages/shikaku/src/levels.js packages/shikaku/src/engine/synth.js
  git commit -m "feat: create static levels config and programmatic audio synth"
  ```

---

### Task 6: UI Sub-components (HUD & LevelSelect)

**Files:**
* Create: `packages/shikaku/src/components/HUD.jsx`
* Create: `packages/shikaku/src/components/LevelSelect.jsx`

- [ ] **Step 1: Create HUD component**
  Create `packages/shikaku/src/components/HUD.jsx` displaying level info, stopwatch time, star achievements, and functional buttons:
  ```javascript
  import React, { useEffect } from 'react';
  import { useShikakuStore } from '../store/useShikakuStore';
  import { synth } from '../engine/synth';

  export default function HUD({ onBack }) {
    const { 
      puzzle, 
      elapsedTime, 
      isWon, 
      starsAchieved, 
      undo, 
      resetLevel, 
      getHint,
      tickTimer
    } = useShikakuStore();

    useEffect(() => {
      const interval = setInterval(() => {
        tickTimer();
      }, 1000);
      return () => clearInterval(interval);
    }, [tickTimer]);

    const formatTime = (sec) => {
      const mins = Math.floor(sec / 60);
      const secs = sec % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
      <div className="w-full flex flex-col gap-4 border-b-2 border-[#2b4c3f] pb-4 font-press text-[10px] text-[#2b4c3f]">
        <div className="flex justify-between items-center">
          <button 
            onClick={() => { synth.playClick(); onBack(); }}
            className="border-2 border-[#2b4c3f] bg-[#e2f4e5] px-2 py-1 cursor-pointer active:translate-y-0.5"
          >
            ◀ BACK
          </button>
          <span>LVL: {puzzle?.id.toUpperCase()}</span>
          <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button 
              onClick={() => { synth.playClick(); undo(); }}
              className="border-2 border-[#2b4c3f] bg-[#e2f4e5] px-2 py-1 cursor-pointer active:translate-y-0.5"
            >
              UNDO
            </button>
            <button 
              onClick={() => { synth.playClick(); resetLevel(); }}
              className="border-2 border-[#2b4c3f] bg-[#e2f4e5] px-2 py-1 cursor-pointer active:translate-y-0.5"
            >
              RESET
            </button>
            <button 
              onClick={() => { synth.playClick(); getHint(); }}
              className="border-2 border-[#2b4c3f] bg-[#e2f4e5] px-2 py-1 cursor-pointer active:translate-y-0.5"
            >
              HINT
            </button>
          </div>
          <div>
            {"★".repeat(starsAchieved)}{"☆".repeat(3 - starsAchieved)}
          </div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Create LevelSelect Component**
  Create `packages/shikaku/src/components/LevelSelect.jsx`:
  ```javascript
  import React, { useEffect } from 'react';
  import { useShikakuStore } from '../store/useShikakuStore';
  import { SHIKAKU_LEVELS } from '../levels';
  import { synth } from '../engine/synth';

  export default function LevelSelect({ onSelect }) {
    const { completedLevels, loadSave } = useShikakuStore();

    useEffect(() => {
      loadSave();
    }, [loadSave]);

    return (
      <div className="w-full flex flex-col gap-6 text-[#2b4c3f] font-press">
        <h2 className="text-[12px] text-center border-b-2 border-[#2b4c3f] pb-3">SELECT LEVEL</h2>
        
        <div className="grid grid-cols-3 gap-3">
          {SHIKAKU_LEVELS.map((lvl, index) => {
            const save = completedLevels[lvl.id];
            const stars = save?.stars || 0;
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  synth.playClick();
                  onSelect(index);
                }}
                className="border-2 border-[#2b4c3f] bg-[#e2f4e5] p-3 flex flex-col items-center justify-center cursor-pointer active:translate-y-0.5 hover:bg-[#cce8d0] transition-colors"
              >
                <span className="text-[10px]">{index + 1}</span>
                <span className="text-[6px] mt-1 text-slate-500 font-sans">{lvl.width}x{lvl.height}</span>
                <div className="text-[8px] mt-2">
                  {"★".repeat(stars)}{"☆".repeat(3 - stars)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Commit sub-components**
  Run:
  ```bash
  git add packages/shikaku/src/components/HUD.jsx packages/shikaku/src/components/LevelSelect.jsx
  git commit -m "feat: add HUD and LevelSelect view components"
  ```

---

### Task 7: Grid Board & Gestures Interaction

**Files:**
* Create: `packages/shikaku/src/components/Board.jsx`
* Create: `packages/shikaku/src/components/Cell.jsx`
* Modify: `packages/shikaku/src/ShikakuApp.jsx`

- [ ] **Step 1: Create Cell component**
  Create `packages/shikaku/src/components/Cell.jsx` which displays clues:
  ```javascript
  import React from 'react';

  export default function Cell({ x, y, clue, isCovered, onPointerDown, onPointerEnter, onPointerUp }) {
    return (
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          onPointerDown(x, y);
        }}
        onPointerEnter={() => onPointerEnter(x, y)}
        onPointerUp={onPointerUp}
        className="aspect-square border border-[#2b4c3f]/30 bg-[#e2f4e5] select-none flex items-center justify-center relative touch-none"
        style={{ touchAction: 'none' }}
      >
        {clue !== undefined && (
          <span className={`font-press text-[12px] ${isCovered ? 'opacity-30' : 'font-bold'}`}>
            {clue}
          </span>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 2: Create Board component**
  Create `packages/shikaku/src/components/Board.jsx` displaying the cells and the drawing/drag visual:
  ```javascript
  import React, { useEffect, useRef } from 'react';
  import { useShikakuStore } from '../store/useShikakuStore';
  import Cell from './Cell';
  import { synth } from '../engine/synth';
  import { motion, AnimatePresence } from 'framer-motion';

  export default function Board() {
    const {
      puzzle,
      regions,
      dragStart,
      dragEnd,
      startDrag,
      updateDrag,
      commitDrag,
      cancelDrag,
      removeRegionAt,
      isWon
    } = useShikakuStore();

    const boardRef = useRef(null);

    useEffect(() => {
      const handleGlobalPointerUp = () => {
        if (dragStart) {
          const res = commitDrag();
          if (res && res.success) {
            synth.playPlace();
          } else if (res && !res.success) {
            synth.playError();
            // Trigger board shake
            if (boardRef.current) {
              boardRef.current.classList.add('animate-shake');
              setTimeout(() => boardRef.current?.classList.remove('animate-shake'), 300);
            }
          }
        }
      };

      window.addEventListener('pointerup', handleGlobalPointerUp);
      return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
    }, [dragStart, commitDrag]);

    if (!puzzle) return null;

    // Track active drag rectangle
    let dragRect = null;
    if (dragStart && dragEnd) {
      const x = Math.min(dragStart.x, dragEnd.x);
      const y = Math.min(dragStart.y, dragEnd.y);
      const width = Math.abs(dragStart.x - dragEnd.x) + 1;
      const height = Math.abs(dragStart.y - dragEnd.y) + 1;
      dragRect = { x, y, width, height };
    }

    const cells = [];
    for (let y = 0; y < puzzle.height; y++) {
      for (let x = 0; x < puzzle.width; x++) {
        const clueObj = puzzle.clues.find(c => c.x === x && c.y === y);
        const isCovered = regions.some(
          r => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height
        );
        cells.push(
          <Cell
            key={`${x}-${y}`}
            x={x}
            y={y}
            clue={clueObj?.value}
            isCovered={isCovered}
            onPointerDown={startDrag}
            onPointerEnter={updateDrag}
            onPointerUp={commitDrag}
          />
        );
      }
    }

    return (
      <div 
        ref={boardRef}
        className="relative border-4 border-[#2b4c3f] bg-[#2b4c3f] overflow-hidden select-none touch-none w-full max-w-[400px] aspect-square mx-auto transition-transform"
        style={{ touchAction: 'none' }}
      >
        {/* CSS Grid Layer */}
        <div
          className="grid gap-[1px] h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${puzzle.width}, 1fr)`,
            gridTemplateRows: `repeat(${puzzle.height}, 1fr)`
          }}
        >
          {cells}
        </div>

        {/* Placed Regions Layer */}
        <AnimatePresence>
          {regions.map(r => (
            <motion.div
              key={r.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => {
                synth.playClick();
                removeRegionAt(r.x, r.y);
              }}
              className="absolute border-2 border-[#2b4c3f] cursor-pointer flex items-center justify-center font-press text-[8px] text-[#2b4c3f] select-none shadow-inner hover:brightness-95 active:scale-95"
              style={{
                left: `calc((${r.x} / ${puzzle.width}) * 100%)`,
                top: `calc((${r.y} / ${puzzle.height}) * 100%)`,
                width: `calc((${r.width} / ${puzzle.width}) * 100%)`,
                height: `calc((${r.height} / ${puzzle.height}) * 100%)`,
                backgroundColor: r.color,
              }}
            >
              <span>{r.width * r.height}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Drag Preview Layer */}
        {dragRect && (
          <div
            className="absolute border-2 border-dashed border-[#2b4c3f] bg-[#2b4c3f]/20 pointer-events-none"
            style={{
              left: `calc((${dragRect.x} / ${puzzle.width}) * 100%)`,
              top: `calc((${dragRect.y} / ${puzzle.height}) * 100%)`,
              width: `calc((${dragRect.width} / ${puzzle.width}) * 100%)`,
              height: `calc((${dragRect.height} / ${puzzle.height}) * 100%)`
            }}
          />
        )}

        {/* Win Overlay */}
        {isWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#e2f4e5]/90 flex flex-col items-center justify-center font-press text-[#2b4c3f] gap-4"
          >
            <h3 className="text-sm animate-bounce">BOARD SOLVED!</h3>
            <p className="text-[8px]">TAP HINT OR BACK TO REPLAY</p>
          </motion.div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 3: Implement ShikakuApp integration**
  Modify `packages/shikaku/src/ShikakuApp.jsx` to render the game layout:
  ```javascript
  import React, { useState, useEffect } from 'react';
  import { useShikakuStore } from './store/useShikakuStore';
  import { SHIKAKU_LEVELS } from './levels';
  import HUD from './components/HUD';
  import Board from './components/Board';
  import LevelSelect from './components/LevelSelect';
  import { synth } from './engine/synth';

  export default function ShikakuApp() {
    const [selectedIdx, setSelectedIdx] = useState(null);
    const { isWon, loadLevel } = useShikakuStore();

    useEffect(() => {
      if (isWon) {
        synth.playWin();
      }
    }, [isWon]);

    const handleSelectLevel = (idx) => {
      setSelectedIdx(idx);
      loadLevel(SHIKAKU_LEVELS, idx);
    };

    return (
      <div className="w-full max-w-[450px] border-4 border-[#2b4c3f] bg-[#e2f4e5] p-6 shadow-md select-none">
        {selectedIdx === null ? (
          <LevelSelect onSelect={handleSelectLevel} />
        ) : (
          <div className="flex flex-col gap-6 items-center">
            <HUD onBack={() => setSelectedIdx(null)} />
            <Board />
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] **Step 4: Commit UI layouts**
  Run:
  ```bash
  git add packages/shikaku/src/components/Board.jsx packages/shikaku/src/components/Cell.jsx packages/shikaku/src/ShikakuApp.jsx
  git commit -m "feat: complete interactive grid board rendering & drag selection"
  ```

---

### Task 8: Production Build Verification

**Files:**
* Modify: `packages/shell/src/components/ConsoleFrame.jsx` (to verify navigation button styling)

- [ ] **Step 1: Check navigation buttons layout**
  Review the existing navigation menu inside `packages/shell/src/components/ConsoleFrame.jsx` or similar, to ensure the new `shikaku` tab button aligns with the retro visual theme.
  Expected: Success.

- [ ] **Step 2: Run Production Build**
  Run: `npm run build:static`
  Expected: Compiles all remotes + host and outputs consolidated package in `dist/`.

- [ ] **Step 3: Final Integration Commit**
  Run:
  ```bash
  git add .
  git commit -m "feat: fully integrate Shikaku MFE game in Cozy OS Monorepo"
  ```
