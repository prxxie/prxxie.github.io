export type EdgeState = "none" | "line" | "cross";

export interface BoardState {
  hEdges: EdgeState[][]; // size W x (H+1)
  vEdges: EdgeState[][]; // size (W+1) x H
}

export interface ValidationResult {
  isSolved: boolean;
  cellErrors: Record<string, boolean>;
  vertexErrors: Record<string, boolean>;
}

export interface Level {
  id: string;
  difficulty: "Easy" | "Medium";
  width: number;
  height: number;
  clues: Record<string, number>; // "x,y" -> clue value
  targets: {
    threeStars: number;
    twoStars: number;
  };
}
