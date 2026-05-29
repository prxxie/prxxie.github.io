import { describe, it, expect } from 'vitest';
import { validateRegion } from './validation';

const mockPuzzle = {
  width: 6,
  height: 6,
  clues: [
    { x: 0, y: 0, value: 4 },
    { x: 4, y: 0, value: 6 }
  ]
};

describe('Shikaku Validation Engine', () => {
  it('should validate a correct rectangle matching clue value', () => {
    const region = { x: 0, y: 0, width: 2, height: 2 };
    const res = validateRegion(region, mockPuzzle, []);
    expect(res.valid).toBe(true);
    expect(res.clueX).toBe(0);
    expect(res.clueY).toBe(0);
  });

  it('should reject a rectangle with wrong area', () => {
    const region = { x: 0, y: 0, width: 2, height: 3 }; // Area = 6, but clue is 4
    const res = validateRegion(region, mockPuzzle, []);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('WRONG_AREA');
  });

  it('should reject a rectangle with multiple clues', () => {
    const region = { x: 0, y: 0, width: 5, height: 2 }; // contains x:0,y:0 (4) and x:4,y:0 (6)
    const res = validateRegion(region, mockPuzzle, []);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('MULTIPLE_CLUES');
  });

  it('should reject a rectangle containing no clues', () => {
    const region = { x: 1, y: 1, width: 2, height: 2 };
    const res = validateRegion(region, mockPuzzle, []);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('NO_CLUE');
  });

  it('should reject a region out of bounds', () => {
    const region = { x: -1, y: 0, width: 2, height: 2 };
    const res = validateRegion(region, mockPuzzle, []);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('OUT_OF_BOUNDS');
  });

  it('should reject an overlapping rectangle', () => {
    const existing = [{ x: 0, y: 0, width: 2, height: 2 }];
    const region = { x: 0, y: 0, width: 4, height: 1 }; // contains clue (0,0) value 4, area 4, but overlaps
    const res = validateRegion(region, mockPuzzle, existing);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe('OVERLAP');
  });

  it('should reject a region with zero or negative dimensions', () => {
    const res1 = validateRegion({ x: 0, y: 0, width: 0, height: 2 }, mockPuzzle, []);
    expect(res1.valid).toBe(false);
    expect(res1.reason).toBe('OUT_OF_BOUNDS');

    const res2 = validateRegion({ x: 0, y: 0, width: 2, height: -1 }, mockPuzzle, []);
    expect(res2.valid).toBe(false);
    expect(res2.reason).toBe('OUT_OF_BOUNDS');
  });

  it('should exclude the region itself from overlaps check (by reference or id)', () => {
    const region = { id: 'r1', x: 0, y: 0, width: 2, height: 2 };
    // Even if existing regions contains the region itself, it should be valid
    const res1 = validateRegion(region, mockPuzzle, [region]);
    expect(res1.valid).toBe(true);

    const sameIdRegion = { id: 'r1', x: 0, y: 0, width: 2, height: 2 };
    // Even if it matches by ID, it should be excluded
    const res2 = validateRegion(region, mockPuzzle, [sameIdRegion]);
    expect(res2.valid).toBe(true);
  });
});
