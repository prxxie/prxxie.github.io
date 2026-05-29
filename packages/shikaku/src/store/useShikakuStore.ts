import { create } from "zustand";
import { validateRegion } from "../engine/validation";
import { solvePuzzle } from "../engine/solver";
import type {
  Puzzle,
  Region,
  DragPoint,
  CompletedLevels,
  ValidationResult,
} from "../types";

const DEFAULT_COLORS = [
  "rgba(245, 158, 11, 0.3)",
  "rgba(16, 185, 129, 0.3)",
  "rgba(59, 130, 246, 0.3)",
  "rgba(236, 72, 153, 0.3)",
  "rgba(139, 92, 246, 0.3)",
  "rgba(20, 184, 166, 0.3)",
];

interface CommitResult {
  success: boolean;
  reason?: string;
}

export interface ShikakuState {
  levels: Puzzle[];
  currentLevelIndex: number;
  puzzle: Puzzle | null;
  regions: Region[];
  history: Region[][];
  dragStart: DragPoint | null;
  dragEnd: DragPoint | null;
  elapsedTime: number;
  timerActive: boolean;
  isWon: boolean;
  starsAchieved: number;
  completedLevels: CompletedLevels;
  loadSave: () => void;
  saveProgress: (levelId: string, stars: number, time: number) => void;
  loadLevel: (levelsList: Puzzle[], index: number) => void;
  startDrag: (x: number, y: number) => void;
  updateDrag: (x: number, y: number) => void;
  commitDrag: () => CommitResult | void;
  cancelDrag: () => void;
  removeRegionAt: (x: number, y: number) => void;
  undo: () => void;
  resetLevel: () => void;
  tickTimer: () => void;
  getHint: () => void;
}

export const useShikakuStore = create<ShikakuState>()((set, get) => ({
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
      const saved = localStorage.getItem("cozy_os_shikaku_save");
      if (saved) {
        const parsed = JSON.parse(saved) as unknown;
        if (parsed && typeof parsed === "object" && "completed" in parsed) {
          const completed = (parsed as { completed: CompletedLevels }).completed;
          set({ completedLevels: completed || {} });
        }
      }
    } catch (e) {
      console.error("Failed to load save state", e);
    }
  },

  saveProgress: (levelId: string, stars: number, time: number) => {
    const current = get().completedLevels[levelId];
    const bestTime = current ? Math.min(current.bestTime, time) : time;
    const bestStars = current ? Math.max(current.stars, stars) : stars;

    const updated: CompletedLevels = {
      ...get().completedLevels,
      [levelId]: { stars: bestStars, bestTime },
    };
    set({ completedLevels: updated });
    try {
      localStorage.setItem(
        "cozy_os_shikaku_save",
        JSON.stringify({ completed: updated })
      );
    } catch (e) {
      console.error("Failed to save progress", e);
    }
  },

  loadLevel: (levelsList: Puzzle[], index: number) => {
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
      starsAchieved: 0,
    });
  },

  startDrag: (x: number, y: number) => {
    if (get().isWon) return;
    set({ dragStart: { x, y }, dragEnd: { x, y } });
  },

  updateDrag: (x: number, y: number) => {
    if (!get().dragStart) return;
    set({ dragEnd: { x, y } });
  },

  commitDrag: (): CommitResult | void => {
    const { dragStart, dragEnd, puzzle, regions, history, elapsedTime } =
      get();
    if (!dragStart || !dragEnd || !puzzle) return;

    const x = Math.min(dragStart.x, dragEnd.x);
    const y = Math.min(dragStart.y, dragEnd.y);
    const width = Math.abs(dragStart.x - dragEnd.x) + 1;
    const height = Math.abs(dragStart.y - dragEnd.y) + 1;

    const proposed: Region = {
      id: `reg-${Date.now()}`,
      x,
      y,
      width,
      height,
      area: width * height,
      color: DEFAULT_COLORS[regions.length % DEFAULT_COLORS.length],
      clueX: 0,
      clueY: 0,
    };

    const valCheck: ValidationResult = validateRegion(
      proposed,
      puzzle,
      regions
    );

    if (valCheck.valid) {
      const committed: Region = {
        ...proposed,
        clueX: valCheck.clueX ?? 0,
        clueY: valCheck.clueY ?? 0,
      };

      const nextRegions = [...regions, committed];
      const nextHistory = [...history, regions];

      const totalArea = nextRegions.reduce(
        (sum, r) => sum + r.width * r.height,
        0
      );
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
        starsAchieved: stars,
      });
      return { success: true };
    }

    set({ dragStart: null, dragEnd: null });
    return { success: false, reason: valCheck.reason };
  },

  cancelDrag: () => {
    set({ dragStart: null, dragEnd: null });
  },

  removeRegionAt: (x: number, y: number) => {
    const { regions, history, isWon } = get();
    if (isWon) return;

    const found = regions.find(
      (r) =>
        x >= r.x &&
        x < r.x + r.width &&
        y >= r.y &&
        y < r.y + r.height
    );
    if (!found) return;

    const nextRegions = regions.filter((r) => r.id !== found.id);
    const nextHistory = [...history, regions];

    set({
      regions: nextRegions,
      history: nextHistory,
    });
  },

  undo: () => {
    const { history, isWon } = get();
    if (history.length === 0 || isWon) return;
    const prevRegions = history[history.length - 1];
    const nextHistory = history.slice(0, -1);
    set({
      regions: prevRegions,
      history: nextHistory,
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
      starsAchieved: 0,
    });
  },

  tickTimer: () => {
    if (get().timerActive) {
      set((state) => ({ elapsedTime: state.elapsedTime + 1 }));
    }
  },

  getHint: () => {
    const { puzzle, regions } = get();
    if (!puzzle || get().isWon) return;

    const fullSolution = solvePuzzle(puzzle);
    if (!fullSolution) return;

    const missingRegion = fullSolution.find((solReg) => {
      return !regions.some(
        (userReg) =>
          userReg.x === solReg.x &&
          userReg.y === solReg.y &&
          userReg.width === solReg.width &&
          userReg.height === solReg.height
      );
    });

    if (missingRegion) {
      const overlappingUserRegs = regions.filter((userReg) => {
        return (
          userReg.x < missingRegion.x + missingRegion.width &&
          userReg.x + userReg.width > missingRegion.x &&
          userReg.y < missingRegion.y + missingRegion.height &&
          userReg.y + userReg.height > missingRegion.y
        );
      });

      let nextRegions = regions;
      if (overlappingUserRegs.length > 0) {
        nextRegions = regions.filter(
          (r) => !overlappingUserRegs.some((o) => o.id === r.id)
        );
      }

      const committedHint: Region = {
        ...missingRegion,
        id: `hint-${Date.now()}`,
        color: "rgba(16, 185, 129, 0.4)",
      };

      const finalRegions = [...nextRegions, committedHint];
      const nextHistory = [...get().history, regions];

      const totalArea = finalRegions.reduce(
        (sum, r) => sum + r.width * r.height,
        0
      );
      const win = totalArea === puzzle.width * puzzle.height;

      let stars = 0;
      if (win) {
        stars = 1;
        get().saveProgress(puzzle.id, stars, get().elapsedTime);
      }

      set({
        regions: finalRegions,
        history: nextHistory,
        isWon: win,
        timerActive: !win,
        starsAchieved: stars,
      });
    }
  },
}));
