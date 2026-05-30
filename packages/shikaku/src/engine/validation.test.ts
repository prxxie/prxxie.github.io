import { describe, it, expect } from "vitest";
import { validateRegion } from "./validation";
import type { Puzzle, Region } from "../types";

const mockPuzzle: Puzzle = {
  id: "test",
  difficulty: "Easy",
  width: 6,
  height: 6,
  clues: [
    { x: 0, y: 0, value: 4 },
    { x: 4, y: 0, value: 6 },
  ],
  targets: { threeStars: 10, twoStars: 20, oneStar: 30 },
};

function makeRegion(
  x: number,
  y: number,
  w: number,
  h: number,
  id = "r1"
): Region {
  return { id, x, y, width: w, height: h, area: w * h, color: "", borderColor: "", clueX: 0, clueY: 0 };
}

describe("Shikaku Validation Engine", () => {
  it("should validate a correct rectangle matching clue value", () => {
    const region = makeRegion(0, 0, 2, 2);
    const res = validateRegion(region, mockPuzzle, []);
    expect(res.valid).toBe(true);
    expect(res.clueX).toBe(0);
    expect(res.clueY).toBe(0);
  });

  it("should reject a rectangle with wrong area", () => {
    const region = makeRegion(0, 0, 2, 3);
    const res = validateRegion(region, mockPuzzle, []);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe("WRONG_AREA");
  });

  it("should reject a rectangle with multiple clues", () => {
    const region = makeRegion(0, 0, 5, 2);
    const res = validateRegion(region, mockPuzzle, []);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe("MULTIPLE_CLUES");
  });

  it("should reject a rectangle containing no clues", () => {
    const region = makeRegion(1, 1, 2, 2);
    const res = validateRegion(region, mockPuzzle, []);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe("NO_CLUE");
  });

  it("should reject a region out of bounds", () => {
    const region = makeRegion(-1, 0, 2, 2);
    const res = validateRegion(region, mockPuzzle, []);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe("OUT_OF_BOUNDS");
  });

  it("should reject an overlapping rectangle", () => {
    const existing = [makeRegion(0, 0, 2, 2, "existing")];
    const region = makeRegion(0, 0, 4, 1, "proposed");
    const res = validateRegion(region, mockPuzzle, existing);
    expect(res.valid).toBe(false);
    expect(res.reason).toBe("OVERLAP");
  });

  it("should reject a region with zero or negative dimensions", () => {
    const res1 = validateRegion(makeRegion(0, 0, 0, 2), mockPuzzle, []);
    expect(res1.valid).toBe(false);
    expect(res1.reason).toBe("OUT_OF_BOUNDS");

    const res2 = validateRegion(makeRegion(0, 0, 2, -1), mockPuzzle, []);
    expect(res2.valid).toBe(false);
    expect(res2.reason).toBe("OUT_OF_BOUNDS");
  });

  it("should exclude the region itself from overlaps check (by reference or id)", () => {
    const region = makeRegion(0, 0, 2, 2, "r1");
    const res1 = validateRegion(region, mockPuzzle, [region]);
    expect(res1.valid).toBe(true);

    const sameIdRegion = makeRegion(0, 0, 2, 2, "r1");
    const res2 = validateRegion(region, mockPuzzle, [sameIdRegion]);
    expect(res2.valid).toBe(true);
  });
});
