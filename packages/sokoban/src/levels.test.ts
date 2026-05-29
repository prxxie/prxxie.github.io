import { describe, it, expect } from "vitest";
import { SOKOBAN_LEVELS } from "./levels";

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
});
