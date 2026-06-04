# 50 Progressive Shikaku Levels Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand Shikaku puzzle game levels to 50 with random non-uniform shapes, progressive scaling, unique solution guarantees, and a scrollable Level Select grid.

**Architecture:** Use a local recursive partitioning generator script to pre-bake 50 valid, uniquely-solvable level definitions, outputting them directly into the frontend levels database file. Modify the Level Select screen to render in a scrollable 5-column grid.

**Tech Stack:** React, Tailwind CSS, TypeScript, Vitest.

---

## File Structure

- Modify: `packages/shikaku/src/levels.ts` — Contains the 50 static level configuration objects.
- Modify: `packages/shikaku/src/levels.test.ts` — Verifies that all 50 levels are solvable.
- Modify: `packages/shikaku/src/components/LevelSelect.tsx` — Displays the scrollable 5-column grid.
- Modify: `packages/shell/src/index.css` — Global CSS stylesheet to append retro scrollbar rules.

---

### Task 1: Write and Execute Level Generator Script

**Files:**
- Create: `/home/cpt0912/.gemini/antigravity-cli/brain/d1ceba9f-026d-49ca-9dfc-4051cef2e3fc/scratch/generate-puzzles.ts`

- [ ] **Step 1: Write the puzzle generator script**
  Create the scratch file `/home/cpt0912/.gemini/antigravity-cli/brain/d1ceba9f-026d-49ca-9dfc-4051cef2e3fc/scratch/generate-puzzles.ts` containing the recursive partitioner, the unique solution validator, and level assembly code.

```typescript
import * as fs from "fs";
import * as path from "path";

interface Clue {
  x: number;
  y: number;
  value: number;
}

interface Puzzle {
  id: string;
  difficulty: "Easy" | "Medium" | "Hard";
  width: number;
  height: number;
  clues: Clue[];
  targets: {
    threeStars: number;
    twoStars: number;
    oneStar: number;
  };
}

interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Check uniqueness of solutions
function countSolutions(puzzle: { width: number; height: number; clues: Clue[] }, limit = 2): number {
  const clues = [...puzzle.clues].sort((a, b) => b.value - a.value);
  
  const clueCandidates = clues.map(clue => {
    const placements: { x: number; y: number; w: number; h: number }[] = [];
    const val = clue.value;
    for (let w = 1; w <= val; w++) {
      if (val % w !== 0) continue;
      const h = val / w;
      for (let ox = 0; ox < w; ox++) {
        const x = clue.x - ox;
        if (x < 0 || x + w > puzzle.width) continue;
        for (let oy = 0; oy < h; oy++) {
          const y = clue.y - oy;
          if (y < 0 || y + h > puzzle.height) continue;
          
          // Must not cover any other clue
          const coversOther = puzzle.clues.some(c => 
            c !== clue && c.x >= x && c.x < x + w && c.y >= y && c.y < y + h
          );
          if (coversOther) continue;
          placements.push({ x, y, w, h });
        }
      }
    }
    return placements;
  });

  if (clueCandidates.some(c => c.length === 0)) return 0;

  let solutionCount = 0;
  const grid = Array(puzzle.height).fill(0).map(() => Array(puzzle.width).fill(false));

  function backtrack(clueIdx: number): void {
    if (solutionCount >= limit) return;
    if (clueIdx === clues.length) {
      solutionCount++;
      return;
    }

    const candidates = clueCandidates[clueIdx];
    for (const cand of candidates) {
      let overlap = false;
      for (let r = 0; r < cand.h; r++) {
        for (let c = 0; c < cand.w; c++) {
          if (grid[cand.y + r][cand.x + c]) {
            overlap = true;
            break;
          }
        }
        if (overlap) break;
      }

      if (!overlap) {
        for (let r = 0; r < cand.h; r++) {
          for (let c = 0; c < cand.w; c++) {
            grid[cand.y + r][cand.x + c] = true;
          }
        }
        backtrack(clueIdx + 1);
        for (let r = 0; r < cand.h; r++) {
          for (let c = 0; c < cand.w; c++) {
            grid[cand.y + r][cand.x + c] = false;
          }
        }
      }
    }
  }

  backtrack(0);
  return solutionCount;
}

// Recursive Partitioning Algorithm
function partition(x: number, y: number, w: number, h: number): Region[] {
  const area = w * h;
  // If small area, keep as is
  if (area <= 4 || (area <= 12 && Math.random() < 0.3)) {
    return [{ x, y, w, h }];
  }

  const canSplitVertically = w >= 2;
  const canSplitHorizontally = h >= 2;

  if (!canSplitVertically && !canSplitHorizontally) {
    return [{ x, y, w, h }];
  }

  // Randomly split orientation
  const splitVertically = canSplitVertically && (!canSplitHorizontally || Math.random() < 0.5);

  if (splitVertically) {
    const sx = Math.floor(Math.random() * (w - 1)) + 1;
    return [
      ...partition(x, y, sx, h),
      ...partition(x + sx, y, w - sx, h)
    ];
  } else {
    const sy = Math.floor(Math.random() * (h - 1)) + 1;
    return [
      ...partition(x, y, w, sy),
      ...partition(x, y + sy, w, h - sy)
    ];
  }
}

function generateSinglePuzzle(width: number, height: number, difficulty: "Easy" | "Medium" | "Hard", id: string, targets: any): Puzzle {
  let attempts = 0;
  while (attempts < 2000) {
    attempts++;
    const regions = partition(0, 0, width, height);
    const clues: Clue[] = regions.map(r => {
      const clueX = r.x + Math.floor(Math.random() * r.w);
      const clueY = r.y + Math.floor(Math.random() * r.h);
      return { x: clueX, y: clueY, value: r.w * r.h };
    });

    const puzzle = { id, difficulty, width, height, clues, targets };
    if (countSolutions(puzzle) === 1) {
      return puzzle;
    }
  }
  // Fallback to simple grids if random fails, but retry should find it
  throw new Error(`Failed to generate unique puzzle for level ${id}`);
}

const levels: Puzzle[] = [];

// Difficulty config
const spec = [
  // Easy
  { range: [1, 3], size: 4, diff: "Easy" as const, times: { threeStars: 10, twoStars: 20, oneStar: 40 } },
  { range: [4, 6], size: 5, diff: "Easy" as const, times: { threeStars: 15, twoStars: 30, oneStar: 60 } },
  { range: [7, 10], size: 6, diff: "Easy" as const, times: { threeStars: 20, twoStars: 40, oneStar: 80 } },
  { range: [11, 15], size: 7, diff: "Easy" as const, times: { threeStars: 30, twoStars: 60, oneStar: 120 } },
  // Medium
  { range: [16, 25], size: 8, diff: "Medium" as const, times: { threeStars: 45, twoStars: 90, oneStar: 180 } },
  { range: [26, 35], size: 9, diff: "Medium" as const, times: { threeStars: 60, twoStars: 120, oneStar: 240 } },
  // Hard
  { range: [36, 40], size: 10, diff: "Hard" as const, times: { threeStars: 90, twoStars: 180, oneStar: 360 } },
  { range: [41, 45], size: 11, diff: "Hard" as const, times: { threeStars: 120, twoStars: 240, oneStar: 480 } },
  { range: [46, 50], size: 12, diff: "Hard" as const, times: { threeStars: 150, twoStars: 300, oneStar: 600 } },
];

console.log("Generating 50 unique progressive puzzles...");
for (const config of spec) {
  const [start, end] = config.range;
  for (let i = start; i <= end; i++) {
    const suffix = i - start + 1;
    const puzzleId = `${config.diff.toLowerCase()}-${suffix}`;
    const p = generateSinglePuzzle(config.size, config.size, config.diff, puzzleId, config.times);
    levels.push(p);
    console.log(`Generated level ${i}/50: ${puzzleId} (${config.size}x${config.size})`);
  }
}

const fileContent = `import type { Puzzle } from "./types";\n\nexport const SHIKAKU_LEVELS: Puzzle[] = ${JSON.stringify(levels, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, "../packages/shikaku/src/levels.ts"), fileContent);
console.log("Written successfully to packages/shikaku/src/levels.ts!");
```

- [ ] **Step 2: Execute the generation script**
  Run the script using `vitest` or `vite-node` in the repository folder.
  Run: `npx vitest run /home/cpt0912/.gemini/antigravity-cli/brain/d1ceba9f-026d-49ca-9dfc-4051cef2e3fc/scratch/generate-puzzles.ts` (vitest will execute TS directly).
  Expected: Successful completion with logs printing generated levels 1 to 50.

- [ ] **Step 3: Verify levels.ts content**
  Check that `packages/shikaku/src/levels.ts` has been written and contains exactly 50 levels.

- [ ] **Step 4: Clean up generator file**
  Remove the scratch generator file from the scratch folder.

---

### Task 2: Update Levels Unit Tests

**Files:**
- Modify: `packages/shikaku/src/levels.test.ts`

- [ ] **Step 1: Edit levels.test.ts**
  Update the tests to verify exactly 50 levels (15 Easy, 20 Medium, 15 Hard) and adjust size assertions.

```diff
-  it("should verify there are exactly 20 levels", () => {
-    expect(SHIKAKU_LEVELS.length).toBe(20);
-  });
-
-  it("should verify there are 6 Easy, 7 Medium, and 7 Hard levels", () => {
-    const easy = SHIKAKU_LEVELS.filter((l) => l.difficulty === "Easy");
-    const medium = SHIKAKU_LEVELS.filter((l) => l.difficulty === "Medium");
-    const hard = SHIKAKU_LEVELS.filter((l) => l.difficulty === "Hard");
-
-    expect(easy.length).toBe(6);
-    expect(medium.length).toBe(7);
-    expect(hard.length).toBe(7);
+  it("should verify there are exactly 50 levels", () => {
+    expect(SHIKAKU_LEVELS.length).toBe(50);
+  });
+
+  it("should verify there are 15 Easy, 20 Medium, and 15 Hard levels", () => {
+    const easy = SHIKAKU_LEVELS.filter((l) => l.difficulty === "Easy");
+    const medium = SHIKAKU_LEVELS.filter((l) => l.difficulty === "Medium");
+    const hard = SHIKAKU_LEVELS.filter((l) => l.difficulty === "Hard");
+
+    expect(easy.length).toBe(15);
+    expect(medium.length).toBe(20);
+    expect(hard.length).toBe(15);
```
And adjust size expectations:
```diff
     easy.forEach((l) => {
       if (l.id === "easy-1" || l.id === "easy-2" || l.id === "easy-3") {
         expect(l.width).toBe(4);
         expect(l.height).toBe(4);
-      } else if (l.id === "easy-2") {
+      } else if (l.id === "easy-4" || l.id === "easy-5" || l.id === "easy-6") {
         expect(l.width).toBe(5);
         expect(l.height).toBe(5);
+      } else if (l.id === "easy-7" || l.id === "easy-8" || l.id === "easy-9" || l.id === "easy-10") {
+        expect(l.width).toBe(6);
+        expect(l.height).toBe(6);
       } else {
-        expect(l.width).toBe(6);
-        expect(l.height).toBe(6);
+        expect(l.width).toBe(7);
+        expect(l.height).toBe(7);
       }
     });
 
     medium.forEach((l) => {
-      expect(l.width).toBe(8);
-      expect(l.height).toBe(8);
+      const numId = parseInt(l.id.split("-")[1], 10);
+      if (numId <= 10) {
+        expect(l.width).toBe(8);
+        expect(l.height).toBe(8);
+      } else {
+        expect(l.width).toBe(9);
+        expect(l.height).toBe(9);
+      }
     });
 
     hard.forEach((l) => {
-      expect(l.width).toBe(10);
-      expect(l.height).toBe(10);
+      const numId = parseInt(l.id.split("-")[1], 10);
+      if (numId <= 5) {
+        expect(l.width).toBe(10);
+        expect(l.height).toBe(10);
+      } else if (numId <= 10) {
+        expect(l.width).toBe(11);
+        expect(l.height).toBe(11);
+      } else {
+        expect(l.width).toBe(12);
+        expect(l.height).toBe(12);
+      }
     });
```

- [ ] **Step 2: Run vitest on the levels test**
  Run: `npm run test`
  Expected: All 50 tests pass successfully.

- [ ] **Step 3: Commit**
  Run: `git add packages/shikaku/src/levels.ts packages/shikaku/src/levels.test.ts`
  Run: `git commit -m "feat: add 50 progressive unique shikaku levels and update tests"`

---

### Task 3: Implement Scrollable 5-Column Level Grid in UI

**Files:**
- Modify: `packages/shell/src/index.css`
- Modify: `packages/shikaku/src/components/LevelSelect.tsx`

- [ ] **Step 1: Add Custom Scrollbar rules to global CSS**
  Modify `packages/shell/src/index.css` to add the `.retro-scrollbar` class.

```css
/* Custom retro scrollbar styling */
.retro-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.retro-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.retro-scrollbar::-webkit-scrollbar-thumb {
  background-color: var(--color-cozy-muted);
  border: 1px solid var(--color-cozy-border);
}
.retro-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-cozy-border);
}
```

- [ ] **Step 2: Update LevelSelect.tsx grid layout and scrolling**
  Modify `packages/shikaku/src/components/LevelSelect.tsx` to wrap the grid in a scrollable, `.retro-scrollbar` container and change the grid class to `grid-cols-5 gap-2`.

```diff
-      <div className="grid grid-cols-3 gap-3">
-        {SHIKAKU_LEVELS.map((lvl, index) => {
-          const save = completedLevels[lvl.id];
-          const stars = save ? save.stars : 0;
-          return (
-            <button
-              key={lvl.id}
-              onClick={() => {
-                synth.playClick();
-                onSelect(index);
-              }}
-              className="border border-cozy-border bg-black text-cozy-text p-3 flex flex-col items-center justify-center cursor-pointer active:translate-y-0.5 hover:bg-cozy-text hover:text-black transition-colors"
-            >
-              <span className="text-[10px]">{index + 1}</span>
-              <span className="text-[6px] mt-1 text-cozy-muted font-sans">
-                {lvl.width}x{lvl.height}
-              </span>
-              <div className="text-[8px] mt-2">
-                {"★".repeat(stars)}
-                {"☆".repeat(3 - stars)}
-              </div>
-            </button>
-          );
-        })}
-      </div>
+      <div className="max-h-[300px] overflow-y-auto pr-1 retro-scrollbar">
+        <div className="grid grid-cols-5 gap-2">
+          {SHIKAKU_LEVELS.map((lvl, index) => {
+            const save = completedLevels[lvl.id];
+            const stars = save ? save.stars : 0;
+            return (
+              <button
+                key={lvl.id}
+                onClick={() => {
+                  synth.playClick();
+                  onSelect(index);
+                }}
+                className="border border-cozy-border bg-black text-cozy-text p-2 flex flex-col items-center justify-center cursor-pointer active:translate-y-0.5 hover:bg-cozy-text hover:text-black transition-colors"
+              >
+                <span className="text-[10px]">{index + 1}</span>
                <span className="text-[6px] mt-1 text-cozy-muted font-sans">
                  {lvl.width}x{lvl.height}
                </span>
                <div className="text-[7px] mt-1.5 leading-none">
                  {"★".repeat(stars)}
                  {"☆".repeat(3 - stars)}
                </div>
-            </button>
+              </button>
+            );
+          })}
+        </div>
+      </div>
```

- [ ] **Step 3: Run full workspace tests**
  Run: `npm run test`
  Expected: PASS

- [ ] **Step 4: Commit UI changes**
  Run: `git add packages/shell/src/index.css packages/shikaku/src/components/LevelSelect.tsx`
  Run: `git commit -m "feat: adjust LevelSelect layout to scrollable 5-column grid"`
