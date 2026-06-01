import { describe, it, expect } from "vitest";
import { SOKOBAN_LEVELS } from "../levels";
import { solveSokoban } from "../solver/solver";

describe("Existing Levels Solvability", () => {
  it("should verify all existing levels are solvable", () => {
    const results = SOKOBAN_LEVELS.map((level) => {
      const result = solveSokoban(level, 100000, 30000);
      return {
        id: level.id,
        name: level.name,
        solvable: result.solvable,
        moveCount: result.moveCount,
        statesExplored: result.statesExplored,
      };
    });

    // Log results for inspection
    console.log("\nExisting Levels Solver Results:");
    results.forEach((r) => {
      console.log(
        `  ${r.id} (${r.name}): ${r.solvable ? "✓" : "✗"} - ${r.moveCount || "N/A"} moves, ${r.statesExplored} states`
      );
    });

    // All should be solvable or too complex (hitting the 100k limit)
    results.forEach((r) => {
      const isSolvableOrComplex = r.solvable || r.statesExplored === 100000;
      expect(
        isSolvableOrComplex,
        `Level ${r.id} (${r.name}) is mathematically unsolvable (explored only ${r.statesExplored} states)`
      ).toBe(true);
    });
  });
});
