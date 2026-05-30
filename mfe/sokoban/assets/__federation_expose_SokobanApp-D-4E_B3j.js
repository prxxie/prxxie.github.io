import { importShared } from './__federation_fn_import-D-nfbenS.js';
import { r as reactExports } from './index-Dm_EQZZA.js';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f=reactExports,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:true,ref:true,__self:true,__source:true};
function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a) void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;

{
  jsxRuntime.exports = reactJsxRuntime_production_min;
}

var jsxRuntimeExports = jsxRuntime.exports;

var TileType = /* @__PURE__ */ ((TileType2) => {
  TileType2[TileType2["EMPTY"] = 0] = "EMPTY";
  TileType2[TileType2["WALL"] = 1] = "WALL";
  TileType2[TileType2["FLOOR"] = 2] = "FLOOR";
  TileType2[TileType2["TARGET"] = 3] = "TARGET";
  return TileType2;
})(TileType || {});

const SOKOBAN_LEVELS = [
  // ── Easy: 1–5 (1–2 boxes, small grids) ───────────────────────────
  {
    id: "soko-01",
    name: "First Steps",
    grid: [
      "  ####  ",
      "###  ###",
      "#      #",
      "# .$$# #",
      "#  @.  #",
      "########"
    ]
  },
  {
    id: "soko-02",
    name: "Tiny Trial",
    grid: [
      "#####",
      "#@  #",
      "# $ #",
      "# . #",
      "#####"
    ]
  },
  {
    id: "soko-03",
    name: "Side by Side",
    grid: [
      "######",
      "#@  .#",
      "# $$ #",
      "# .  #",
      "######"
    ]
  },
  {
    id: "soko-04",
    name: "Cross Paths",
    grid: [
      "######",
      "#  . #",
      "# $  #",
      "#.$  #",
      "#@   #",
      "######"
    ]
  },
  {
    id: "soko-05",
    name: "Box Duo",
    grid: [
      "######",
      "#@   #",
      "# $$ #",
      "# .. #",
      "######"
    ]
  },
  // ── Medium: 6–10 (2–3 boxes) ─────────────────────────────────────
  {
    id: "soko-06",
    name: "L-Shaped",
    grid: [
      " #####",
      "## . #",
      "# $  #",
      "#  $ #",
      "# .  #",
      "#@   #",
      "######"
    ]
  },
  {
    id: "soko-07",
    name: "Zigzag",
    grid: [
      " ######",
      "##  . #",
      "#  .  #",
      "# $   #",
      "#  $  #",
      "#   @ #",
      "#######"
    ]
  },
  {
    id: "soko-08",
    name: "Two Corners",
    grid: [
      "#########",
      "#  . .  #",
      "#  $ $  #",
      "#       #",
      "#   @   #",
      "#########"
    ]
  },
  {
    id: "soko-09",
    name: "The Alley",
    grid: [
      " #######",
      "##     #",
      "# $ $  #",
      "#  . . #",
      "#   @  #",
      "########"
    ]
  },
  {
    id: "soko-10",
    name: "Trio",
    grid: [
      "#######",
      "#  $ .#",
      "#$  . #",
      "#  $  #",
      "# . @ #",
      "#######"
    ]
  },
  // ── Hard: 11–15 (3–4 boxes) ──────────────────────────────────────
  {
    id: "soko-11",
    name: "Crossing",
    grid: [
      " #######",
      "##     #",
      "# $  . #",
      "# .  $ #",
      "#  $   #",
      "#   . @#",
      "########"
    ]
  },
  {
    id: "soko-12",
    name: "Staircase",
    grid: [
      "########",
      "#   .  #",
      "# $    #",
      "#   $  #",
      "# .    #",
      "#  $   #",
      "#   .@ #",
      "########"
    ]
  },
  {
    id: "soko-13",
    name: "Deadlock Danger",
    grid: [
      "#########",
      "#  . $. #",
      "# $  .  #",
      "#       #",
      "#  $    #",
      "#  @    #",
      "#########"
    ]
  },
  {
    id: "soko-14",
    name: "The Wall",
    grid: [
      " #######",
      "##     #",
      "#  $.  #",
      "#  . $ #",
      "#   $  #",
      "#  .  @#",
      "########"
    ]
  },
  {
    id: "soko-15",
    name: "Four Corners",
    grid: [
      "#########",
      "# .  .  #",
      "#       #",
      "# $  $  #",
      "#       #",
      "# .  .  #",
      "# $  $  #",
      "#    @  #",
      "#########"
    ]
  },
  // ── Expert: 16–20 (4–5 boxes) ────────────────────────────────────
  {
    id: "soko-16",
    name: "The Knot",
    grid: [
      "########",
      "#  .   #",
      "#      #",
      "# .$$  #",
      "#  $   #",
      "#  . @ #",
      "########"
    ]
  },
  {
    id: "soko-17",
    name: "Traverse",
    grid: [
      "########",
      "#   .  #",
      "#  $   #",
      "# .  $ #",
      "#   .  #",
      "#  $   #",
      "#   @  #",
      "########"
    ]
  },
  {
    id: "soko-18",
    name: "Spiral",
    grid: [
      " #######",
      "##     #",
      "#  . $ #",
      "# $ .  #",
      "#   $  #",
      "#  .   #",
      "#    @ #",
      "########"
    ]
  },
  {
    id: "soko-19",
    name: "Gauntlet",
    grid: [
      "########",
      "# .  . #",
      "# $  $ #",
      "#   .  #",
      "#  $   #",
      "# .  $ #",
      "#   @  #",
      "########"
    ]
  },
  {
    id: "soko-20",
    name: "The Grand",
    grid: [
      "##########",
      "#  .  .  #",
      "# $  $   #",
      "#   .    #",
      "#  $  $  #",
      "# .      #",
      "#    @   #",
      "##########"
    ]
  }
];

class SokobanSynth {
  ctx = null;
  muted = false;
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume().catch((err) => {
        console.warn("Failed to resume AudioContext:", err);
      });
    }
  }
  setMuted(val) {
    this.muted = val;
  }
  playMove() {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.04);
  }
  playPush() {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.12);
  }
  playError() {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(130, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(1e-3, now + 0.15);
    osc.start(now);
    osc.stop(now + 0.15);
  }
  playWin() {
    if (this.muted) return;
    this.init();
    const ctx = this.ctx;
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(1e-3, now + idx * 0.08 + 0.25);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.25);
    });
  }
}
const synth = new SokobanSynth();

const {create} = await importShared('zustand');
const computeDeadlocks = (board, boxes) => {
  const deadlocked = [];
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
const useSokobanStore = create((set, get) => ({
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
    const board = [];
    const boxes = [];
    let player = { x: 0, y: 0 };
    let boxCounter = 0;
    lvl.grid.forEach((row, y) => {
      const boardRow = [];
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
    const dirMap = { "0,-1": "up", "0,1": "down", "-1,0": "left", "1,0": "right" };
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
      return;
    }
    const pushedBoxIndex = boxes.findIndex((b) => b.x === tx && b.y === ty);
    if (pushedBoxIndex !== -1) {
      const bx = tx + dx;
      const by = ty + dy;
      if (by < 0 || by >= board.length || bx < 0 || bx >= board[by].length) {
        synth.playError();
        return;
      }
      if (board[by][bx] === TileType.WALL) {
        synth.playError();
        return;
      }
      if (boxes.some((b) => b.x === bx && b.y === by)) {
        synth.playError();
        return;
      }
      const snapshot = {
        player: { ...player },
        boxes: boxes.map((b) => ({ ...b }))
      };
      const updatedBoxes = boxes.map(
        (b, idx) => idx === pushedBoxIndex ? { ...b, x: bx, y: by } : b
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
      const snapshot = {
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
    const snapshot = newHistory.pop();
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

function HUD({ onBack }) {
  const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);
  const moves = useSokobanStore((state) => state.moves);
  const undo = useSokobanStore((state) => state.undo);
  const restart = useSokobanStore((state) => state.restart);
  const history = useSokobanStore((state) => state.history);
  const isMuted = useSokobanStore((state) => state.isMuted);
  const setMuted = useSokobanStore((state) => state.setMuted);
  const levelName = SOKOBAN_LEVELS[currentLevelIdx]?.name || `Level ${currentLevelIdx + 1}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex flex-col gap-2 p-2 border-b border-cozy-border font-press text-[10px] select-none text-cozy-text", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onBack, className: "pixel-btn px-2 py-1 text-[8px]", "aria-label": "Back to level selection", children: "< MENU" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: levelName.toUpperCase() }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "MOVES: ",
        moves
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 justify-center items-center mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: undo,
          disabled: history.length === 0,
          className: "pixel-btn disabled:opacity-40 disabled:pointer-events-none",
          "aria-label": "Undo Move",
          children: "UNDO"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: restart, className: "pixel-btn", "aria-label": "Restart Level", children: "RESET" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setMuted(!isMuted),
          className: "pixel-btn",
          "aria-label": isMuted ? "Unmute Audio" : "Mute Audio",
          children: isMuted ? "🔇" : "🔊"
        }
      )
    ] })
  ] });
}

function getBodyColor(status, isSleeping) {
  if (isSleeping) return "#779988";
  if (status === "eating") return "#CC6666";
  if (status === "playing") return "#CC6666";
  if (status === "moving") return "#CC9966";
  return "#A0785A";
}
function getEyeOffset(direction) {
  const baseX = direction === "left" ? -0.5 : direction === "right" ? 0.5 : 0;
  const baseY = direction === "up" ? -0.5 : direction === "down" ? 0.5 : 0;
  return { ex: baseX, ey: baseY };
}
function PetSprite({
  size = 16,
  status = "idle",
  isSleeping = false,
  direction = "down",
  animationFrame = 0,
  className = ""
}) {
  const bodyColor = getBodyColor(status, isSleeping);
  const { ex, ey } = getEyeOffset(direction);
  const bounceClass = status === "playing" || status === "moving" ? "animate-bounce" : "";
  const legOffset = status === "moving" ? animationFrame === 0 ? 0 : 1 : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 16 16",
      className: `${bounceClass} ${className}`,
      style: { width: size, height: size },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "3", width: "10", height: "10", rx: "2", ry: "2", fill: bodyColor }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "4", width: "8", height: "8", fill: bodyColor }),
        status === "moving" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: 11 + legOffset, width: "2", height: "2", fill: "var(--color-cozy-border)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: 11 + (1 - legOffset), width: "2", height: "2", fill: "var(--color-cozy-border)" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "11", width: "8", height: "2", fill: "var(--color-cozy-border)" }),
        status === "playing" && /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "13", y: animationFrame === 0 ? "4" : "6", width: "2", height: "2", fill: bodyColor }),
        isSleeping && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "11", y: "1", width: "2", height: "2", fill: "var(--color-cozy-border)", opacity: "0.6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "12", y: "3", width: "2", height: "1", fill: "var(--color-cozy-border)", opacity: "0.4" })
        ] }),
        !isSleeping ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: 5 + ex, y: 6 + ey, width: "2", height: "2", fill: "#FFFFFF", rx: "0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: 5.5 + ex, y: 6.5 + ey, width: "1", height: "1", fill: "#000000" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: 9 + ex, y: 6 + ey, width: "2", height: "2", fill: "#FFFFFF", rx: "0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: 9.5 + ex, y: 6.5 + ey, width: "1", height: "1", fill: "#000000" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "7", width: "3", height: "1", fill: "var(--color-cozy-border)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "7", width: "3", height: "1", fill: "var(--color-cozy-border)" })
        ] }),
        !isSleeping && status !== "eating" && /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "9", width: "4", height: "1", fill: "var(--color-cozy-border)" }),
        !isSleeping && status === "eating" && /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "9", width: "2", height: "2", fill: "var(--color-cozy-border)" }),
        status === "playing" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "8", width: "1.5", height: "1", fill: "#FF8888", opacity: "0.5", rx: "0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "11.5", y: "8", width: "1.5", height: "1", fill: "#FF8888", opacity: "0.5", rx: "0.5" })
        ] })
      ]
    }
  );
}

const React$1 = await importShared('react');
const {useEffect: useEffect$2} = React$1;
function Board() {
  const board = useSokobanStore((state) => state.board);
  const player = useSokobanStore((state) => state.player);
  const boxes = useSokobanStore((state) => state.boxes);
  const deadlockedBoxIds = useSokobanStore((state) => state.deadlockedBoxIds);
  const lastDirection = useSokobanStore((state) => state.lastDirection);
  const isMoving = useSokobanStore((state) => state.isMoving);
  const [animFrame, setAnimFrame] = React$1.useState(0);
  useEffect$2(() => {
    const timer = setInterval(() => setAnimFrame((f) => (f + 1) % 2), 400);
    return () => clearInterval(timer);
  }, []);
  if (board.length === 0) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-cozy-text p-4 text-[10px]", children: "LOADING BOARD..." });
  const rows = board.length;
  const cols = board[0].length;
  const tileWidthPercent = 100 / cols;
  const tileHeightPercent = 100 / rows;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative w-full border border-[#FFB000] bg-[#0a0a0a] select-none overflow-hidden rounded-sm",
      style: { aspectRatio: `${cols} / ${rows}` },
      children: [
        board.map(
          (row, y) => row.map((cell, x) => {
            if (cell === TileType.EMPTY) return null;
            const isTarget = cell === TileType.TARGET;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "absolute",
                style: {
                  left: `${x * tileWidthPercent}%`,
                  top: `${y * tileHeightPercent}%`,
                  width: `${tileWidthPercent}%`,
                  height: `${tileHeightPercent}%`
                },
                children: [
                  cell === TileType.WALL && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-[#1a1200] border border-[#FFB000]/40 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1/2 h-1/2 border border-[#FFB000]/20 rotate-45" }) }),
                  cell === TileType.FLOOR && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-[#0a0a0a] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-[1px] h-[1px] bg-[#FFB000]/10 rounded-full" }) }),
                  isTarget && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full bg-[#0a0a0a] flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: "w-2/5 h-2/5 rounded-full border border-[#FFB000]/70 bg-[#FFB000]/10",
                      style: {
                        animation: "targetPulse 1.5s ease-in-out infinite",
                        boxShadow: "0 0 6px rgba(255, 176, 0, 0.2)"
                      }
                    }
                  ) })
                ]
              },
              `tile-${x}-${y}`
            );
          })
        ),
        boxes.map((box) => {
          const isOnTarget = board[box.y]?.[box.x] === TileType.TARGET;
          const isDeadlocked = deadlockedBoxIds.includes(box.id);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "absolute p-[1.5px] z-10",
              style: {
                left: `${box.x * tileWidthPercent}%`,
                top: `${box.y * tileHeightPercent}%`,
                width: `${tileWidthPercent}%`,
                height: `${tileHeightPercent}%`,
                transition: "left 100ms ease-out, top 100ms ease-out"
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `w-full h-full flex items-center justify-center font-press text-[7px] relative
                ${isOnTarget ? "bg-[#805800] text-black border border-[#FFB000]/80" : "bg-[#1a1400] text-[#FFB000] border border-[#FFB000]/50"}
                ${isDeadlocked ? "opacity-50 border-dashed" : ""}
              `,
                  style: {
                    clipPath: "polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)"
                  },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-[3px] border border-[#FFB000]/20 pointer-events-none" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 top-1/4 w-[1px] h-1/2 bg-[#FFB000]/20 -translate-x-1/2" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/2 left-1/4 h-[1px] w-1/2 bg-[#FFB000]/20 -translate-y-1/2" }),
                    isDeadlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-0.5 -right-0.5 bg-[#FF4444] text-black text-[5px] w-2.5 h-2.5 flex items-center justify-center rounded-full font-bold leading-none", style: { fontSize: "5px" }, children: "!" })
                  ]
                }
              )
            },
            box.id
          );
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "absolute z-20",
            style: {
              left: `${player.x * tileWidthPercent}%`,
              top: `${player.y * tileHeightPercent}%`,
              width: `${tileWidthPercent}%`,
              height: `${tileHeightPercent}%`,
              transition: "left 80ms ease-out, top 80ms ease-out"
            },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              PetSprite,
              {
                size: Math.min(tileWidthPercent * cols / 100 * 16, 16),
                status: isMoving ? "moving" : "idle",
                direction: lastDirection,
                animationFrame: animFrame,
                className: "drop-shadow-[0_0_4px_rgba(255,176,0,0.3)]"
              }
            ) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes targetPulse {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      ` })
      ]
    }
  );
}

function LevelSelect({ onSelect }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-4 text-cozy-text font-mono", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-press text-[12px] text-center my-2", children: "SELECT LEVEL" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-3 max-h-[300px] overflow-y-auto p-2", children: SOKOBAN_LEVELS.map((level, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => onSelect(idx),
        className: "w-10 h-10 border border-cozy-border flex items-center justify-center font-press text-[11px] bg-black text-cozy-text cursor-pointer hover:bg-cozy-text hover:text-black hover:scale-105 active:translate-y-0.5 transition-colors",
        "aria-label": `Select level ${idx + 1}`,
        children: idx + 1
      },
      level.id
    )) })
  ] });
}

const {useEffect: useEffect$1,useRef} = await importShared('react');
function Controls() {
  const move = useSokobanStore((state) => state.move);
  const isWon = useSokobanStore((state) => state.isWon);
  const touchStart = useRef(null);
  useEffect$1(() => {
    const handleKeyDown = (e) => {
      if (isWon) return;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          move(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          move(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          move(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          move(1, 0);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move, isWon]);
  useEffect$1(() => {
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        touchStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };
    const handleTouchEnd = (e) => {
      if (!touchStart.current || e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const minSwipeDistance = 30;
      if (Math.max(absX, absY) > minSwipeDistance) {
        if (absX > absY) {
          move(dx > 0 ? 1 : -1, 0);
        } else {
          move(0, dy > 0 ? 1 : -1);
        }
      }
      touchStart.current = null;
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [move]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex flex-col items-center select-none font-press text-[8px] text-cozy-text mt-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-1.5 w-28 h-28 my-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => move(0, -1),
          className: "pixel-btn flex items-center justify-center text-[10px]",
          "aria-label": "Move Up",
          children: "▲"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => move(-1, 0),
          className: "pixel-btn flex items-center justify-center text-[10px]",
          "aria-label": "Move Left",
          children: "◀"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-cozy-border border border-cozy-border opacity-10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => move(1, 0),
          className: "pixel-btn flex items-center justify-center text-[10px]",
          "aria-label": "Move Right",
          children: "▶"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => move(0, 1),
          className: "pixel-btn flex items-center justify-center text-[10px]",
          "aria-label": "Move Down",
          children: "▼"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[6.5px] opacity-75 mt-1 text-center", children: "SWIPE GRID OR TAP KEYS / ARROWS TO NAVIGATE" })
  ] });
}

const React = await importShared('react');
const {useEffect} = React;
function WinModal({ onBack }) {
  const isWon = useSokobanStore((state) => state.isWon);
  const nextLevel = useSokobanStore((state) => state.nextLevel);
  const moves = useSokobanStore((state) => state.moves);
  useEffect(() => {
    if (isWon) {
      synth.playWin();
    }
  }, [isWon]);
  if (!isWon) return /* @__PURE__ */ jsxRuntimeExports.jsx(React.Fragment, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 select-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-[#FFB000] bg-[#050505] p-6 max-w-xs w-full text-center flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-press text-[14px] text-cozy-text animate-bounce", children: "STAGE CLEAR!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-sm text-cozy-text", children: [
      "Finished in ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold font-press text-[11px] text-cozy-text", children: moves }),
      " movements."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: nextLevel,
          className: "pixel-btn text-[10px] text-cozy-text",
          "aria-label": "Next stage",
          children: "NEXT >"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: onBack,
          className: "pixel-btn text-[10px] text-cozy-text/70",
          "aria-label": "Main menu",
          children: "MENU"
        }
      )
    ] })
  ] }) });
}

const {useState} = await importShared('react');
function SokobanApp() {
  const [view, setView] = useState("menu");
  const loadLevel = useSokobanStore((state) => state.loadLevel);
  const handleSelectLevel = (idx) => {
    loadLevel(idx);
    setView("game");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-[450px] border border-cozy-border bg-black p-4 select-none relative flex flex-col items-center text-cozy-text", children: view === "menu" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LevelSelect, { onSelect: handleSelectLevel }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 items-center w-full relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(HUD, { onBack: () => setView("menu") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Board, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Controls, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WinModal, { onBack: () => setView("menu") })
  ] }) });
}

export { SokobanApp as default, jsxRuntimeExports as j };
