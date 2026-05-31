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

    // All should be solvable
    results.forEach((r) => {
      expect(r.solvable, `Level ${r.id} (${r.name}) should be solvable`).toBe(
        true
      );
    });
  });
});
