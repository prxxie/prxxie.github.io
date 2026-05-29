import { validateRegion } from './validation';

export function getValidPlacements(clue, puzzle, placed = []) {
  const placements = [];
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

  // Pre-compute candidates for each clue
  const clueCandidates = clues.map(clue => getValidPlacements(clue, puzzle));

  // If any clue has zero candidates, the puzzle is immediately unsolvable
  if (clueCandidates.some(cands => cands.length === 0)) {
    return null;
  }

  function backtrack(clueIdx, placed) {
    if (clueIdx === clues.length) {
      const totalArea = placed.reduce((sum, r) => sum + r.width * r.height, 0);
      if (totalArea === puzzle.width * puzzle.height) {
        return placed;
      }
      return null;
    }

    const candidates = clueCandidates[clueIdx];
    for (const cand of candidates) {
      // Check if this candidate overlaps with any already placed region
      const overlaps = placed.some(existing => {
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
