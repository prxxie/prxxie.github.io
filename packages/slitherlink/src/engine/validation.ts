import type { Level, BoardState, ValidationResult, EdgeState } from "../types";

export function getVertexDegree(
  col: number,
  row: number,
  hEdges: EdgeState[][],
  vEdges: EdgeState[][],
  W: number,
  H: number
): number {
  let count = 0;
  if (col > 0 && hEdges[row][col - 1] === "line") count++;
  if (col < W && hEdges[row][col] === "line") count++;
  if (row > 0 && vEdges[row - 1][col] === "line") count++;
  if (row < H && vEdges[row][col] === "line") count++;
  return count;
}

export function getCellLineCount(
  x: number,
  y: number,
  hEdges: EdgeState[][],
  vEdges: EdgeState[][]
): number {
  let count = 0;
  if (hEdges[y][x] === "line") count++;
  if (hEdges[y + 1][x] === "line") count++;
  if (vEdges[y][x] === "line") count++;
  if (vEdges[y][x + 1] === "line") count++;
  return count;
}

export function validateBoard(level: Level, board: BoardState): ValidationResult {
  const { width: W, height: H, clues } = level;
  const { hEdges, vEdges } = board;

  const cellErrors: Record<string, boolean> = {};
  const vertexErrors: Record<string, boolean> = {};
  let cluesSatisfied = true;

  // 1. Check clues
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const key = `${x},${y}`;
      if (key in clues) {
        const target = clues[key];
        const current = getCellLineCount(x, y, hEdges, vEdges);
        if (current !== target) {
          cluesSatisfied = false;
          if (current > target) {
            cellErrors[key] = true;
          }
        }
      }
    }
  }

  // 2. Check vertex degrees and active vertex collection
  const activeVertices = new Set<string>();
  let hasDegreeError = false;

  for (let r = 0; r <= H; r++) {
    for (let c = 0; c <= W; c++) {
      const degree = getVertexDegree(c, r, hEdges, vEdges, W, H);
      if (degree > 0) {
        if (degree !== 2) {
          vertexErrors[`${c},${r}`] = true;
          hasDegreeError = true;
        } else {
          activeVertices.add(`${c},${r}`);
        }
      }
    }
  }

  // Empty board is not solved
  if (activeVertices.size === 0) {
    return { isSolved: false, cellErrors, vertexErrors };
  }

  if (!cluesSatisfied || hasDegreeError) {
    return { isSolved: false, cellErrors, vertexErrors };
  }

  // 3. Traversal to ensure single closed loop
  let totalLines = 0;
  for (let r = 0; r <= H; r++) {
    for (let c = 0; c < W; c++) {
      if (hEdges[r][c] === "line") totalLines++;
    }
  }
  for (let r = 0; r < H; r++) {
    for (let c = 0; c <= W; c++) {
      if (vEdges[r][c] === "line") totalLines++;
    }
  }

  const startVertex = Array.from(activeVertices)[0];
  let currentVertex = startVertex;
  let prevVertex: string | null = null;
  let visitedEdgesCount = 0;
  const visitedVertices = new Set<string>();

  while (currentVertex) {
    visitedVertices.add(currentVertex);
    const [c, r] = currentVertex.split(",").map(Number);
    
    let nextVertex: string | null = null;
    const neighbors: { key: string }[] = [];

    if (c > 0 && hEdges[r][c - 1] === "line") neighbors.push({ key: `${c - 1},${r}` });
    if (c < W && hEdges[r][c] === "line") neighbors.push({ key: `${c + 1},${r}` });
    if (r > 0 && vEdges[r - 1][c] === "line") neighbors.push({ key: `${c},${r - 1}` });
    if (r < H && vEdges[r][c] === "line") neighbors.push({ key: `${c},${r + 1}` });

    const validNeighbor = neighbors.find((n) => n.key !== prevVertex);
    if (validNeighbor) {
      nextVertex = validNeighbor.key;
      visitedEdgesCount++;
    }

    if (nextVertex === startVertex) {
      break; // Loop completed!
    }

    if (!nextVertex || visitedVertices.has(nextVertex)) {
      return { isSolved: false, cellErrors, vertexErrors };
    }

    prevVertex = currentVertex;
    currentVertex = nextVertex;
  }

  const isSolved = visitedEdgesCount === totalLines && visitedVertices.size === activeVertices.size;

  return { isSolved, cellErrors, vertexErrors };
}
