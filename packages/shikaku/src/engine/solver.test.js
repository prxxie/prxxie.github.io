import { describe, it, expect } from 'vitest';
import { solvePuzzle } from './solver';

const simplePuzzle = {
  width: 2,
  height: 2,
  clues: [
    { x: 0, y: 0, value: 2 },
    { x: 0, y: 1, value: 2 }
  ]
};

const unsolvablePuzzleLargeClue = {
  width: 2,
  height: 2,
  clues: [
    { x: 0, y: 0, value: 5 }
  ]
};

const unsolvablePuzzleConflicting = {
  width: 2,
  height: 2,
  clues: [
    { x: 0, y: 0, value: 3 },
    { x: 1, y: 1, value: 3 }
  ]
};

const puzzle6x6 = {
  width: 6,
  height: 6,
  clues: [
    { x: 0, y: 0, value: 4 },
    { x: 2, y: 0, value: 4 },
    { x: 1, y: 3, value: 8 },
    { x: 3, y: 2, value: 4 },
    { x: 5, y: 2, value: 6 },
    { x: 3, y: 5, value: 6 },
    { x: 4, y: 4, value: 4 }
  ]
};

describe('Shikaku Backtracking Solver', () => {
  it('should find a correct partition solution', () => {
    const solution = solvePuzzle(simplePuzzle);
    expect(solution).not.toBeNull();
    expect(solution.length).toBe(2);
    // Valid partitions check
    expect(solution[0].width * solution[0].height).toBe(2);
  });

  it('should return null for an unsolvable puzzle with a clue size larger than the board', () => {
    const solution = solvePuzzle(unsolvablePuzzleLargeClue);
    expect(solution).toBeNull();
  });

  it('should return null for an unsolvable puzzle with conflicting/overlapping clue values', () => {
    const solution = solvePuzzle(unsolvablePuzzleConflicting);
    expect(solution).toBeNull();
  });

  it('should solve a 6x6 puzzle correctly and quickly', () => {
    const solution = solvePuzzle(puzzle6x6);
    expect(solution).not.toBeNull();
    expect(solution.length).toBe(7);

    // Sum of areas matches board size
    const totalArea = solution.reduce((sum, r) => sum + r.width * r.height, 0);
    expect(totalArea).toBe(36);

    // Verify all rectangles match a unique clue and have correct size
    for (const region of solution) {
      expect(region.width * region.height).toBe(region.area);
      // Ensure the clue (clueX, clueY) is inside this region
      expect(region.clueX).toBeGreaterThanOrEqual(region.x);
      expect(region.clueX).toBeLessThan(region.x + region.width);
      expect(region.clueY).toBeGreaterThanOrEqual(region.y);
      expect(region.clueY).toBeLessThan(region.y + region.height);
    }
  });
});
