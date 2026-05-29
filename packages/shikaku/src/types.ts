export interface Clue {
  x: number;
  y: number;
  value: number;
}

export interface StarTargets {
  threeStars: number;
  twoStars: number;
  oneStar: number;
}

export interface Puzzle {
  id: string;
  difficulty: string;
  width: number;
  height: number;
  clues: Clue[];
  targets: StarTargets;
}

export interface DragPoint {
  x: number;
  y: number;
}

export interface Region {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  area: number;
  color: string;
  clueX: number;
  clueY: number;
}

export type ValidationReason =
  | "OUT_OF_BOUNDS"
  | "NO_CLUE"
  | "MULTIPLE_CLUES"
  | "WRONG_AREA"
  | "OVERLAP";

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  clueX?: number;
  clueY?: number;
}

export type CompletedLevels = Record<string, { stars: number; bestTime: number }>;
