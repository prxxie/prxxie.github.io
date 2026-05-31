import { describe, it, expect } from "vitest";
import { solveSokoban } from "./solver";
import { LevelData } from "../types";

describe("Sokoban Solver", () => {
  it("should solve a trivial level (box already on target)", () => {
    const level: LevelData = {
      id: "test-trivial",
      name: "Trivial",
      grid: ["#####", "#@  #", "# * #", "#####"],
    };

    const result = solveSokoban(level);
    expect(result.solvable).toBe(true);
    expect(result.moveCount).toBe(0);
  });

  it("should solve a simple one-box level", () => {
    const level: LevelData = {
      id: "test-simple",
      name: "Simple",
      grid: ["#####", "#@  #", "# $ #", "# . #", "#####"],
    };

    const result = solveSokoban(level);
    expect(result.solvable).toBe(true);
    expect(result.moveCount).toBeGreaterThan(0);
    expect(result.solution).toBeDefined();
  });

  it("should detect unsolvable level (box in corner)", () => {
    const level: LevelData = {
      id: "test-unsolvable",
      name: "Unsolvable",
      grid: ["#####", "#@  #", "#$  #", "# . #", "#####"],
    };

    const result = solveSokoban(level);
    expect(result.solvable).toBe(false);
  });

  it("should solve a two-box level", () => {
    const level: LevelData = {
      id: "test-two-box",
      name: "Two Box",
      grid: ["######", "#@   #", "# $$ #", "# .. #", "######"],
    };

    const result = solveSokoban(level);
    expect(result.solvable).toBe(true);
    expect(result.moveCount).toBeGreaterThan(0);
  });

  it("should respect state limit", () => {
    const level: LevelData = {
      id: "test-complex",
      name: "Complex",
      grid: [
        "########",
        "#      #",
        "# $$$$ #",
        "# .... #",
        "#   @  #",
        "########",
      ],
    };

    const result = solveSokoban(level, 100, 30000); // very low state limit
    // Should either solve quickly or hit the limit
    expect(result.statesExplored).toBeLessThanOrEqual(100);
  });
});
