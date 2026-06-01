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
  const { x, y } = box;

  // If box is on a target, it's not a deadlock
  if (targets.some((t) => t.x === x && t.y === y)) {
    return false;
  }

  const height = walls.length;
  const width = walls[0]?.length || 0;

  if (y < 0 || y >= height || x < 0 || x >= width) return false;

  // Check if box is against a wall
  const againstTopWall = y > 0 && walls[y - 1]?.[x];
  const againstBottomWall = y < height - 1 && walls[y + 1]?.[x];
  const againstLeftWall = x > 0 && walls[y]?.[x - 1];
  const againstRightWall = x < width - 1 && walls[y]?.[x + 1];

  // 1. Horizontal wall checks
  if (againstTopWall || againstBottomWall) {
    // Find walkable segment along row y
    let xL = x;
    while (xL >= 0 && !walls[y][xL]) {
      xL--;
    }
    xL++;

    let xR = x;
    while (xR < width && !walls[y][xR]) {
      xR++;
    }
    xR--;

    // If against top wall, check if the top wall is completely solid across this segment
    if (againstTopWall) {
      let solidTop = true;
      for (let tx = xL; tx <= xR; tx++) {
        if (y === 0 || !walls[y - 1]?.[tx]) {
          solidTop = false;
          break;
        }
      }
      if (solidTop) {
        // Box can never leave row y. Check if there is any target on row y in [xL, xR]
        const hasTarget = targets.some((t) => t.y === y && t.x >= xL && t.x <= xR);
        if (!hasTarget) return true;
      }
    }

    // If against bottom wall, check if the bottom wall is completely solid across this segment
    if (againstBottomWall) {
      let solidBottom = true;
      for (let tx = xL; tx <= xR; tx++) {
        if (y === height - 1 || !walls[y + 1]?.[tx]) {
          solidBottom = false;
          break;
        }
      }
      if (solidBottom) {
        const hasTarget = targets.some((t) => t.y === y && t.x >= xL && t.x <= xR);
        if (!hasTarget) return true;
      }
    }
  }

  // 2. Vertical wall checks
  if (againstLeftWall || againstRightWall) {
    // Find walkable segment along column x
    let yT = y;
    while (yT >= 0 && !walls[yT][x]) {
      yT--;
    }
    yT++;

    let yB = y;
    while (yB < height && !walls[yB][x]) {
      yB++;
    }
    yB--;

    // If against left wall, check if the left wall is completely solid across this segment
    if (againstLeftWall) {
      let solidLeft = true;
      for (let ty = yT; ty <= yB; ty++) {
        if (x === 0 || !walls[ty]?.[x - 1]) {
          solidLeft = false;
          break;
        }
      }
      if (solidLeft) {
        const hasTarget = targets.some((t) => t.x === x && t.y >= yT && t.y <= yB);
        if (!hasTarget) return true;
      }
    }

    // If against right wall, check if the right wall is completely solid across this segment
    if (againstRightWall) {
      let solidRight = true;
      for (let ty = yT; ty <= yB; ty++) {
        if (x === width - 1 || !walls[ty]?.[x + 1]) {
          solidRight = false;
          break;
        }
      }
      if (solidRight) {
        const hasTarget = targets.some((t) => t.x === x && t.y >= yT && t.y <= yB);
        if (!hasTarget) return true;
      }
    }
  }

  return false;
}

function isCellObstacle(x: number, y: number, walls: boolean[][], boxes: Position[]): boolean {
  if (y < 0 || y >= walls.length || x < 0 || x >= (walls[0]?.length || 0)) return true;
  if (walls[y][x]) return true;
  return boxes.some((b) => b.x === x && b.y === y);
}

export function has2x2Deadlock(
  boxes: Position[],
  walls: boolean[][],
  targets: Position[]
): boolean {
  for (const box of boxes) {
    const { x, y } = box;

    const squares = [
      [{ x: x, y: y }, { x: x + 1, y: y }, { x: x, y: y + 1 }, { x: x + 1, y: y + 1 }],
      [{ x: x - 1, y: y }, { x: x, y: y }, { x: x - 1, y: y + 1 }, { x: x, y: y + 1 }],
      [{ x: x, y: y - 1 }, { x: x + 1, y: y - 1 }, { x: x, y: y }, { x: x + 1, y: y }],
      [{ x: x - 1, y: y - 1 }, { x: x, y: y - 1 }, { x: x - 1, y: y }, { x: x, y: y }]
    ];

    for (const sq of squares) {
      if (
        isCellObstacle(sq[0].x, sq[0].y, walls, boxes) &&
        isCellObstacle(sq[1].x, sq[1].y, walls, boxes) &&
        isCellObstacle(sq[2].x, sq[2].y, walls, boxes) &&
        isCellObstacle(sq[3].x, sq[3].y, walls, boxes)
      ) {
        let hasUndeliveredBox = false;
        for (const cell of sq) {
          const hasBox = boxes.some((b) => b.x === cell.x && b.y === cell.y);
          if (hasBox) {
            const onTarget = targets.some((t) => t.x === cell.x && t.y === cell.y);
            if (!onTarget) {
              hasUndeliveredBox = true;
              break;
            }
          }
        }
        if (hasUndeliveredBox) return true;
      }
    }
  }
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

  // Check for 2x2 deadlock block
  if (has2x2Deadlock(boxes, walls, targets)) {
    return true;
  }

  return false;
}
