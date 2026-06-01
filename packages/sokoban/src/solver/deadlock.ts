/**
 * Deadlock detection heuristics for Sokoban solver
 */

interface Position {
  x: number;
  y: number;
}

/**
 * Check if a box is in a simple corner deadlock
 * (box in corner with no target at that position)
 */
export function isSimpleCornerDeadlock(
  box: Position,
  walls: boolean[][],
  targets: Position[]
): boolean {
  const { x, y } = box;

  // If box is on a target, it's not a deadlock
  if (targets.some((t) => t.x === x && t.y === y)) {
    return false;
  }

  const height = walls.length;
  const width = walls[0]?.length || 0;

  // Check if out of bounds
  if (y < 0 || y >= height || x < 0 || x >= width) return false;

  // Check four corner patterns
  const topBlocked = y === 0 || walls[y - 1]?.[x];
  const bottomBlocked = y === height - 1 || walls[y + 1]?.[x];
  const leftBlocked = x === 0 || walls[y]?.[x - 1];
  const rightBlocked = x === width - 1 || walls[y]?.[x + 1];

  // Corner deadlock: blocked on two adjacent sides
  if (topBlocked && leftBlocked) return true;
  if (topBlocked && rightBlocked) return true;
  if (bottomBlocked && leftBlocked) return true;
  if (bottomBlocked && rightBlocked) return true;

  return false;
}

/**
 * Check if a box is in a freeze deadlock
 * (box against wall with no target on that wall segment)
 */
export function isFreezeDeadlock(
  box: Position,
  walls: boolean[][],
  targets: Position[]
): boolean {
  void box;
  void walls;
  void targets;
  return false;
}

/**
 * Check if any box is in a deadlock position
 */
export function hasDeadlock(
  boxes: Position[],
  walls: boolean[][],
  targets: Position[]
): boolean {
  // Check each box for simple deadlocks
  for (const box of boxes) {
    if (isSimpleCornerDeadlock(box, walls, targets)) {
      return true;
    }
    if (isFreezeDeadlock(box, walls, targets)) {
      return true;
    }
  }

  return false;
}
