import { validateRegion } from "./validation";
import type { Clue, Puzzle, Region } from "../types";

export function getValidPlacements(
  clue: Clue,
  puzzle: Puzzle,
  placed: Region[] = []
): Region[] {
  const placements: Region[] = [];
  const val = clue.value;
  for (let w = 1; w <= val; w++) {
    if (val % w !== 0) continue;
    const h = val / w;

    const minOx = Math.max(0, clue.x + w - puzzle.width);
    const maxOx = Math.min(w - 1, clue.x);

    for (let ox = minOx; ox <= maxOx; ox++) {
      const minOy = Math.max(0, clue.y + h - puzzle.height);
      const maxOy = Math.min(h - 1, clue.y);

      for (let oy = minOy; oy <= maxOy; oy++) {
        const x = clue.x - ox;
        const y = clue.y - oy;
        const reg: Region = {
          id: "",
          x,
          y,
          width: w,
          height: h,
          area: val,
          color: "",
          clueX: 0,
          clueY: 0,
        };
        const check = validateRegion(reg, puzzle, placed);
        if (check.valid) {
          placements.push({
            ...reg,
            area: val,
            clueX: clue.x,
            clueY: clue.y,
          });
        }
      }
    }
  }
  return placements;
}

export function solvePuzzle(puzzle: Puzzle): Region[] | null {
  const clues = [...puzzle.clues].sort((a, b) => b.value - a.value);

  const clueCandidates = clues.map((clue) =>
    getValidPlacements(clue, puzzle)
  );

  if (clueCandidates.some((cands) => cands.length === 0)) {
    return null;
  }

  function backtrack(clueIdx: number, placed: Region[]): Region[] | null {
    if (clueIdx === clues.length) {
      const totalArea = placed.reduce(
        (sum, r) => sum + r.width * r.height,
        0
      );
      if (totalArea === puzzle.width * puzzle.height) {
        return placed;
      }
      return null;
    }

    const candidates = clueCandidates[clueIdx];
    for (const cand of candidates) {
      const overlaps = placed.some((existing) => {
        return (
          cand.x < existing.x + existing.width &&
          cand.x + cand.width > existing.x &&
          cand.y < existing.y + existing.height &&
          cand.y + cand.height > existing.y
        );
      });

      if (!overlaps) {
        placed.push(cand);
        const res = backtrack(clueIdx + 1, placed);
        if (res) return res;
        placed.pop();
      }
    }
    return null;
  }

  return backtrack(0, []);
}
