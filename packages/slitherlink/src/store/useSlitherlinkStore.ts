import { create } from "zustand";
import type { Level, EdgeState } from "../types";
import { validateBoard } from "../engine/validation";
import { synth } from "../engine/synth";

interface HistoryEntry {
  hEdges: EdgeState[][];
  vEdges: EdgeState[][];
}

interface SlitherlinkState {
  level: Level | null;
  hEdges: EdgeState[][];
  vEdges: EdgeState[][];
  history: HistoryEntry[];
  elapsedTime: number;
  timerActive: boolean;
  isWon: boolean;
  starsAchieved: number;
  cellErrors: Record<string, boolean>;
  vertexErrors: Record<string, boolean>;
  isMuted: boolean;

  loadLevel: (level: Level) => void;
  toggleEdge: (type: "h" | "v", x: number, y: number) => void;
  undo: () => void;
  resetLevel: () => void;
  tickTimer: () => void;
  stopTimer: () => void;
  setMuted: (muted: boolean) => void;
}

const createInitialEdges = (w: number, h: number) => ({
  hEdges: Array.from({ length: h + 1 }, () => Array<EdgeState>(w).fill("none")),
  vEdges: Array.from({ length: h }, () => Array<EdgeState>(w + 1).fill("none"))
});

const cloneEdges = (h: EdgeState[][], v: EdgeState[][]): HistoryEntry => ({
  hEdges: h.map((row) => [...row]),
  vEdges: v.map((row) => [...row])
});

export const useSlitherlinkStore = create<SlitherlinkState>((set, get) => ({
  level: null,
  hEdges: [],
  vEdges: [],
  history: [],
  elapsedTime: 0,
  timerActive: false,
  isWon: false,
  starsAchieved: 0,
  cellErrors: {},
  vertexErrors: {},
  isMuted: false,

  loadLevel: (level: Level) => {
    const { hEdges, vEdges } = createInitialEdges(level.width, level.height);
    set({
      level,
      hEdges,
      vEdges,
      history: [],
      elapsedTime: 0,
      timerActive: true,
      isWon: false,
      starsAchieved: 0,
      cellErrors: {},
      vertexErrors: {}
    });
  },

  toggleEdge: (type: "h" | "v", x: number, y: number) => {
    const { level, hEdges, vEdges, history, isWon } = get();
    if (!level || isWon) return;

    // Save history for undo
    const newHistory = [...history, cloneEdges(hEdges, vEdges)];

    const nextH = hEdges.map((row) => [...row]);
    const nextV = vEdges.map((row) => [...row]);

    let playSound = false;
    let isRemove = false;

    if (type === "h") {
      const current = nextH[y][x];
      if (current === "none") {
        nextH[y][x] = "line";
        playSound = true;
      } else if (current === "line") {
        nextH[y][x] = "cross";
        playSound = true;
      } else {
        nextH[y][x] = "none";
        isRemove = true;
      }
    } else {
      const current = nextV[y][x];
      if (current === "none") {
        nextV[y][x] = "line";
        playSound = true;
      } else if (current === "line") {
        nextV[y][x] = "cross";
        playSound = true;
      } else {
        nextV[y][x] = "none";
        isRemove = true;
      }
    }

    if (playSound) {
      synth.playPlace();
    } else if (isRemove) {
      synth.playRemove();
    }

    // Validate new state
    const validation = validateBoard(level, { hEdges: nextH, vEdges: nextV });

    let stars = 0;
    let won = false;

    if (validation.isSolved) {
      won = true;
      synth.playWin();
      const time = get().elapsedTime;
      if (time <= level.targets.threeStars) {
        stars = 3;
      } else if (time <= level.targets.twoStars) {
        stars = 2;
      } else {
        stars = 1;
      }
    }

    set({
      hEdges: nextH,
      vEdges: nextV,
      history: newHistory,
      isWon: won,
      starsAchieved: stars,
      cellErrors: validation.cellErrors,
      vertexErrors: validation.vertexErrors
    });
  },

  undo: () => {
    const { history, level, isWon } = get();
    if (history.length === 0 || !level || isWon) return;

    const previous = history[history.length - 1];
    const newHistory = history.slice(0, history.length - 1);

    synth.playClick();

    // Recalculate validation
    const validation = validateBoard(level, { hEdges: previous.hEdges, vEdges: previous.vEdges });

    set({
      hEdges: previous.hEdges,
      vEdges: previous.vEdges,
      history: newHistory,
      cellErrors: validation.cellErrors,
      vertexErrors: validation.vertexErrors
    });
  },

  resetLevel: () => {
    const { level } = get();
    if (!level) return;
    synth.playClick();
    const { hEdges, vEdges } = createInitialEdges(level.width, level.height);
    set({
      hEdges,
      vEdges,
      history: [],
      cellErrors: {},
      vertexErrors: {},
      isWon: false,
      starsAchieved: 0,
      elapsedTime: 0,
      timerActive: true
    });
  },

  tickTimer: () => {
    const { timerActive, isWon } = get();
    if (timerActive && !isWon) {
      set((state) => ({ elapsedTime: state.elapsedTime + 1 }));
    }
  },

  stopTimer: () => {
    set({ timerActive: false });
  },

  setMuted: (muted: boolean) => {
    synth.setMuted(muted);
    set({ isMuted: muted });
  }
}));
