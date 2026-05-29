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

describe('Shikaku Backtracking Solver', () => {
  it('should find a correct partition solution', () => {
    const solution = solvePuzzle(simplePuzzle);
    expect(solution).not.toBeNull();
    expect(solution.length).toBe(2);
    // Valid partitions check
    expect(solution[0].width * solution[0].height).toBe(2);
  });
});
