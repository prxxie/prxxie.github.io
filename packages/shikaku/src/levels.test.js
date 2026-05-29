import { describe, it, expect } from 'vitest';
import { SHIKAKU_LEVELS } from './levels';
import { solvePuzzle } from './engine/solver';

describe('Handcrafted Levels Verification', () => {
  it('should verify there are exactly 20 levels', () => {
    expect(SHIKAKU_LEVELS.length).toBe(20);
  });

  it('should verify there are 6 Easy, 7 Medium, and 7 Hard levels', () => {
    const easy = SHIKAKU_LEVELS.filter(l => l.difficulty === 'Easy');
    const medium = SHIKAKU_LEVELS.filter(l => l.difficulty === 'Medium');
    const hard = SHIKAKU_LEVELS.filter(l => l.difficulty === 'Hard');

    expect(easy.length).toBe(6);
    expect(medium.length).toBe(7);
    expect(hard.length).toBe(7);

    easy.forEach(l => {
      if (l.id === 'easy-1') {
        expect(l.width).toBe(4);
        expect(l.height).toBe(4);
      } else if (l.id === 'easy-2') {
        expect(l.width).toBe(5);
        expect(l.height).toBe(5);
      } else {
        expect(l.width).toBe(6);
        expect(l.height).toBe(6);
      }
    });

    medium.forEach(l => {
      expect(l.width).toBe(8);
      expect(l.height).toBe(8);
    });

    hard.forEach(l => {
      expect(l.width).toBe(10);
      expect(l.height).toBe(10);
    });
  });

  SHIKAKU_LEVELS.forEach(level => {
    it(`should successfully solve level ${level.id} (${level.difficulty})`, () => {
      const solution = solvePuzzle(level);
      expect(solution).not.toBeNull();

      // Sum of areas matches board size
      const totalArea = solution.reduce((sum, r) => sum + r.width * r.height, 0);
      expect(totalArea).toBe(level.width * level.height);

      // Verify all regions are within bounds and have correct clue mapping
      for (const region of solution) {
        expect(region.width * region.height).toBe(region.area);
        expect(region.x).toBeGreaterThanOrEqual(0);
        expect(region.y).toBeGreaterThanOrEqual(0);
        expect(region.x + region.width).toBeLessThanOrEqual(level.width);
        expect(region.y + region.height).toBeLessThanOrEqual(level.height);

        // Ensure the clue is inside this region
        expect(region.clueX).toBeGreaterThanOrEqual(region.x);
        expect(region.clueX).toBeLessThan(region.x + region.width);
        expect(region.clueY).toBeGreaterThanOrEqual(region.y);
        expect(region.clueY).toBeLessThan(region.y + region.height);

        // Ensure clue matches value
        const matchingClue = level.clues.find(c => c.x === region.clueX && c.y === region.clueY);
        expect(matchingClue).toBeDefined();
        expect(matchingClue.value).toBe(region.area);
      }
    });
  });
});
