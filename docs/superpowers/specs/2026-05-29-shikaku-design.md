# Shikaku Web Puzzle Game: Technical Design Specification

This document details the architectural design and implementation plan for adding a Shikaku-style mobile-first puzzle game as a new microfrontend (MFE) service called **`shikaku`** under the Cozy OS monorepo structure.

## 1. Game Overview
Shikaku is a grid-based logic puzzle game.
* **Goal**: Partition the grid into rectangular regions.
* **Rules**:
  1. Each rectangle must contain exactly one number (clue).
  2. The area of each rectangle (width × height) must equal the value of the contained clue.
  3. No rectangles can overlap.
  4. The entire board must be fully tiled (all cells covered).
* **Progression & Scoring**:
  * Puzzles are grouped by difficulty (Easy 6x6, Medium 8x8, Hard 10x10).
  * A stopwatch counts up in seconds during gameplay.
  * Completing the puzzle under target times awards 1, 2, or 3 stars.
  * Stars and completion times are persisted in `localStorage`.

---

## 2. Directory & Monorepo Integration

The new microfrontend package will be added under `packages/shikaku`.

### 2.1 Directory Structure
```
packages/shikaku/
├── package.json
├── vite.config.js
├── src/
│   ├── main.jsx (MFE entry for independent testing)
│   ├── index.html
│   ├── ShikakuApp.jsx (Main remote wrapper component)
│   ├── components/
│   │   ├── Board.jsx (CSS Grid board component)
│   │   ├── Cell.jsx (Grid cells rendering numbers/borders)
│   │   ├── HUD.jsx (Score, stopwatch, controls)
│   │   └── LevelSelect.jsx (Card/grid selection screen)
│   ├── engine/
│   │   ├── validation.js (Rectangle validation rules)
│   │   ├── solver.js (Backtracking solver & hints)
│   │   └── synth.js (Programmatic Web Audio synth)
│   ├── store/
│   │   └── useShikakuStore.js (Zustand game state)
│   └── levels.js (JSON static handcrafted levels)
```

### 2.2 Module Federation Config
`packages/shikaku/vite.config.js`:
* **Port**: Runs on local port `3004`.
* **Exposes**: Exposes `./ShikakuApp` pointing to `./src/ShikakuApp.jsx`.
* **Shared**: Shares `react`, `react-dom`, and `zustand`.

`packages/shell/vite.config.js`:
* Adds remote entry for `shikaku` pointing to `http://localhost:3004/assets/remoteEntry.js` (dev) or `/mfe/shikaku/assets/remoteEntry.js` (prod).

---

## 3. Data Models

### 3.1 Clue & Puzzle Definitions
```typescript
export interface Clue {
  x: number;
  y: number;
  value: number;
}

export interface Puzzle {
  id: string;
  width: number;
  height: number;
  clues: Clue[];
  targets: {
    threeStars: number; // in seconds
    twoStars: number;   // in seconds
    oneStar: number;    // in seconds
  };
}
```

### 3.2 Rectangle Region
```typescript
export interface Region {
  id: string;      // Unique identifier (e.g. "region-1")
  x: number;       // Top-left x
  y: number;       // Top-left y
  width: number;
  height: number;
  area: number;
  clueX: number;   // Coordinate of the clue this region covers
  clueY: number;   // Coordinate of the clue this region covers
  color: string;   // Visual background theme/color
}
```

---

## 4. State Management (Zustand)

The Zustand store (`useShikakuStore`) coordinates the core game loops:

```typescript
interface ShikakuState {
  // Game state
  levels: Puzzle[];
  currentLevelIndex: number;
  puzzle: Puzzle | null;
  regions: Region[];
  history: Region[][]; // Undo stack
  
  // Drag states
  dragStart: { x: number; y: number } | null;
  dragEnd: { x: number; y: number } | null;
  
  // HUD states
  elapsedTime: number;
  timerActive: boolean;
  isWon: boolean;
  starsAchieved: number;
  completedLevels: Record<string, { stars: number; bestTime: number }>;

  // Actions
  loadLevel: (index: number) => void;
  startDrag: (x: number, y: number) => void;
  updateDrag: (x: number, y: number) => void;
  commitDrag: () => void;
  cancelDrag: () => void;
  removeRegionAt: (x: number, y: number) => void;
  undo: () => void;
  resetLevel: () => void;
  tickTimer: () => void;
  getHint: () => void;
}
```

### 4.1 State Mutation Logic
* **`commitDrag`**:
  1. Computes boundaries of the drawn region.
  2. Runs `validateRegion(proposed, puzzle, regions)`.
  3. If valid, adds to `regions` array, pushes previous state to `history`, and checks if board is filled (`isWon`). Plays **success sound**.
  4. If invalid, does not mutate `regions` and plays **error sound**.
  5. Clears `dragStart` and `dragEnd`.
* **`removeRegionAt`**:
  * Scans `regions` to find any region covering the coordinates $(x,y)$.
  * Removes it, pushes change to `history`, and checks win status. Plays a short deletion click sound.

---

## 5. Game Engine Math

### 5.1 Validation Engine (`validation.js`)
```javascript
export function validateRegion(region, puzzle, existingRegions) {
  // 1. Check if bounds are inside the grid
  if (
    region.x < 0 || region.y < 0 ||
    region.x + region.width > puzzle.width ||
    region.y + region.height > puzzle.height
  ) {
    return { valid: false, reason: "OUT_OF_BOUNDS" };
  }

  // 2. Count clues covered by this rectangle
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

  // 3. Verify area matching clue value
  const clue = cluesInside[0];
  const area = region.width * region.height;
  if (area !== clue.value) {
    return { valid: false, reason: "WRONG_AREA" };
  }

  // 4. Overlap Check
  const overlaps = existingRegions.some(existing => {
    // Check if regions intersect
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

### 5.2 Backtracking Solver (`solver.js`)
* Runs a recursive backtracking search to solve the grid.
* Used for generating **hints**:
  * Given current `regions` placed, identifies if they conflict with the solution.
  * If they conflict, the hint system will suggest removing a conflicting region.
  * If they do not conflict, it runs the solver from the current state and highlights one correct rectangle from the solution.

---

## 6. UI & Interaction Specification

### 6.1 Layout & Grid System
* Responsive layout inside the **ConsoleFrame**. The board cells use a CSS grid:
  ```html
  <div style="display: grid; grid-template-columns: repeat(width, 1fr); grid-template-rows: repeat(height, 1fr);">
    <!-- cells -->
  </div>
  ```
* Cells have minimum size `44px` for mobile touch target comfort.
* `touch-action: none` prevents screen scroll conflicts during drags.

### 6.2 Visual Aesthetics & Polish
* Matches **Cozy OS** palette: primary `#2b4c3f` and background `#e2f4e5`.
* Grid cells have light double-pixel lines. Clues are rendered in large pixelated numbers.
* Rectangles have a translucent background (colored based on their clue coordinate index or value) and a thick solid border.
* **Framer Motion Effects**:
  * Placement: scale-in + bounce.
  * Invalid Move: shake animation on the grid container.
  * Completion: Ripple overlay and green pixel-art confetti.

### 6.3 Programmatic Sound Synthesis (`synth.js`)
Generates 8-bit sound effects using the browser’s **Web Audio API**:
* **Placement Sound**: Sine wave, C5 (523Hz) followed by E5 (659Hz) over 80ms.
* **Error Sound**: Square wave, 150Hz decaying over 120ms with low-pass filter.
* **Win Fanfare**: Upbeat arpeggio: C5 -> E5 -> G5 -> C6 (duration: 350ms total).

---

## 7. Progress & Save System
* Completing a level saves details in LocalStorage:
  ```json
  "cozy_os_shikaku_save": {
    "completed": {
      "level-id-01": { "stars": 3, "bestTime": 14 },
      "level-id-02": { "stars": 2, "bestTime": 42 }
    }
  }
  ```
* Selecting the next level reads this store to render star badges and unlock states.

---

## 8. Definition of MVP Complete
The MFE is complete when:
1. It is fully integrated as a tab within the monorepo Shell.
2. The Drag-to-Draw gesture is stable on mobile (no scrolling interruption) and desktop.
3. 20 handcrafted levels are present (Easy 6x6, Medium 8x8, Hard 10x10).
4. Audio sounds and haptic vibrations function correctly.
5. Level progression and star scores are persistently saved.
