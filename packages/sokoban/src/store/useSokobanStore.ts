import { create } from "zustand";
import { TileType, Player, Box, MoveSnapshot } from "../types";
import { type PetDirection } from "../components/PetSprite";
import { SOKOBAN_LEVELS } from "../levels";
import { synth } from "../engine/synth";

interface SokobanState {
  currentLevelIdx: number;
  board: TileType[][];
  player: Player;
  boxes: Box[];
  moves: number;
  history: MoveSnapshot[];
  isWon: boolean;
  isMuted: boolean;
  deadlockedBoxIds: string[];
  lastDirection: PetDirection;
  isMoving: boolean;

  loadLevel: (levelIdx: number) => void;
  move: (dx: number, dy: number) => void;
  undo: () => void;
  restart: () => void;
  nextLevel: () => void;
  setMuted: (muted: boolean) => void;
}

const computeDeadlocks = (board: TileType[][], boxes: Box[]): string[] => {
  const deadlocked: string[] = [];
  for (const box of boxes) {
    const { x, y } = box;
    if (y < 0 || y >= board.length || x < 0 || x >= board[y].length) continue;
    if (board[y][x] === TileType.TARGET) continue;

    const leftWall = board[y]?.[x - 1] === TileType.WALL;
    const rightWall = board[y]?.[x + 1] === TileType.WALL;
    const upWall = board[y - 1]?.[x] === TileType.WALL;
    const downWall = board[y + 1]?.[x] === TileType.WALL;

    const inCorner = (leftWall || rightWall) && (upWall || downWall);
    if (inCorner) {
      deadlocked.push(box.id);
    }
  }
  return deadlocked;
};

export const useSokobanStore = create<SokobanState>((set, get) => ({
  currentLevelIdx: 0,
  board: [],
  player: { x: 0, y: 0 },
  boxes: [],
  moves: 0,
  history: [],
  isWon: false,
  isMuted: false,
  deadlockedBoxIds: [],
  lastDirection: "down",
  isMoving: false,

  loadLevel: (levelIdx) => {
    synth.init();
    const normalizedIdx = Math.max(0, Math.min(levelIdx, SOKOBAN_LEVELS.length - 1));
    const lvl = SOKOBAN_LEVELS[normalizedIdx];
    
    const board: TileType[][] = [];
    const boxes: Box[] = [];
    let player: Player = { x: 0, y: 0 };
    let boxCounter = 0;

    lvl.grid.forEach((row, y) => {
      const boardRow: TileType[] = [];
      for (let x = 0; x < row.length; x++) {
        const char = row[x];
        if (char === "#") {
          boardRow.push(TileType.WALL);
        } else if (char === ".") {
          boardRow.push(TileType.TARGET);
        } else if (char === "@") {
          boardRow.push(TileType.FLOOR);
          player = { x, y };
        } else if (char === "$") {
          boardRow.push(TileType.FLOOR);
          boxes.push({ id: `box-${boxCounter++}`, x, y });
        } else if (char === "*") {
          boardRow.push(TileType.TARGET);
          boxes.push({ id: `box-${boxCounter++}`, x, y });
        } else if (char === "+") {
          boardRow.push(TileType.TARGET);
          player = { x, y };
        } else {
          boardRow.push(TileType.EMPTY);
        }
      }
      board.push(boardRow);
    });

    set({
      currentLevelIdx: normalizedIdx,
      board,
      player,
      boxes,
      moves: 0,
      history: [],
      isWon: false,
      deadlockedBoxIds: [],
      lastDirection: "down",
      isMoving: false
    });
  },

  move: (dx, dy) => {
    const { board, player, boxes, history, moves, isWon } = get();
    if (isWon) return;

    // Update facing direction
    const dirMap: Record<string, PetDirection> = { "0,-1": "up", "0,1": "down", "-1,0": "left", "1,0": "right" };
    const dirKey = `${dx},${dy}`;
    const newDir = dirMap[dirKey] || get().lastDirection;
    set({ lastDirection: newDir, isMoving: true });

    const tx = player.x + dx;
    const ty = player.y + dy;

    if (ty < 0 || ty >= board.length || tx < 0 || tx >= board[ty].length) {
      synth.playError();
      return;
    }
    if (board[ty][tx] === TileType.WALL) {
      synth.playError();
      return; // Blocked by wall
    }

    const pushedBoxIndex = boxes.findIndex((b) => b.x === tx && b.y === ty);

    if (pushedBoxIndex !== -1) {
      // Push box validation
      const bx = tx + dx;
      const by = ty + dy;

      if (by < 0 || by >= board.length || bx < 0 || bx >= board[by].length) {
        synth.playError();
        return;
      }
      if (board[by][bx] === TileType.WALL) {
        synth.playError();
        return; // Behind is wall
      }
      if (boxes.some((b) => b.x === bx && b.y === by)) {
        synth.playError();
        return; // Behind is another box
      }

      // Valid Push move
      const snapshot: MoveSnapshot = {
        player: { ...player },
        boxes: boxes.map((b) => ({ ...b }))
      };

      const updatedBoxes = boxes.map((b, idx) => 
        idx === pushedBoxIndex ? { ...b, x: bx, y: by } : b
      );

      const newDeadlocks = computeDeadlocks(board, updatedBoxes);
      const win = updatedBoxes.every((b) => board[b.y]?.[b.x] === TileType.TARGET);

      if (win) {
        synth.playWin();
      } else {
        synth.playPush();
      }

      set({
        player: { x: tx, y: ty },
        boxes: updatedBoxes,
        moves: moves + 1,
        history: [...history, snapshot],
        isWon: win,
        deadlockedBoxIds: newDeadlocks,
        isMoving: false
      });
    } else {
      // Simple step move
      const snapshot: MoveSnapshot = {
        player: { ...player },
        boxes: boxes.map((b) => ({ ...b }))
      };

      const win = boxes.every((b) => board[b.y]?.[b.x] === TileType.TARGET);

      if (win) {
        synth.playWin();
      } else {
        synth.playMove();
      }

      set({
        player: { x: tx, y: ty },
        moves: moves + 1,
        history: [...history, snapshot],
        isWon: win,
        isMoving: false
      });
    }
  },

  undo: () => {
    const { history } = get();
    if (history.length === 0) return;

    const newHistory = [...history];
    const snapshot = newHistory.pop()!;

    set({
      player: snapshot.player,
      boxes: snapshot.boxes,
      history: newHistory,
      moves: Math.max(0, get().moves - 1),
      isWon: false,
      deadlockedBoxIds: computeDeadlocks(get().board, snapshot.boxes)
    });
  },

  restart: () => {
    const { currentLevelIdx, loadLevel } = get();
    loadLevel(currentLevelIdx);
  },

  nextLevel: () => {
    const { currentLevelIdx, loadLevel } = get();
    loadLevel(currentLevelIdx + 1);
  },

  setMuted: (muted) => {
    synth.setMuted(muted);
    set({ isMuted: muted });
  }
}));
