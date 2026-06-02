# Cozy OS Slitherlink MFE Spec

**Date:** 2026-06-02  
**Status:** Approved  
**Path:** `docs/superpowers/specs/2026-06-02-slitherlink-design.md`

---

## 1. Overview & Goals
Slitherlink is a classic logic puzzle played on a grid of dots. The objective is to connect adjacent dots with horizontal or vertical lines to form a single, continuous, non-intersecting closed loop. Numbers within the grid cells indicate how many of their four surrounding edges are segments of the loop.

This specification details the implementation of Slitherlink as a React-based Micro Frontend (MFE) for Cozy OS, utilizing Module Federation. The app matches the CRT/phosphor amber-glow aesthetic of the shell and integrates with the shared `ProgressService` for persistence.

---

## 2. Core Game Rules & Mechanics
1. **The Loop:** The lines must form a single, continuous closed loop.
   - No branching (no T-junctions or degree-3/degree-4 intersections).
   - No self-intersection (lines cannot cross).
   - No disjoint loops (cannot have two independent closed loops).
2. **Cell Clues:** Cells with numbers (0, 1, 2, 3) must have exactly that many of their 4 adjacent edges active in the loop. Unnumbered cells can have any number of active edges.
3. **Controls (Phosphor Edge Tap):**
   - Click/tap on an edge (horizontal or vertical spacing between dots) to cycle its state:  
     `Empty (none)` &rarr; `Line (active)` &rarr; `Cross (X)` &rarr; `Empty (none)`.
   - Visual clues highlight instantly:
     - **Green:** Cell has exactly the correct number of adjacent lines.
     - **Red:** Cell has more adjacent lines than its clue specifies.
     - **Amber/Default:** Under-satisfied clue.

---

## 3. Data Representation & Coordinate System
For a puzzle of cell width $W$ and cell height $H$:
- **Cells:** Indexed by `(x, y)` where $0 \le x < W$ and $0 \le y < H$.
- **Dots (Vertices):** Indexed by `(col, row)` where $0 \le col \le W$ and $0 \le row \le H$.
- **Horizontal Edges (H-Edges):** Grid of size $W \times (H+1)$. Indexed as `H(x, y)` where $0 \le x < W$ and $0 \le y \le H$.
- **Vertical Edges (V-Edges):** Grid of size $(W+1) \times H$. Indexed as `V(x, y)` where $0 \le x \le W$ and $0 \le y < H$.

### Edge Selection Mapping
- An H-edge at `H(x, y)` connects dot `(x, y)` to dot `(x+1, y)`.
- A V-edge at `V(x, y)` connects dot `(x, y)` to dot `(x, y+1)`.

### Cell Boundary Mapping
For cell `(x, y)`, the 4 adjacent edges are:
1. Top: `H(x, y)`
2. Bottom: `H(x, y+1)`
3. Left: `V(x, y)`
4. Right: `V(x+1, y)`

---

## 4. Loop Validation Algorithm
A puzzle is solved when the following conditions are met:
1. **Line Count Match:** Every cell `(x, y)` with a clue $C \in [0, 3]$ must have exactly $C$ adjacent edges in the `line` state.
2. **Degree Verification:** Every dot `(col, row)` on the board must have a degree of exactly `0` (unused) or `2` (exactly one entry line and one exit line). Any degree of `1`, `3`, or `4` is invalid.
3. **Single Loop Connection:**
   - If the total number of active `line` edges is 0, the board is not solved.
   - Find any dot `(col, row)` with degree `2`.
   - Traverse the connected path of lines, keeping track of visited edges.
   - Since all active dots have degree 2, traversal will eventually return to the starting dot, forming a closed loop.
   - Count the number of unique visited edges. If `visitedLinesCount === totalActiveLinesCount`, then a single connected loop is verified. If the count is less, it implies disjoint sub-loops, which is invalid.

---

## 5. UI/UX & Layout Structure
- **Theme:** Amber monochrome phosphor CRT screen (`#FFB000` text/accents, `#050505` background, `#805800` muted).
- **Audio:** Native `Web Audio API` synthesizer generating retro waveforms for clicks, place, undo, error, and win.
- **Views:**
  1. **Level Select:**
     - Segmented by Difficulty: `EASY (5x5)` and `MEDIUM (6x6)`.
     - Displays level numbers (1-5) and star badges based on completion.
  2. **Gameplay HUD:**
     - Left: `◀ MENU` button.
     - Center: Level identifier (e.g. `SL-EASY-1`).
     - Right: Elapsed time display (`MM:SS`).
     - Sub-bar: Buttons for `UNDO`, `RESET`, `MUTE`.
  3. **Board Panel:**
     - Centered grid of glowing dots and clues.
     - Edge hitboxes are styled wider than the visible lines to ensure easy tapping on touch screens.
     - Sound effects trigger on edge toggle.
  4. **Win Modal:**
     - Pop-up showing:
       - `LEVEL SOLVED!`
       - Time taken and target times for stars.
       - Star score evaluation (1 to 3 stars).
       - Back to menu button.

---

## 6. Target Stars Criteria (Time-Based)
Each level has specific time thresholds:
- **3 Stars:** Completed in $\le T_{3}$ seconds.
- **2 Stars:** Completed in $\le T_{2}$ seconds.
- **1 Star:** Completed with basic success.

---

## 7. Level Configuration Data
Five Easy (5x5) and five Medium (6x6) levels will be pre-baked. Below is the structural schema:

### Schema
```typescript
export interface Level {
  id: string;
  difficulty: "Easy" | "Medium";
  width: number;
  height: number;
  clues: Record<string, number>; // "x,y" -> clue
  targets: {
    threeStars: number; // seconds
    twoStars: number;
  };
}
```

### Pre-baked Levels
1. **SL-EASY-1 (5x5):**
   - Clues: `{"0,0": 3, "2,0": 1, "4,0": 3, "1,1": 1, "3,1": 2, "2,2": 2, "1,3": 2, "3,3": 1, "0,4": 3, "2,4": 3, "4,4": 3}`
   - Targets: 3 stars $\le 60$s, 2 stars $\le 120$s.
2. **SL-EASY-2 (5x5):**
   - Clues: `{"0,1": 2, "1,0": 3, "2,1": 1, "3,0": 3, "4,1": 2, "2,2": 3, "0,3": 2, "2,3": 2, "4,3": 2, "1,4": 3, "3,4": 3}`
   - Targets: 3 stars $\le 90$s, 2 stars $\le 180$s.
3. **SL-EASY-3 (5x5):**
   - Clues: `{"1,1": 2, "2,1": 0, "3,1": 2, "2,2": 1, "1,3": 2, "2,3": 2, "3,3": 2}`
   - Targets: 3 stars $\le 75$s, 2 stars $\le 150$s.
4. **SL-EASY-4 (5x5):**
   - Clues: `{"0,0": 2, "1,0": 2, "3,0": 3, "0,2": 3, "2,2": 2, "4,2": 1, "3,4": 2, "4,4": 2}`
   - Targets: 3 stars $\le 80$s, 2 stars $\le 160$s.
5. **SL-EASY-5 (5x5):**
   - Clues: `{"1,1": 3, "3,1": 3, "2,2": 2, "1,3": 1, "3,3": 1}`
   - Targets: 3 stars $\le 50$s, 2 stars $\le 100$s.
6. **SL-MED-1 (6x6):**
   - Clues: `{"0,0": 3, "2,0": 2, "4,0": 2, "1,1": 3, "3,1": 1, "5,1": 2, "0,2": 1, "2,2": 2, "4,2": 2, "1,3": 2, "3,3": 3, "5,3": 1, "0,4": 2, "2,4": 1, "4,4": 2, "1,5": 3, "3,5": 2, "5,5": 3}`
   - Targets: 3 stars $\le 150$s, 2 stars $\le 300$s.
7. **SL-MED-2 (6x6):**
   - Clues: `{"0,1": 2, "2,1": 3, "4,1": 2, "1,2": 1, "3,2": 2, "5,2": 1, "0,3": 3, "2,3": 0, "4,3": 3, "1,4": 2, "3,4": 2, "5,4": 2}`
   - Targets: 3 stars $\le 180$s, 2 stars $\le 360$s.
8. **SL-MED-3 (6x6):**
   - Clues: `{"1,0": 3, "3,0": 3, "1,2": 2, "2,2": 2, "3,2": 2, "4,2": 2, "1,4": 1, "2,4": 3, "3,4": 3, "4,4": 1}`
   - Targets: 3 stars $\le 200$s, 2 stars $\le 400$s.
9. **SL-MED-4 (6x6):**
   - Clues: `{"0,0": 2, "5,0": 2, "1,1": 2, "4,1": 2, "2,2": 3, "3,2": 3, "2,3": 1, "3,3": 1, "1,4": 3, "4,4": 3, "0,5": 2, "5,5": 2}`
   - Targets: 3 stars $\le 160$s, 2 stars $\le 320$s.
10. **SL-MED-5 (6x6):**
    - Clues: `{"0,0": 3, "1,0": 2, "4,0": 2, "5,0": 3, "2,2": 1, "3,2": 1, "2,3": 2, "3,3": 2, "0,5": 3, "1,5": 1, "4,5": 1, "5,5": 3}`
    - Targets: 3 stars $\le 170$s, 2 stars $\le 340$s.

---

## 8. Cozy OS Shell & MFE Federation Wiring
1. **Module Name:** `slitherlink`
2. **Federation Entry:** `remoteEntry.js`
3. **Exposed Component:** `./SlitherlinkApp`
4. **Shell Hook Integration:**
   - Slitherlink imports `ProgressService` and `LocalProgressRepository` from the `"shared"` package.
   - On winning a level, it calls:
     ```typescript
     await progressService.completeLevelWithStars("slitherlink", levelId, stars);
     ```
   - This dispatches the `"cozyos:progress-updated"` event, notifying the shell and the virtual pet.

---

## 9. Test Suite Requirements
Test files will live alongside components (e.g. `SlitherlinkApp.test.tsx` and `validation.test.ts`).
1. **Engine Validation Tests:** Focus on testing validation edge cases:
   - Partial loops.
   - Branching degree intersections (3-way junction).
   - Double loops (two closed loops).
   - Valid completed loops.
2. **HUD & State Tests:** Verify timer increment, undo/redo limits, and score calculations.
3. **Component Interaction Tests:** Mock drawing interactions on dot edges to verify edge state transitions.
