import { validateRegion } from './validation';

export function getValidPlacements(clue, puzzle, placed) {
  const placements = [];
  const val = clue.value;
  for (let w = 1; w <= val; w++) {
    if (val % w !== 0) continue;
    const h = val / w;

    for (let ox = 0; ox < w; ox++) {
      for (let oy = 0; oy < h; oy++) {
        const x = clue.x - ox;
        const y = clue.y - oy;
        const reg = { x, y, width: w, height: h };
        const check = validateRegion(reg, puzzle, placed);
        if (check.valid) {
          placements.push({
            ...reg,
            area: val,
            clueX: clue.x,
            clueY: clue.y
          });
        }
      }
    }
  }
  return placements;
}

export function solvePuzzle(puzzle) {
  const clues = [...puzzle.clues].sort((a, b) => b.value - a.value); // Solve largest clues first

  function backtrack(clueIdx, placed) {
    if (clueIdx === clues.length) {
      const totalArea = placed.reduce((sum, r) => sum + r.width * r.height, 0);
      if (totalArea === puzzle.width * puzzle.height) {
        return placed;
      }
      return null;
    }

    const clue = clues[clueIdx];
    // Check if this clue is already covered by a placed rectangle
    const alreadyCovered = placed.some(
      r => clue.x >= r.x && clue.x < r.x + r.width && clue.y >= r.y && clue.y < r.y + r.height
    );
    if (alreadyCovered) {
      return backtrack(clueIdx + 1, placed);
    }

    const candidates = getValidPlacements(clue, puzzle, placed);
    for (const cand of candidates) {
      const res = backtrack(clueIdx + 1, [...placed, cand]);
      if (res) return res;
    }
    return null;
  }

  return backtrack(0, []);
}
