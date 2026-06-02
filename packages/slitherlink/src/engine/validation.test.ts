import { describe, it, expect } from "vitest";
import { validateBoard } from "./validation";
import type { Level, BoardState, EdgeState } from "../types";

const dummyLevel: Level = {
  id: "dummy",
  difficulty: "Easy",
  width: 2,
  height: 2,
  clues: { "0,0": 3, "1,1": 2 },
  targets: { threeStars: 60, twoStars: 120 }
};

const createEmptyBoard = (w: number, h: number): BoardState => {
  const hEdges: EdgeState[][] = [];
  for (let r = 0; r <= h; r++) {
    const row: EdgeState[] = [];
    for (let c = 0; c < w; c++) {
      row.push("none");
    }
    hEdges.push(row);
  }
  const vEdges: EdgeState[][] = [];
  for (let r = 0; r < h; r++) {
    const row: EdgeState[] = [];
    for (let c = 0; c <= w; c++) {
      row.push("none");
    }
    vEdges.push(row);
  }
  return { hEdges, vEdges };
};

describe("Slitherlink Loop Validation Engine", () => {
  it("returns false for an empty board", () => {
    const board = createEmptyBoard(2, 2);
    const res = validateBoard(dummyLevel, board);
    expect(res.isSolved).toBe(false);
  });

  it("detects cell clue count errors", () => {
    const board = createEmptyBoard(2, 2);
    // Clue (0,0) is 3, we draw 4 lines around it
    board.hEdges[0][0] = "line";
    board.hEdges[1][0] = "line";
    board.vEdges[0][0] = "line";
    board.vEdges[0][1] = "line";
    const res = validateBoard(dummyLevel, board);
    expect(res.isSolved).toBe(false);
    expect(res.cellErrors["0,0"]).toBe(true); // Exceeded
  });

  it("detects branch degree errors (T-junctions / degree 3)", () => {
    const board = createEmptyBoard(2, 2);
    board.hEdges[0][0] = "line";
    board.hEdges[0][1] = "line";
    board.vEdges[0][1] = "line";
    board.vEdges[0][2] = "line"; // Degree 3 vertex at (1,0)
    const res = validateBoard(dummyLevel, board);
    expect(res.isSolved).toBe(false);
    expect(res.vertexErrors["1,0"]).toBe(true);
  });

  it("validates a correct loop", () => {
    const level1x1: Level = {
      id: "test1x1",
      difficulty: "Easy",
      width: 1,
      height: 1,
      clues: { "0,0": 4 },
      targets: { threeStars: 10, twoStars: 20 }
    };
    const board1x1 = createEmptyBoard(1, 1);
    board1x1.hEdges[0][0] = "line";
    board1x1.hEdges[1][0] = "line";
    board1x1.vEdges[0][0] = "line";
    board1x1.vEdges[0][1] = "line";
    const res1x1 = validateBoard(level1x1, board1x1);
    expect(res1x1.isSolved).toBe(true);
  });

  it("detects disjoint loops", () => {
    const level3x3: Level = {
      id: "test3x3",
      difficulty: "Easy",
      width: 3,
      height: 3,
      clues: {},
      targets: { threeStars: 10, twoStars: 20 }
    };
    const board3x3 = createEmptyBoard(3, 3);
    // Loop 1 at cell (0,0)
    board3x3.hEdges[0][0] = "line";
    board3x3.hEdges[1][0] = "line";
    board3x3.vEdges[0][0] = "line";
    board3x3.vEdges[0][1] = "line";
    // Loop 2 at cell (2,2)
    board3x3.hEdges[2][2] = "line";
    board3x3.hEdges[3][2] = "line";
    board3x3.vEdges[2][2] = "line";
    board3x3.vEdges[2][3] = "line";

    const res = validateBoard(level3x3, board3x3);
    expect(res.isSolved).toBe(false);
  });

  it("detects self-intersection / vertex sharing (degree 4 vertex)", () => {
    const level2x2: Level = {
      id: "test2x2",
      difficulty: "Easy",
      width: 2,
      height: 2,
      clues: {},
      targets: { threeStars: 10, twoStars: 20 }
    };
    const board2x2 = createEmptyBoard(2, 2);
    // Loop 1 at cell (0,0)
    board2x2.hEdges[0][0] = "line";
    board2x2.hEdges[1][0] = "line";
    board2x2.vEdges[0][0] = "line";
    board2x2.vEdges[0][1] = "line";
    // Loop 2 at cell (1,1)
    board2x2.hEdges[1][1] = "line";
    board2x2.hEdges[2][1] = "line";
    board2x2.vEdges[1][1] = "line";
    board2x2.vEdges[1][2] = "line";

    const res = validateBoard(level2x2, board2x2);
    expect(res.isSolved).toBe(false);
    expect(res.vertexErrors["1,1"]).toBe(true);
  });

  it("detects open loops (degree 1 vertices)", () => {
    const level1x1: Level = {
      id: "test1x1",
      difficulty: "Easy",
      width: 1,
      height: 1,
      clues: {},
      targets: { threeStars: 10, twoStars: 20 }
    };
    const board1x1 = createEmptyBoard(1, 1);
    board1x1.hEdges[0][0] = "line";
    board1x1.vEdges[0][0] = "line";
    board1x1.hEdges[1][0] = "line";

    const res = validateBoard(level1x1, board1x1);
    expect(res.isSolved).toBe(false);
    expect(res.vertexErrors["1,0"]).toBe(true);
    expect(res.vertexErrors["1,1"]).toBe(true);
  });
});
