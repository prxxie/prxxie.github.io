export const EVOLUTION_THRESHOLDS = [0, 10, 30, 60, 100] as const;

export function getEvolutionStage(xp: number): number {
  let stage = 1;
  for (let i = 1; i < EVOLUTION_THRESHOLDS.length; i++) {
    if (xp >= EVOLUTION_THRESHOLDS[i]) stage = i + 1;
  }
  return stage;
}
