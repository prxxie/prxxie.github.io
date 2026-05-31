/**
 * State representation and hashing utilities for Sokoban solver
 */

export interface SolverState {
  playerX: number;
  playerY: number;
  boxes: Array<{ x: number; y: number }>;
  moveCount: number;
  path: string[]; // for solution reconstruction
}

/**
 * Create a normalized hash string for a state.
 * Boxes are sorted by coordinates to ensure consistent hashing.
 */
export function hashState(state: SolverState): string {
  // Sort boxes by y first, then x for consistent ordering
  const sortedBoxes = [...state.boxes].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  const boxString = sortedBoxes.map((b) => `${b.x},${b.y}`).join("|");
  return `${state.playerX},${state.playerY}|${boxString}`;
}

/**
 * Check if all boxes are on target positions
 */
export function isGoalState(
  boxes: Array<{ x: number; y: number }>,
  targets: Array<{ x: number; y: number }>
): boolean {
  if (boxes.length !== targets.length) return false;

  // Check if every box is on a target
  return boxes.every((box) =>
    targets.some((target) => target.x === box.x && target.y === box.y)
  );
}

/**
 * Create a new state after moving the player
 */
export function createState(
  playerX: number,
  playerY: number,
  boxes: Array<{ x: number; y: number }>,
  moveCount: number,
  path: string[]
): SolverState {
  return {
    playerX,
    playerY,
    boxes: boxes.map((b) => ({ x: b.x, y: b.y })), // deep copy
    moveCount,
    path: [...path], // deep copy
  };
}
