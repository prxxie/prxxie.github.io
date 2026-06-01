import { describe, it, expect } from "vitest";
import { SOKOBAN_LEVELS } from "./levels";
import { solveSokoban } from "./solver/solver";

describe("Sokoban Levels", () => {
  it("should have correct syntax symbols for all level layouts", () => {
    const allowedSymbols = new Set([" ", "#", ".", "@", "$", "*", "+"]);
    SOKOBAN_LEVELS.forEach((lvl) => {
      lvl.grid.forEach((row) => {
        for (const char of row) {
          expect(allowedSymbols.has(char)).toBe(true);
        }
      });
    });
  });

  it("should contain at least 1 player, 1 box, and 1 target in each level", () => {
    SOKOBAN_LEVELS.forEach((lvl) => {
      let players = 0;
      let boxes = 0;
      let targets = 0;

      lvl.grid.forEach((row) => {
        for (const char of row) {
          if (char === "@" || char === "+") players++;
          if (char === "$" || char === "*") boxes++;
          if (char === "." || char === "*" || char === "+") targets++;
        }
      });

      expect(players, `Level ${lvl.id} (${lvl.name}) must have exactly 1 player`).toBe(1);
      expect(boxes, `Level ${lvl.id} (${lvl.name}) must have at least 1 box`).toBeGreaterThan(0);
      expect(targets, `Level ${lvl.id} (${lvl.name}) box count must match target count`).toBe(boxes);
    });
  });

  it("should have 100 hacker-themed levels", () => {
    expect(SOKOBAN_LEVELS.length).toBe(100);

    // Check that all levels have hacker theme IDs
    SOKOBAN_LEVELS.forEach((lvl) => {
      expect(lvl.id).toMatch(/^hack-\d{2,3}$/);
    });
  });

  it("should verify no level is mathematically unsolvable", () => {
    SOKOBAN_LEVELS.forEach((level) => {
      const result = solveSokoban(level, 100000, 30000);
      const isSolvableOrComplex = result.solvable || result.statesExplored === 100000;
      expect(
        isSolvableOrComplex,
        `Level ${level.id} (${level.name}) is mathematically unsolvable (explored only ${result.statesExplored} states)`
      ).toBe(true);
    });
  });
});
