/**
 * BFS Sokoban solver with deadlock pruning
 */

import { LevelData } from "../types";
import { SolverState, hashState, isGoalState, createState } from "./state";
import { hasDeadlock } from "./deadlock";

export interface SolverResult {
  solvable: boolean;
  moveCount?: number;
  solution?: string[]; // array of moves: 'up', 'down', 'left', 'right'
  statesExplored?: number;
}

interface Position {
  x: number;
  y: number;
}

const DIRECTIONS = [
  { dx: 0, dy: -1, name: "up" },
  { dx: 0, dy: 1, name: "down" },
  { dx: -1, dy: 0, name: "left" },
  { dx: 1, dy: 0, name: "right" },
];

/**
 * Parse level grid into structured data
 */
function parseLevel(level: LevelData): {
  player: Position;
  boxes: Position[];
  targets: Position[];
  walls: boolean[][];
  width: number;
  height: number;
} {
  const height = level.grid.length;
  const width = Math.max(...level.grid.map((row) => row.length));

  const walls: boolean[][] = [];
  const boxes: Position[] = [];
  const targets: Position[] = [];
  let player: Position = { x: 0, y: 0 };

  for (let y = 0; y < height; y++) {
    walls[y] = [];
    const row = level.grid[y] || "";

    for (let x = 0; x < width; x++) {
      const char = row[x] || " ";

      walls[y][x] = char === "#";

      if (char === "@" || char === "+") {
        player = { x, y };
      }
      if (char === "$" || char === "*") {
        boxes.push({ x, y });
      }
      if (char === "." || char === "*" || char === "+") {
        targets.push({ x, y });
      }
    }
  }

  return { player, boxes, targets, walls, width, height };
}

/**
 * Check if a position is walkable (not a wall or box)
 */
function isWalkable(
  x: number,
  y: number,
  walls: boolean[][],
  boxes: Position[]
): boolean {
  if (y < 0 || y >= walls.length || x < 0 || x >= walls[0].length) {
    return false;
  }
  if (walls[y][x]) return false;
  if (boxes.some((b) => b.x === x && b.y === y)) return false;
  return true;
}

/**
 * Solve a Sokoban level using BFS with deadlock pruning
 */
export function solveSokoban(
  level: LevelData,
  maxStates = 100000,
  timeoutMs = 30000
): SolverResult {
  const startTime = Date.now();
  const { player, boxes, targets, walls, width, height } = parseLevel(level);

  // Initial state
  const initialState: SolverState = createState(
    player.x,
    player.y,
    boxes,
    0,
    []
  );

  // Check if already solved
  if (isGoalState(boxes, targets)) {
    return {
      solvable: true,
      moveCount: 0,
      solution: [],
      statesExplored: 0,
    };
  }

  const queue: SolverState[] = [initialState];
  const visited = new Set<string>();
  visited.add(hashState(initialState));

  let statesExplored = 0;

  while (queue.length > 0) {
    // Check timeout
    if (Date.now() - startTime > timeoutMs) {
      return {
        solvable: false,
        statesExplored,
      };
    }

    // Check state limit
    if (statesExplored >= maxStates) {
      return {
        solvable: false,
        statesExplored,
      };
    }

    const state = queue.shift()!;
    statesExplored++;

    // Try each direction
    for (const dir of DIRECTIONS) {
      const newPlayerX = state.playerX + dir.dx;
      const newPlayerY = state.playerY + dir.dy;

      // Check if player can move to new position
      if (
        newPlayerY < 0 ||
        newPlayerY >= height ||
        newPlayerX < 0 ||
        newPlayerX >= width ||
        walls[newPlayerY][newPlayerX]
      ) {
        continue;
      }

      // Check if there's a box at new position
      const boxIndex = state.boxes.findIndex(
        (b) => b.x === newPlayerX && b.y === newPlayerY
      );

      if (boxIndex !== -1) {
        // Player is pushing a box
        const newBoxX = newPlayerX + dir.dx;
        const newBoxY = newPlayerY + dir.dy;

        // Check if box can be pushed
        if (!isWalkable(newBoxX, newBoxY, walls, state.boxes)) {
          continue;
        }

        // Create new state with moved box
        const newBoxes = [...state.boxes];
        newBoxes[boxIndex] = { x: newBoxX, y: newBoxY };

        // Check for deadlock
        if (hasDeadlock(newBoxes, walls, targets)) {
          continue;
        }

        const newState = createState(
          newPlayerX,
          newPlayerY,
          newBoxes,
          state.moveCount + 1,
          [...state.path, dir.name]
        );

        const hash = hashState(newState);
        if (visited.has(hash)) continue;

        visited.add(hash);

        // Check if goal reached
        if (isGoalState(newBoxes, targets)) {
          return {
            solvable: true,
            moveCount: newState.moveCount,
            solution: newState.path,
            statesExplored,
          };
        }

        queue.push(newState);
      } else {
        // Player moves without pushing
        const newState = createState(
          newPlayerX,
          newPlayerY,
          state.boxes,
          state.moveCount + 1,
          [...state.path, dir.name]
        );

        const hash = hashState(newState);
        if (visited.has(hash)) continue;

        visited.add(hash);
        queue.push(newState);
      }
    }
  }

  return {
    solvable: false,
    statesExplored,
  };
}
