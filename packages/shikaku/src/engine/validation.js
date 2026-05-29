export function validateRegion(region, puzzle, existingRegions) {
  if (
    region.x < 0 || region.y < 0 ||
    region.x + region.width > puzzle.width ||
    region.y + region.height > puzzle.height
  ) {
    return { valid: false, reason: "OUT_OF_BOUNDS" };
  }

  const overlaps = existingRegions.some(existing => {
    return (
      region.x < existing.x + existing.width &&
      region.x + region.width > existing.x &&
      region.y < existing.y + existing.height &&
      region.y + region.height > existing.y
    );
  });

  if (overlaps) {
    return { valid: false, reason: "OVERLAP" };
  }

  const cluesInside = puzzle.clues.filter(
    clue =>
      clue.x >= region.x &&
      clue.x < region.x + region.width &&
      clue.y >= region.y &&
      clue.y < region.y + region.height
  );

  if (cluesInside.length === 0) {
    return { valid: false, reason: "NO_CLUE" };
  }
  if (cluesInside.length > 1) {
    return { valid: false, reason: "MULTIPLE_CLUES" };
  }

  const clue = cluesInside[0];
  const area = region.width * region.height;
  if (area !== clue.value) {
    return { valid: false, reason: "WRONG_AREA" };
  }

  return { valid: true, clueX: clue.x, clueY: clue.y };
}
