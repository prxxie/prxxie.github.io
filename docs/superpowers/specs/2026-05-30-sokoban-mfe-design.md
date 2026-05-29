# Technical Design Document: Minimal Sokoban MFE

**Date:** 2026-05-30  
**Status:** Approved  
**Author:** Antigravity (AI Coding Assistant)  

---

## 1. Project Overview & Vision

The Sokoban MFE is a lightweight, responsive, and tactile web-based Sokoban game running as a federated micro-frontend inside the `prxxie-home` workspace. The game features satisfying retro tactile feedback, smooth slide animations, progressive puzzles, and mobile-first touch optimization.

### Key Goals
- **Monorepo Integration**: Seamless deployment as a federated remote alongside Shikaku, Pets, etc.
- **Tactile Movement**: Smooth slide animations using percentage-based rendering and CSS transitions.
- **Audio Engine**: Self-contained Web Audio API synthesizer for zero-asset retro tap/thunk/chime sounds.
- **Deadlock Warning**: Static corner deadlock analysis to notify players when a box becomes permanently stuck.
- **Mobile First**: Combined high-fidelity swipe gesture handling and a virtual on-screen retro D-pad.

---

## 2. Monorepo & MFE Integration Architecture

The monorepo contains multiple micro-frontends integrated via `@originjs/vite-plugin-federation`.

### Monorepo Layout
```
packages/
├── shell/             # Container host dashboard
├── shikaku/           # Grid logic puzzle
└── sokoban/           # [NEW] Sokoban MFE
```

### Module Federation Settings

#### 1. Remote MFE Config (`packages/sokoban/vite.config.ts`)
- **Port**: `3005`
- **Output File**: `remoteEntry.js`
- **Exposed Component**: `./SokobanApp` pointing to `src/SokobanApp.tsx`
- **Shared packages**: `react`, `react-dom`, `zustand`

#### 2. Host Integration (`packages/shell/vite.config.ts`)
- **Remote entry definition**:
  - Dev: `http://localhost:3005/assets/remoteEntry.js`
  - Prod: `/mfe/sokoban/assets/remoteEntry.js`

#### 3. Root Dev Script Update (`package.json`)
- Add `sokoban` package dev script to concurrently process:
  ```json
  "dev": "concurrently ... \"npm run dev -w packages/sokoban\""
  ```

#### 4. Root Build Pipeline (`scripts/build-static.sh`)
- Add commands to build `sokoban` and place output under `dist/mfe/sokoban/`.

---

## 3. Game Engine & State Management

All game actions are managed using a central Zustand store to keep logic clean and decoupled from layout concerns.

### 3.1. Data Models
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
  id: string; // Used as stable animation key
  x: number;
  y: number;
}

export interface MoveSnapshot {
  player: Player;
  boxes: { id: string; x: number; y: number }[];
}
```

### 3.2. Zustand Store Interface
```typescript
interface SokobanState {
  // Game state
  currentLevelIdx: number;
  board: TileType[][];
  player: Player;
  boxes: Box[];
  moves: number;
  history: MoveSnapshot[];
  isWon: boolean;
  isMuted: boolean;
  deadlockedBoxIds: string[];

  // Action methods
  loadLevel: (levelIdx: number) => void;
  move: (dx: number, dy: number) => void;
  undo: () => void;
  restart: () => void;
  nextLevel: () => void;
  setMuted: (muted: boolean) => void;
}
```

### 3.3. Win Condition
A puzzle is solved when every box is on a target tile:
$$\text{isWon} = \text{boxes.every(box } \Rightarrow \text{board[box.y][box.x] === TileType.TARGET)}$$

---

## 4. Collision Checking & Push Mechanics

The movement flow executes deterministically:

1. **Calculate Positions**:
   - Player target: `(tx, ty) = (player.x + dx, player.y + dy)`
   - Behind-box cell: `(bx, by) = (tx + dx, ty + dy)`

2. **Check Player Path**:
   - If `board[ty][tx] === TileType.WALL`, trigger **invalid move** bump and audio clip.

3. **Check Box Push**:
   - Locate any box currently at `(tx, ty)`.
   - If found:
     - If `board[by][bx] === TileType.WALL`, trigger **invalid move** bump and audio.
     - If another box is already at `(bx, by)`, trigger **invalid move** bump and audio.
     - Otherwise, commit **push**:
       - Push snapshot onto `history`.
       - Update box coordinates to `(bx, by)`.
       - Update player coordinates to `(tx, ty)`.
       - Play thunk sound.
       - Increment move count.
   - If no box is found:
     - Commit **step**:
       - Push snapshot onto `history`.
       - Update player coordinates to `(tx, ty)`.
       - Play tap sound.
       - Increment move count.

4. **Post-Move Operations**:
   - Check win state.
   - Run static deadlock analysis.

---

## 5. Static Deadlock Analysis

To prevent player frustration, the engine flags boxes that are permanently stuck in non-target wall corners:

```typescript
const computeDeadlocks = (board: TileType[][], boxes: Box[]): string[] => {
  const deadlockedIds: string[] = [];
  
  for (const box of boxes) {
    const { x, y } = box;
    
    // Already on a target is fine
    if (board[y][x] === TileType.TARGET) continue;

    const leftWall = board[y][x - 1] === TileType.WALL;
    const rightWall = board[y][x + 1] === TileType.WALL;
    const upWall = board[y - 1][x] === TileType.WALL;
    const downWall = board[y + 1][x] === TileType.WALL;

    // Corner: has both horizontal and vertical blockages
    const inCorner = (leftWall || rightWall) && (upWall || downWall);
    
    if (inCorner) {
      deadlockedIds.push(box.id);
    }
  }
  
  return deadlockedIds;
};
```

---

## 6. Rendering & Responsive Styling

The board scales dynamically inside a fixed container.

### 6.1. HTML Layout Structure
- **Frame wrapper**: Centered, pixel-bordered viewport box.
- **Board aspect**: Rendered inside a relative container with inline style `aspect-ratio: W / H`.
- **Static tiles layer**: Formed of CSS Grid:
  ```css
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  grid-template-rows: repeat(var(--rows), 1fr);
  ```
- **Entity layer**: Rendered absolutely on top:
  ```css
  position: absolute;
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  ```
  This guarantees that players and crates slide smoothly to their new positions.

### 6.2. Animations
- **Move/Push**: Handled via standard GPU-accelerated CSS transition curves.
- **Bump/Error**: Framer motion coordinate wiggle.
- **Win Effect**: Glow transition on target cells and celebratory confetti/pulse.

---

## 7. Web Audio Synthesizer

The sound effects are generated programmatically to avoid loading high-latency audio files over the network:

- **Move Tap**: Short high-frequency sine tone decay.
- **Push Thunk**: Deeper triangle waveform with brief frequency drop.
- **Error Bump**: Sawtooth pulse starting at 120Hz.
- **Win Chime**: Chord arpeggio (C5 -> E5 -> G5 -> C6) with soft triangle release.

---

## 8. Sourcing Handcrafted Levels

We will load David W. Skinner's classic **Microban Level Pack** (50 levels).
These levels are highly optimized for mobile-first play:
- Grids are compact (typically within $8 \times 8$ or $10 \times 10$).
- Progression starts with simple 1-box / 2-box configurations and curves up to complex planning problems.
- Parsed dynamically from structured text files using Sokoban level symbols:
  - `#`: Wall
  - `.`: Target
  - `@`: Player
  - `$`: Box
  - ` `: Floor/Empty
  - `*`: Box on Target
  - `+`: Player on Target
