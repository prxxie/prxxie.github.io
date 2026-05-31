import { describe, it, expect } from "vitest";
import { getEvolutionStage, EVOLUTION_THRESHOLDS } from "./evolution";

describe("getEvolutionStage", () => {
  it("returns stage 1 for xp 0–9", () => {
    expect(getEvolutionStage(0)).toBe(1);
    expect(getEvolutionStage(9)).toBe(1);
  });

  it("returns stage 2 for xp 10–29", () => {
    expect(getEvolutionStage(10)).toBe(2);
    expect(getEvolutionStage(29)).toBe(2);
  });

  it("returns stage 3 for xp 30–59", () => {
    expect(getEvolutionStage(30)).toBe(3);
    expect(getEvolutionStage(59)).toBe(3);
  });

  it("returns stage 4 for xp 60–99", () => {
    expect(getEvolutionStage(60)).toBe(4);
    expect(getEvolutionStage(99)).toBe(4);
  });

  it("returns stage 5 for xp >= 100", () => {
    expect(getEvolutionStage(100)).toBe(5);
    expect(getEvolutionStage(9999)).toBe(5);
  });

  it("EVOLUTION_THRESHOLDS has 5 entries", () => {
    expect(EVOLUTION_THRESHOLDS).toHaveLength(5);
  });

  it("first threshold is 0", () => {
    expect(EVOLUTION_THRESHOLDS[0]).toBe(0);
  });
});
