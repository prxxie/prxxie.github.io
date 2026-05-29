import { create } from 'zustand';
import { validateRegion } from '../engine/validation';
import { solvePuzzle } from '../engine/solver';

const DEFAULT_COLORS = [
  'rgba(245, 158, 11, 0.3)',  // Amber
  'rgba(16, 185, 129, 0.3)',  // Emerald
  'rgba(59, 130, 246, 0.3)',  // Blue
  'rgba(236, 72, 153, 0.3)',  // Pink
  'rgba(139, 92, 246, 0.3)',  // Purple
  'rgba(20, 184, 166, 0.3)'   // Teal
];

export const useShikakuStore = create((set, get) => ({
  levels: [],
  currentLevelIndex: 0,
  puzzle: null,
  regions: [],
  history: [],
  dragStart: null,
  dragEnd: null,
  elapsedTime: 0,
  timerActive: false,
  isWon: false,
  starsAchieved: 0,
  completedLevels: {},

  loadSave: () => {
    try {
      const saved = localStorage.getItem('cozy_os_shikaku_save');
      if (saved) {
        set({ completedLevels: JSON.parse(saved).completed || {} });
      }
    } catch (e) {
      console.error("Failed to load save state", e);
    }
  },

  saveProgress: (levelId, stars, time) => {
    const current = get().completedLevels[levelId];
    const bestTime = current ? Math.min(current.bestTime, time) : time;
    const bestStars = current ? Math.max(current.stars, stars) : stars;

    const updated = {
      ...get().completedLevels,
      [levelId]: { stars: bestStars, bestTime }
    };
    set({ completedLevels: updated });
    try {
      localStorage.setItem('cozy_os_shikaku_save', JSON.stringify({ completed: updated }));
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  },

  loadLevel: (levelsList, index) => {
    const puzzle = levelsList[index];
    set({
      levels: levelsList,
      currentLevelIndex: index,
      puzzle,
      regions: [],
      history: [],
      dragStart: null,
      dragEnd: null,
      elapsedTime: 0,
      timerActive: true,
      isWon: false,
      starsAchieved: 0
    });
  },

  startDrag: (x, y) => {
    if (get().isWon) return;
    set({ dragStart: { x, y }, dragEnd: { x, y } });
  },

  updateDrag: (x, y) => {
    if (!get().dragStart) return;
    set({ dragEnd: { x, y } });
  },

  commitDrag: () => {
    const { dragStart, dragEnd, puzzle, regions, history, elapsedTime } = get();
    if (!dragStart || !dragEnd || !puzzle) return;

    const x = Math.min(dragStart.x, dragEnd.x);
    const y = Math.min(dragStart.y, dragEnd.y);
    const width = Math.abs(dragStart.x - dragEnd.x) + 1;
    const height = Math.abs(dragStart.y - dragEnd.y) + 1;

    const proposed = {
      id: `reg-${Date.now()}`,
      x,
      y,
      width,
      height,
      area: width * height,
      color: DEFAULT_COLORS[regions.length % DEFAULT_COLORS.length]
    };

    const valCheck = validateRegion(proposed, puzzle, regions);

    if (valCheck.valid) {
      const committed = {
        ...proposed,
        clueX: valCheck.clueX,
        clueY: valCheck.clueY
      };

      const nextRegions = [...regions, committed];
      const nextHistory = [...history, regions];

      // Check Win Condition
      const totalArea = nextRegions.reduce((sum, r) => sum + r.width * r.height, 0);
      const win = totalArea === puzzle.width * puzzle.height;

      let stars = 0;
      if (win) {
        const targets = puzzle.targets;
        if (elapsedTime <= targets.threeStars) stars = 3;
        else if (elapsedTime <= targets.twoStars) stars = 2;
        else stars = 1;
        
        get().saveProgress(puzzle.id, stars, elapsedTime);
      }

      set({
        regions: nextRegions,
        history: nextHistory,
        dragStart: null,
        dragEnd: null,
        isWon: win,
        timerActive: !win,
        starsAchieved: stars
      });
      return { success: true };
    }

    set({ dragStart: null, dragEnd: null });
    return { success: false, reason: valCheck.reason };
  },

  cancelDrag: () => {
    set({ dragStart: null, dragEnd: null });
  },

  removeRegionAt: (x, y) => {
    const { regions, history, isWon } = get();
    if (isWon) return;

    const found = regions.find(
      r => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height
    );
    if (!found) return;

    const nextRegions = regions.filter(r => r.id !== found.id);
    const nextHistory = [...history, regions];

    set({
      regions: nextRegions,
      history: nextHistory
    });
  },

  undo: () => {
    const { history, isWon } = get();
    if (history.length === 0 || isWon) return;
    const prevRegions = history[history.length - 1];
    const nextHistory = history.slice(0, -1);
    set({
      regions: prevRegions,
      history: nextHistory
    });
  },

  resetLevel: () => {
    set({
      regions: [],
      history: [],
      dragStart: null,
      dragEnd: null,
      elapsedTime: 0,
      timerActive: true,
      isWon: false,
      starsAchieved: 0
    });
  },

  tickTimer: () => {
    if (get().timerActive) {
      set(state => ({ elapsedTime: state.elapsedTime + 1 }));
    }
  },

  getHint: () => {
    const { puzzle, regions } = get();
    if (!puzzle || get().isWon) return;

    const fullSolution = solvePuzzle(puzzle);
    if (!fullSolution) return;

    // Find the first solution region that is not currently covered correctly
    const missingRegion = fullSolution.find(solReg => {
      return !regions.some(
        userReg =>
          userReg.x === solReg.x &&
          userReg.y === solReg.y &&
          userReg.width === solReg.width &&
          userReg.height === solReg.height
      );
    });

    if (missingRegion) {
      // Clear any user regions that overlap the missing (correct) region
      const overlappingUserRegs = regions.filter(userReg => {
        return (
          userReg.x < missingRegion.x + missingRegion.width &&
          userReg.x + userReg.width > missingRegion.x &&
          userReg.y < missingRegion.y + missingRegion.height &&
          userReg.y + userReg.height > missingRegion.y
        );
      });

      let nextRegions = regions;
      if (overlappingUserRegs.length > 0) {
        nextRegions = regions.filter(r => !overlappingUserRegs.some(o => o.id === r.id));
      }

      const committedHint = {
        ...missingRegion,
        id: `hint-${Date.now()}`,
        color: 'rgba(16, 185, 129, 0.4)' // Green tint for hint
      };

      const finalRegions = [...nextRegions, committedHint];
      const nextHistory = [...get().history, regions];

      // Check if hint completes board
      const totalArea = finalRegions.reduce((sum, r) => sum + r.width * r.height, 0);
      const win = totalArea === puzzle.width * puzzle.height;

      let stars = 0;
      if (win) {
        stars = 1; // Hint completion limits to 1 star
        get().saveProgress(puzzle.id, stars, get().elapsedTime);
      }

      set({
        regions: finalRegions,
        history: nextHistory,
        isWon: win,
        timerActive: !win,
        starsAchieved: stars
      });
    }
  }
}));
