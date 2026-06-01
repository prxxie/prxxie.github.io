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

const EVOLUTION_THRESHOLDS = [0, 10, 30, 60, 100];
function getEvolutionStage(xp) {
  let stage = 1;
  for (let i = 1; i < EVOLUTION_THRESHOLDS.length; i++) {
    if (xp >= EVOLUTION_THRESHOLDS[i]) stage = i + 1;
  }
  return stage;
}

const STORAGE_KEY = "cozyos.progress.v1";
function initialState() {
  return {
    completedLevels: [],
    foodConsumed: 0,
    pet: {
      xp: 0,
      stage: 1,
      lastFedAt: 0,
      happiness: 50,
      lastPlayedAt: Date.now(),
      isSleeping: false
    }
  };
}
class LocalProgressRepository {
  async getState() {
    await Promise.resolve();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialState();
      const data = JSON.parse(raw);
      if (data.version !== 1) return initialState();
      const state = data.state;
      if (state.pet.happiness === void 0) state.pet.happiness = 50;
      if (state.pet.lastPlayedAt === void 0) state.pet.lastPlayedAt = Date.now();
      if (state.pet.isSleeping === void 0) state.pet.isSleeping = false;
      return state;
    } catch {
      return initialState();
    }
  }
  async saveState(state) {
    await Promise.resolve();
    const data = { version: 1, state };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      throw new Error(`Failed to save progress: ${String(err)}`);
    }
  }
  async completeLevel(module, levelId) {
    return this.completeLevelWithStars(module, levelId, 1);
  }
  async completeLevelWithStars(module, levelId, stars) {
    const state = await this.getState();
    const existing = state.completedLevels.find(
      (l) => l.module === module && l.levelId === levelId
    );
    if (existing) {
      if (stars <= existing.stars) return false;
      await this.saveState({
        ...state,
        completedLevels: state.completedLevels.map(
          (l) => l.module === module && l.levelId === levelId ? { ...l, stars, completedAt: Date.now() } : l
        )
      });
      return true;
    }
    await this.saveState({
      ...state,
      completedLevels: [
        ...state.completedLevels,
        { module, levelId, stars, completedAt: Date.now() }
      ]
    });
    return true;
  }
  async feedPet(lastPlayedAt) {
    const state = await this.getState();
    const newXp = state.pet.xp + 1;
    await this.saveState({
      ...state,
      foodConsumed: state.foodConsumed + 1,
      pet: {
        ...state.pet,
        xp: newXp,
        stage: getEvolutionStage(newXp),
        lastFedAt: Date.now(),
        isSleeping: false,
        // Auto-wakes up when fed
        lastPlayedAt: lastPlayedAt !== void 0 ? lastPlayedAt : state.pet.lastPlayedAt
      }
    });
  }
  async playWithPet(happiness) {
    const state = await this.getState();
    await this.saveState({
      ...state,
      pet: {
        ...state.pet,
        happiness,
        lastPlayedAt: Date.now()
      }
    });
  }
  async toggleSleep(lastFedAt, lastPlayedAt) {
    const state = await this.getState();
    await this.saveState({
      ...state,
      pet: {
        ...state.pet,
        isSleeping: !state.pet.isSleeping,
        lastFedAt: lastFedAt !== void 0 ? lastFedAt : state.pet.lastFedAt,
        lastPlayedAt: lastPlayedAt !== void 0 ? lastPlayedAt : state.pet.lastPlayedAt
      }
    });
  }
}

const HUNGER_COOLDOWN = 10 * 60 * 1e3;
const HAPPINESS_COOLDOWN = 10 * 60 * 1e3;
class ProgressService {
  constructor(repo) {
    this.repo = repo;
  }
  async getState() {
    return this.repo.getState();
  }
  async completeLevel(module, levelId) {
    const result = await this.repo.completeLevel(module, levelId);
    if (result && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
    return result;
  }
  async completeLevelWithStars(module, levelId, stars) {
    const result = await this.repo.completeLevelWithStars(module, levelId, stars);
    if (result && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
    return result;
  }
  async feedPet() {
    const state = await this.repo.getState();
    const isHungry = await this.isPetHungry();
    const foodAvailable = await this.getFoodAvailable();
    if (!isHungry || foodAvailable <= 0) return;
    let nextLastPlayedAt;
    if (state.pet.isSleeping && state.pet.lastPlayedAt !== 0) {
      const elapsed = Math.max(0, Date.now() - state.pet.lastPlayedAt);
      const oldHappinessDivisor = HAPPINESS_COOLDOWN * 4;
      const newElapsed = elapsed * (HAPPINESS_COOLDOWN / oldHappinessDivisor);
      nextLastPlayedAt = Date.now() - newElapsed;
    }
    await this.repo.feedPet(nextLastPlayedAt);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
  }
  async playWithPet() {
    const state = await this.repo.getState();
    if (state.pet.isSleeping) return;
    const currentHappiness = await this.getHappiness();
    const newHappiness = Math.min(100, currentHappiness + 20);
    await this.repo.playWithPet(newHappiness);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
  }
  async toggleSleep() {
    const state = await this.repo.getState();
    const oldHungerDivisor = state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
    const newHungerDivisor = !state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
    const elapsedHunger = Math.max(0, Date.now() - state.pet.lastFedAt);
    const newElapsedHunger = elapsedHunger * (newHungerDivisor / oldHungerDivisor);
    const lastFedAt = state.pet.lastFedAt !== 0 ? Date.now() - newElapsedHunger : 0;
    const oldHappinessDivisor = state.pet.isSleeping ? HAPPINESS_COOLDOWN * 4 : HAPPINESS_COOLDOWN;
    const newHappinessDivisor = !state.pet.isSleeping ? HAPPINESS_COOLDOWN * 4 : HAPPINESS_COOLDOWN;
    const elapsedHappiness = Math.max(0, Date.now() - state.pet.lastPlayedAt);
    const newElapsedHappiness = elapsedHappiness * (newHappinessDivisor / oldHappinessDivisor);
    const lastPlayedAt = state.pet.lastPlayedAt !== 0 ? Date.now() - newElapsedHappiness : 0;
    await this.repo.toggleSleep(lastFedAt, lastPlayedAt);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
  }
  async getFoodAvailable() {
    const state = await this.repo.getState();
    const totalStars = state.completedLevels.reduce(
      (sum, l) => sum + (l.stars ?? 1),
      0
    );
    return Math.max(0, totalStars - state.foodConsumed);
  }
  async isPetHungry() {
    const level = await this.getHungryLevel();
    return level >= 1;
  }
  async getHungryLevel() {
    const state = await this.repo.getState();
    if (state.pet.lastFedAt === 0) return 6;
    const elapsed = Math.max(0, Date.now() - state.pet.lastFedAt);
    const divisor = state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
    return Math.min(6, Math.floor(elapsed / divisor));
  }
  async getHappiness() {
    const state = await this.repo.getState();
    if (state.pet.lastPlayedAt === 0) return state.pet.happiness;
    const elapsed = Math.max(0, Date.now() - state.pet.lastPlayedAt);
    const divisor = state.pet.isSleeping ? HAPPINESS_COOLDOWN * 4 : HAPPINESS_COOLDOWN;
    const decay = Math.floor(elapsed / divisor) * 5;
    return Math.max(0, state.pet.happiness - decay);
  }
  async getPetStage() {
    const state = await this.repo.getState();
    return state.pet.stage;
  }
}

var TileType = /* @__PURE__ */ ((TileType2) => {
  TileType2[TileType2["EMPTY"] = 0] = "EMPTY";
  TileType2[TileType2["WALL"] = 1] = "WALL";
  TileType2[TileType2["FLOOR"] = 2] = "FLOOR";
  TileType2[TileType2["TARGET"] = 3] = "TARGET";
  return TileType2;
})(TileType || {});

const SOKOBAN_LEVELS = [
  {
    "id": "hack-01",
    "name": "Hello World",
    grid: [
      "#######",
      "#     #",
      "# .$. #",
      "# $.$ #",
      "#  @  #",
      "#######"
    ],
    targets: { threeStars: 24, twoStars: 42 }
  },
  {
    "id": "hack-02",
    "name": "Null Pointer",
    grid: [
      "########",
      "#   .  #",
      "# $ $ .#",
      "#  ##$ #",
      "#  $. .#",
      "#   @  #",
      "#      #",
      "########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-03",
    "name": "Syntax Error",
    grid: [
      " #######",
      "##  .  #",
      "#  $#$ #",
      "# $.   #",
      "#  #.  #",
      "##  @ ##",
      " ######"
    ],
    targets: { threeStars: 24, twoStars: 42 }
  },
  {
    "id": "hack-04",
    "name": "First Commit",
    grid: [
      "########",
      "#   .  #",
      "#  $## #",
      "#  $   #",
      "## ##.##",
      "#   $  #",
      "#  .@ ##",
      "########"
    ],
    targets: { threeStars: 24, twoStars: 42 }
  },
  {
    "id": "hack-05",
    "name": "Console Log",
    grid: [
      "#########",
      "#  .    #",
      "# $#$#  #",
      "#  . .  #",
      "# #$#   #",
      "#   . $ #",
      "#    @  #",
      "#########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-06",
    "name": "Stack Overflow",
    grid: [
      " ########",
      "##  .   #",
      "#  $#$ .#",
      "# # $ . #",
      "#  $ .  #",
      "## ##  ##",
      "#    @  #",
      "########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-07",
    "name": "Infinite Loop",
    grid: [
      "##########",
      "#    .   #",
      "# ## ##  #",
      "#  $ . $ #",
      "## # # ##",
      "#  $.#   #",
      "#   @    #",
      "##########"
    ],
    targets: { threeStars: 24, twoStars: 42 }
  },
  {
    "id": "hack-08",
    "name": "Race Condition",
    grid: [
      " #########",
      "##   .   #",
      "#  # #$# #",
      "# $.   . #",
      "#  #$#   #",
      "##  .  $ #",
      " #   @  ##",
      " ########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-09",
    "name": "Memory Leak",
    grid: [
      "##########",
      "#   . .  #",
      "# # #$## #",
      "#  $  .  #",
      "## ##$#  #",
      "#  . $   #",
      "#   @   ##",
      "##########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-10",
    "name": "Buffer Overflow",
    grid: [
      " ##########",
      "##  .  .  #",
      "#  $ #$## #",
      "# #  .    #",
      "#  $ #$   #",
      "## # .  ###",
      " #   @  #",
      " ########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-11",
    "name": "Segmentation Fault",
    grid: [
      "###########",
      "#    .    #",
      "# ## ## # #",
      "#  $.  .  #",
      "## #$##   #",
      "#  $  . $ #",
      "# ##  #  ##",
      "#    @    #",
      "###########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-12",
    "name": "Heap Fragmentation",
    grid: [
      " ##########",
      "##  .  .  #",
      "#    # ## #",
      "# #  . #  #",
      "#  $ #$   #",
      "## # . $  #",
      "#   $  # ##",
      "#   @    #",
      "##########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-13",
    "name": "Deadlock",
    grid: [
      "###########",
      "#  .   .  #",
      "#  ##$##$ #",
      "#  .   .  #",
      "## $ $ $  #",
      "#    .##  #",
      "#    @    #",
      "###########"
    ],
    targets: { threeStars: 40, twoStars: 70 }
  },
  {
    "id": "hack-14",
    "name": "Thread Starvation",
    grid: [
      " ###########",
      "##   .  .  #",
      "#  # ##$## #",
      "# $  .     #",
      "## ##$  $  #",
      "#  .    # ##",
      "#  $  .   #",
      "##   @   ##",
      " #########"
    ],
    targets: { threeStars: 40, twoStars: 70 }
  },
  {
    "id": "hack-15",
    "name": "Cache Miss",
    grid: [
      "############",
      "#   .   .  #",
      "# # ## ##  #",
      "#  $  .    #",
      "## ##$##   #",
      "#  .   . $ #",
      "# $  $  #  #",
      "#    @     #",
      "############"
    ],
    targets: { threeStars: 40, twoStars: 70 }
  },
  {
    "id": "hack-16",
    "name": "SQL Injection",
    grid: [
      "############",
      "#  .    .  #",
      "#  ## ##$# #",
      "#  . ## .  #",
      "## $    $  #",
      "#  ##$##   #",
      "# $.  . $  #",
      "#  #  #   ##",
      "#    @     #",
      "############"
    ],
    targets: { threeStars: 48, twoStars: 84 }
  },
  {
    "id": "hack-17",
    "name": "XSS Attack",
    grid: [
      " ############",
      "##  .   .   #",
      "#    # ## # #",
      "# #  . #    #",
      "#  $ #$  $  #",
      "## # . ##   #",
      "#  $  . $ ###",
      "#  #  #  @#",
      "###########"
    ],
    targets: { threeStars: 40, twoStars: 70 }
  },
  {
    "id": "hack-18",
    "name": "CSRF Token",
    grid: [
      "#############",
      "#   .    .  #",
      "# # ## ##   #",
      "#     . # $ #",
      "## ##$##    #",
      "#  .   . $  #",
      "# $  $  ##  #",
      "#  #  #  @ ##",
      "#############"
    ],
    targets: { threeStars: 40, twoStars: 70 }
  },
  {
    "id": "hack-19",
    "name": "Man in the Middle",
    grid: [
      "##############",
      "#   .     .  #",
      "# # ## ## ## #",
      "#     . #    #",
      "## ##$##  #  #",
      "#  .   . $   #",
      "# $  $  ##$  #",
      "#  #  #   @ ##",
      "##############"
    ],
    targets: { threeStars: 40, twoStars: 70 }
  },
  {
    "id": "hack-20",
    "name": "Zero Day",
    grid: [
      "##############",
      "#  .      .  #",
      "#  ## ## ##  #",
      "#  . ## . #  #",
      "## $    $    #",
      "#  ##$##  $  #",
      "# $.  . $ #  #",
      "#  #  #  #  ##",
      "#     @      #",
      "##############"
    ],
    targets: { threeStars: 48, twoStars: 84 }
  },
  {
    "id": "hack-21",
    "name": "Kernel Panic",
    grid: [
      "###############",
      "#   .      .  #",
      "# # ## ## ##  #",
      "#     . # .   #",
      "## ##$##  ##  #",
      "#  .   . $  $ #",
      "# $  $  ##$   #",
      "#  #  #  # # ##",
      "#     @       #",
      "###############"
    ],
    targets: { threeStars: 48, twoStars: 84 }
  },
  {
    "id": "hack-22",
    "name": "Privilege Escalation",
    grid: [
      "###############",
      "#  .       .  #",
      "#  ## ## ## # #",
      "#  . ## . #   #",
      "##      $  #  #",
      "#  ##$##  $ $ #",
      "# $.  . $ ##  #",
      "#  #  #  #  ###",
      "#     @      #",
      "##############"
    ],
    targets: { threeStars: 48, twoStars: 84 }
  },
  {
    "id": "hack-23",
    "name": "Side Channel",
    grid: [
      "################",
      "#   .       .  #",
      "# # ## ## ##   #",
      "#     . # .  # #",
      "## ## ##  ##   #",
      "#  . # . $  $  #",
      "# $  $  ##$  $ #",
      "#  #  #  # #   #",
      "#     @       ##",
      "################"
    ],
    targets: { threeStars: 48, twoStars: 84 }
  },
  {
    "id": "hack-24",
    "name": "Timing Attack",
    grid: [
      "################",
      "#  .        .  #",
      "#  ## ## ## ## #",
      "#  . ## . # .  #",
      "##      $  # $ #",
      "#  ##$##  $  $ #",
      "# $.  . $ ##   #",
      "#  #  #  #  # ##",
      "#     @        #",
      "################"
    ],
    targets: { threeStars: 56, twoStars: 98 }
  },
  {
    "id": "hack-25",
    "name": "Spectre",
    grid: [
      "#################",
      "#   .        .  #",
      "# # ## ## ## #  #",
      "#     . # .   # #",
      "## ## ##  ##    #",
      "#  . # .      $ #",
      "# $  $  ##$ $ $ #",
      "#  #  #  # #  ###",
      "#     @         #",
      "#################"
    ],
    targets: { threeStars: 48, twoStars: 84 }
  },
  {
    "id": "hack-26",
    "name": "Ransomware",
    grid: [
      "#################",
      "#  .         .  #",
      "#  ## ## ## ##  #",
      "#  . ## . # .   #",
      "##         #    #",
      "#  ## ##  $ $ $ #",
      "# $.  . $ ##$ $ #",
      "#  #  #  #      #",
      "#     @        ##",
      "#################"
    ],
    targets: { threeStars: 56, twoStars: 98 }
  },
  {
    "id": "hack-27",
    "name": "Rootkit",
    grid: [
      "##################",
      "#   .         .  #",
      "# # ## ## ## ##  #",
      "#     . # .    # #",
      "## ## ##  ##     #",
      "#  . # .      $  #",
      "# $  $  ##$ $ $  #",
      "#  #  #  # # #  ##",
      "#     @          #",
      "##################"
    ],
    targets: { threeStars: 48, twoStars: 84 }
  },
  {
    "id": "hack-28",
    "name": "Cryptanalysis",
    grid: [
      "##################",
      "#  .          .  #",
      "#  ## ## ## ## # #",
      "#  . ## . # .    #",
      "##         #     #",
      "#  ## ##  $ $ $  #",
      "# $.  . $ ##$ $  #",
      "#  #  #  #      ##",
      "#     @          #",
      "##################"
    ],
    targets: { threeStars: 56, twoStars: 98 }
  },
  {
    "id": "hack-29",
    "name": "Quantum Entanglement",
    grid: [
      "###################",
      "#   .          .  #",
      "# # ## ## ## ##   #",
      "#     . # .     # #",
      "## ## ##  ##      #",
      "#  . # .          #",
      "# $  $  ##$ $ $ $ #",
      "#  #  #  # # #   ##",
      "#     @           #",
      "###################"
    ],
    targets: { threeStars: 48, twoStars: 84 }
  },
  {
    "id": "hack-30",
    "name": "Singularity",
    grid: [
      "###################",
      "#  .           .  #",
      "#  ## ## ## ## ## #",
      "#  . ## . # .     #",
      "##         #      #",
      "#  ## ##      $ $ #",
      "# $.  . $ ##$ $ $ #",
      "#  #  #  #        #",
      "#     @          ##",
      "###################"
    ],
    targets: { threeStars: 56, twoStars: 98 }
  },
  {
    "id": "hack-31",
    "name": "Port Scan",
    grid: [
      "########",
      "#  .   #",
      "# $##$ #",
      "#  .   #",
      "# $#$. #",
      "#   .  #",
      "#  @   #",
      "########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-32",
    "name": "Firewall Rule",
    grid: [
      "#########",
      "#  . .  #",
      "# $##$  #",
      "#  .    #",
      "##$  $  #",
      "#  .  @ #",
      "#########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-33",
    "name": "VPN Tunnel",
    grid: [
      "##########",
      "#   .    #",
      "# # ## # #",
      "#  $  $  #",
      "## .. ## #",
      "#  $     #",
      "#   @    #",
      "##########"
    ],
    targets: { threeStars: 24, twoStars: 42 }
  },
  {
    "id": "hack-34",
    "name": "DNS Spoofing",
    grid: [
      "##########",
      "# .  .   #",
      "#  $  $  #",
      "## ## ## #",
      "#  $  $  #",
      "# .  .   #",
      "#   @    #",
      "##########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-35",
    "name": "Fuzzing",
    grid: [
      "###########",
      "#  .   .  #",
      "#  $#$ #  #",
      "## .   .  #",
      "#  $#$##  #",
      "#       @ #",
      "###########"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-36",
    "name": "Reverse Shell",
    grid: [
      "###########",
      "#   .  .  #",
      "# # ## ## #",
      "#  $   $  #",
      "##  # ##  #",
      "#  . $    #",
      "#   @     #",
      "###########"
    ],
    targets: { threeStars: 24, twoStars: 42 }
  },
  {
    "id": "hack-37",
    "name": "Payload Drop",
    grid: [
      "############",
      "#   .   .  #",
      "# # ## ##  #",
      "#   $  $ # #",
      "##  # ## . #",
      "#  $  . $  #",
      "#   @   #  #",
      "############"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-38",
    "name": "Botnet",
    grid: [
      "############",
      "#  .    .  #",
      "#  ## ##   #",
      "#  .  . #  #",
      "## $##$  $ #",
      "#       $  #",
      "#  #  #  @ #",
      "############"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-39",
    "name": "Phishing Hook",
    grid: [
      "#############",
      "#   .    .  #",
      "# # ## ## # #",
      "#   $   $   #",
      "## ## ## #  #",
      "#  . $  . $ #",
      "#   @    #  #",
      "#############"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-40",
    "name": "Social Engineering",
    grid: [
      "#############",
      "#  .     .  #",
      "#  ## ## #  #",
      "#  . # . #  #",
      "##  $  $  $ #",
      "#  ##.##  $ #",
      "# $.    $ # #",
      "#  #  #   @ #",
      "#############"
    ],
    targets: { threeStars: 48, twoStars: 84 }
  },
  {
    "id": "hack-41",
    "name": "Stack Smashing",
    grid: [
      "##############",
      "#   .     .  #",
      "# # ## ## #  #",
      "#   $   $  # #",
      "## ##  ##    #",
      "#  . $  . $  #",
      "#   @    #  ##",
      "##############"
    ],
    targets: { threeStars: 32, twoStars: 56 }
  },
  {
    "id": "hack-42",
    "name": "Heap Spray",
    grid: [
      "##############",
      "#  .      .  #",
      "#  ## ## ##  #",
      "#  . # . # $ #",
      "##  $  $  #  #",
      "#  ##.##  $  #",
      "# $.    $ ## #",
      "#  #  #   @  #",
      "##############"
    ],
    targets: { threeStars: 48, twoStars: 84 }
  },
  {
    "id": "hack-43",
    "name": "Return Oriented",
    grid: [
      "###############",
      "#   .      .  #",
      "# # ## ## ##  #",
      "#   $   $   # #",
      "## ## ## ##   #",
      "#  . $  . $   #",
      "#   @    #   ##",
      "###############"
    ],
    targets: { threeStars: 40, twoStars: 70 }
  },
  {
    "id": "hack-44",
    "name": "Format String",
    grid: [
      "###############",
      "#  .       .  #",
      "#  ## ## ## # #",
      "#  . # . # $  #",
      "##  $  $  # $ #",
      "#  ##.##  $   #",
      "# $.      ##  #",
      "#  #  #    @  #",
      "###############"
    ],
    targets: { threeStars: 56, twoStars: 98 }
  },
  {
    "id": "hack-45",
    "name": "Shellcode",
    grid: [
      "################",
      "#   .       .  #",
      "# # ## ## ##   #",
      "#   $   $    # #",
      "## ## ## ## .  #",
      "#  . $  . $ $  #",
      "#   @    #  #  #",
      "################"
    ],
    targets: { threeStars: 40, twoStars: 70 }
  },
  {
    "id": "hack-46",
    "name": "NOP Sled",
    grid: [
      "################",
      "#  .        .  #",
      "#  ## ## ## ## #",
      "#  . # . # $   #",
      "##  $  $  # $  #",
      "#  ##.##  $ $  #",
      "#  .      ##   #",
      "#  #  #    @  ##",
      "################"
    ],
    targets: { threeStars: 64, twoStars: 112 }
  },
  {
    "id": "hack-47",
    "name": "Canary Bypass",
    grid: [
      "#################",
      "#   .        .  #",
      "# # ## ## ## #  #",
      "#   $   $      ##",
      "## ## ## ## ##  #",
      "#  . $  . $     #",
      "#   @    #  #  ##",
      "#################"
    ],
    targets: { threeStars: 40, twoStars: 70 }
  },
  {
    "id": "hack-48",
    "name": "ASLR Defeat",
    grid: [
      "#################",
      "#  .         .  #",
      "#  ## ## ## ##  #",
      "#  . # . # $ #  #",
      "##  $  $  # $   #",
      "#  ##.##  $ $   #",
      "#  .      ## #  #",
      "#  #  #     @  ##",
      "#################"
    ],
    targets: { threeStars: 72, twoStars: 126 }
  },
  {
    "id": "hack-49",
    "name": "Sandbox Escape",
    grid: [
      "##################",
      "#   .          .  #",
      "# # ## ## ## ##   #",
      "#   $   $       # #",
      "## ## ## ## ## .  #",
      "#  . $  . $ $     #",
      "#   @    #  # #  ##",
      "##################"
    ],
    targets: { threeStars: 48, twoStars: 84 }
  },
  {
    "id": "hack-50",
    "name": "Kernel Exploit",
    grid: [
      "##################",
      "#  .           .  #",
      "#  ## ## ## ## ## #",
      "#  . # . # $ # $  #",
      "##  $  $  # $  $  #",
      "#  ##.##          #",
      "#  .      ## ##   #",
      "#  #  #      @  ###",
      "##################"
    ],
    targets: { threeStars: 88, twoStars: 154 }
  },
  {
    "id": "hack-51",
    "name": "Binary Diffing",
    grid: [
      "########",
      "#  .   #",
      "# $#.  #",
      "#  $   #",
      "## ##  #",
      "#  .@$ #",
      "########"
    ],
    targets: { threeStars: 30, twoStars: 54 }
  },
  {
    "id": "hack-52",
    "name": "Disassembly",
    grid: [
      "#########",
      "#  .    #",
      "#  $##. #",
      "##      #",
      "#  $  . #",
      "#  # $  #",
      "#    @  #",
      "#########"
    ],
    targets: { threeStars: 30, twoStars: 54 }
  },
  {
    "id": "hack-53",
    "name": "Decompiler",
    grid: [
      "##########",
      "#   .    #",
      "# #.##.  #",
      "#  $  $  #",
      "##  # #  #",
      "#  $     #",
      "#    @   #",
      "##########"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-54",
    "name": "Symbol Table",
    grid: [
      "##########",
      "#  .  .  #",
      "#  ## #  #",
      "#  $  $  #",
      "## .  .  #",
      "#  $##$  #",
      "#    @   #",
      "##########"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-55",
    "name": "Entropy Analysis",
    grid: [
      "###########",
      "#   .  .  #",
      "# # #. ## #",
      "#  $   $  #",
      "## .   ##  #",
      "#  $#$    #",
      "#    @    #",
      "###########"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-56",
    "name": "Obfuscation",
    grid: [
      "###########",
      "#  .   .  #",
      "#  ## #.  #",
      "#  $  $   #",
      "## .    # #",
      "#  $#$#   #",
      "#    @    #",
      "###########"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-57",
    "name": "Packing",
    grid: [
      "############",
      "#   .   .  #",
      "# # ## ##  #",
      "#  . $  .  #",
      "## $##$##  #",
      "#       $  #",
      "#   @   #  #",
      "############"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-58",
    "name": "Anti-Debug",
    grid: [
      "############",
      "#  .    .  #",
      "#  ## ## # #",
      "#  $  $    #",
      "## .  . #  #",
      "#  $##$    #",
      "#    @  #  #",
      "############"
    ],
    targets: { threeStars: 50, twoStars: 90 }
  },
  {
    "id": "hack-59",
    "name": "Code Cave",
    grid: [
      "#############",
      "#   .    .  #",
      "# # ## ##   #",
      "#   $   $   #",
      "## .  . ##  #",
      "#  $##$     #",
      "#    @   #  #",
      "#############"
    ],
    targets: { threeStars: 50, twoStars: 90 }
  },
  {
    "id": "hack-60",
    "name": "API Hooking",
    grid: [
      "#############",
      "#  .     .  #",
      "#  ## ## ## #",
      "#  $  $ #   #",
      "## .  . # $ #",
      "#  $##      #",
      "#     #  @  #",
      "#############"
    ],
    targets: { threeStars: 60, twoStars: 108 }
  },
  {
    "id": "hack-61",
    "name": "Patch Tuesday",
    grid: [
      "##############",
      "#   .     .  #",
      "# # ## ## #  #",
      "#   $   $  # #",
      "## .  . ##   #",
      "#  $##$      #",
      "#    @   ##  #",
      "##############"
    ],
    targets: { threeStars: 60, twoStars: 108 }
  },
  {
    "id": "hack-62",
    "name": "CVE Report",
    grid: [
      "##############",
      "#  .      .  #",
      "#  ## ## ##  #",
      "#  $  $  # $ #",
      "## .  . ##   #",
      "#  $##       #",
      "#     #   @  #",
      "##############"
    ],
    targets: { threeStars: 70, twoStars: 126 }
  },
  {
    "id": "hack-63",
    "name": "Metasploit",
    grid: [
      "###############",
      "#   .      .  #",
      "# # ## ## ##  #",
      "#   $   $   # #",
      "## .  . ## .  #",
      "#  $##$  $    #",
      "#    @   ##   #",
      "###############"
    ],
    targets: { threeStars: 60, twoStars: 108 }
  },
  {
    "id": "hack-64",
    "name": "Nmap Sweep",
    grid: [
      "###############",
      "#  .       .  #",
      "#  ## ## ## # #",
      "#  $  $  # $  #",
      "## .  . ##  $ #",
      "#   ##        #",
      "#  #  #    @  #",
      "###############"
    ],
    targets: { threeStars: 80, twoStars: 144 }
  },
  {
    "id": "hack-65",
    "name": "Wireshark",
    grid: [
      "################",
      "#   .       .  #",
      "# # ## ## ##   #",
      "#   $   $    # #",
      "## .  . ## .   #",
      "#  $##$  $     #",
      "#    @   ##    #",
      "################"
    ],
    targets: { threeStars: 70, twoStars: 126 }
  },
  {
    "id": "hack-66",
    "name": "Packet Sniff",
    grid: [
      "################",
      "#  .        .  #",
      "#  ## ## ## ## #",
      "#  $  $  # $ # #",
      "## .  . ##  $  #",
      "#   ##         #",
      "#  #  #     @  #",
      "################"
    ],
    targets: { threeStars: 80, twoStars: 144 }
  },
  {
    "id": "hack-67",
    "name": "ARP Poison",
    grid: [
      "#################",
      "#   .        .  #",
      "# # ## ## ## #  #",
      "#   $   $      ##",
      "## .  . ## . #  #",
      "#  $##$  $      #",
      "#    @   ##   # #",
      "#################"
    ],
    targets: { threeStars: 70, twoStars: 126 }
  },
  {
    "id": "hack-68",
    "name": "Evil Twin",
    grid: [
      "#################",
      "#  .         .  #",
      "#  ## ## ## ##  #",
      "#  $  $  # $ #  #",
      "## .  . ##  $   #",
      "#   ##          #",
      "#  #  #      @  #",
      "#################"
    ],
    targets: { threeStars: 90, twoStars: 162 }
  },
  {
    "id": "hack-69",
    "name": "Deauth Flood",
    grid: [
      "##################",
      "#   .          .  #",
      "# # ## ## ## ##   #",
      "#   $   $       # #",
      "## .  . ## . #    #",
      "#  $##$  $        #",
      "#    @   ##    #  #",
      "##################"
    ],
    targets: { threeStars: 80, twoStars: 144 }
  },
  {
    "id": "hack-70",
    "name": "WPA Handshake",
    grid: [
      "##################",
      "#  .           .  #",
      "#  ## ## ## ## ## #",
      "#  $  $  # $ # $  #",
      "## .  . ##        #",
      "#   ##            #",
      "#  #  #       @  ##",
      "##################"
    ],
    targets: { threeStars: 110, twoStars: 198 }
  },
  {
    "id": "hack-71",
    "name": "Hash Collision",
    grid: [
      "#########",
      "#  . .  #",
      "# $##$  #",
      "#  . .  #",
      "## $  $ #",
      "#       #",
      "#  @ #  #",
      "#########"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-72",
    "name": "Rainbow Table",
    grid: [
      "##########",
      "#  .  .  #",
      "#  $# #$ #",
      "## .  .  #",
      "#  $##$  #",
      "#        #",
      "#   @    #",
      "##########"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-73",
    "name": "Salt Hash",
    grid: [
      "###########",
      "#   .  .  #",
      "# # $# #$ #",
      "#   .  .  #",
      "## $##$## #",
      "#         #",
      "#    @    #",
      "###########"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-74",
    "name": "MD5 Crack",
    grid: [
      "###########",
      "#  .   .  #",
      "#  $# #$  #",
      "##  .  .  #",
      "#  $##$## #",
      "#         #",
      "#   @     #",
      "###########"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-75",
    "name": "Brute Force",
    grid: [
      "############",
      "#   .   .  #",
      "# # $# #$  #",
      "#   .   .  #",
      "## $##$##$ #",
      "#   .      #",
      "#   @      #",
      "############"
    ],
    targets: { threeStars: 50, twoStars: 90 }
  },
  {
    "id": "hack-76",
    "name": "Dictionary Attack",
    grid: [
      "############",
      "#  .    .  #",
      "#  $# #$#  #",
      "##  .   .  #",
      "#  $##$##$ #",
      "#   .      #",
      "#  @       #",
      "############"
    ],
    targets: { threeStars: 50, twoStars: 90 }
  },
  {
    "id": "hack-77",
    "name": "Wordlist Gen",
    grid: [
      "#############",
      "#   .    .  #",
      "# # $# #$#  #",
      "#   .   .   #",
      "## $##$## $ #",
      "#   .   . $ #",
      "#   @        #",
      "#############"
    ],
    targets: { threeStars: 60, twoStars: 108 }
  },
  {
    "id": "hack-78",
    "name": "Credential Stuffing",
    grid: [
      "#############",
      "#  .     .  #",
      "#  $# #$##  #",
      "##  .   .   #",
      "#  $##$## $ #",
      "#   .   . $ #",
      "#  @        #",
      "#############"
    ],
    targets: { threeStars: 70, twoStars: 126 }
  },
  {
    "id": "hack-79",
    "name": "Password Spray",
    grid: [
      "##############",
      "#   .     .  #",
      "# # $# #$##  #",
      "#   .   .  # #",
      "## $##$## $  #",
      "#   .   . $  #",
      "#   @        #",
      "##############"
    ],
    targets: { threeStars: 80, twoStars: 144 }
  },
  {
    "id": "hack-80",
    "name": "Keylogger",
    grid: [
      "##############",
      "#  .      .  #",
      "#  $# #$###  #",
      "##  .   .    #",
      "#  $##$## $  #",
      "#   .   . $  #",
      "#  @         #",
      "##############"
    ],
    targets: { threeStars: 80, twoStars: 144 }
  },
  {
    "id": "hack-81",
    "name": "Process Injection",
    grid: [
      "#########",
      "#  .    #",
      "# $##.  #",
      "#  # $  #",
      "##.##   #",
      "#  $    #",
      "#   @   #",
      "#########"
    ],
    targets: { threeStars: 30, twoStars: 54 }
  },
  {
    "id": "hack-82",
    "name": "DLL Hijack",
    grid: [
      "##########",
      "#  .  .  #",
      "# $##$## #",
      "#  .   . #",
      "## $  $  #",
      "#        #",
      "#   @    #",
      "##########"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-83",
    "name": "COM Hijack",
    grid: [
      "###########",
      "#   .  .  #",
      "# # ##$## #",
      "#  $ . $  #",
      "## .  . # #",
      "#  $##$   #",
      "#    @    #",
      "###########"
    ],
    targets: { threeStars: 50, twoStars: 90 }
  },
  {
    "id": "hack-84",
    "name": "Registry Run Key",
    grid: [
      "###########",
      "#  .   .  #",
      "#  ## ##$ #",
      "#  $ . $  #",
      "## .  . # #",
      "#  $##$   #",
      "#   @     #",
      "###########"
    ],
    targets: { threeStars: 50, twoStars: 90 }
  },
  {
    "id": "hack-85",
    "name": "Startup Folder",
    grid: [
      "############",
      "#   .   .  #",
      "# # ## ##$ #",
      "#   $  $   #",
      "## .  . ## #",
      "#   ##$#   #",
      "#          #",
      "#    @     #",
      "############"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-86",
    "name": "Scheduled Task",
    grid: [
      "############",
      "#  .    .  #",
      "#  ## ## $ #",
      "#  $  $    #",
      "## .  . ## #",
      "#   ##$#   #",
      "#          #",
      "#   @      #",
      "############"
    ],
    targets: { threeStars: 40, twoStars: 72 }
  },
  {
    "id": "hack-87",
    "name": "WMI Persist",
    grid: [
      "#############",
      "#   .    .  #",
      "# # ## ## $ #",
      "#   $  $    #",
      "## .  . ## #",
      "#   ##$##   #",
      "#   .    $  #",
      "#    @      #",
      "#############"
    ],
    targets: { threeStars: 50, twoStars: 90 }
  },
  {
    "id": "hack-88",
    "name": "Service Install",
    grid: [
      "#############",
      "#  .     .  #",
      "#  ## ## $  #",
      "#  $  $  #  #",
      "## .  . ## #",
      "#   ##$##   #",
      "#   .    $  #",
      "#   @       #",
      "#############"
    ],
    targets: { threeStars: 50, twoStars: 90 }
  },
  {
    "id": "hack-89",
    "name": "Token Impersonation",
    grid: [
      "##############",
      "#   .     .  #",
      "# # ## ## $  #",
      "#   $  $   # #",
      "## .  . ## # #",
      "#   ##$## $  #",
      "#   .  . $   #",
      "#    @       #",
      "##############"
    ],
    targets: { threeStars: 60, twoStars: 108 }
  },
  {
    "id": "hack-90",
    "name": "Pass the Hash",
    grid: [
      "##############",
      "#  .      .  #",
      "#  ## ## $ # #",
      "#  $  $  #   #",
      "## .  . ##   #",
      "#   ##$## $  #",
      "#   .  .  $  #",
      "#   @        #",
      "##############"
    ],
    targets: { threeStars: 70, twoStars: 126 }
  },
  {
    "id": "hack-91",
    "name": "Golden Ticket",
    grid: [
      "###############",
      "#   .      .  #",
      "# # ## ## $ # #",
      "#   $  $  #   #",
      "## .  . ## #  #",
      "#   ##$## $   #",
      "#   .  .  $   #",
      "#    @        #",
      "###############"
    ],
    targets: { threeStars: 80, twoStars: 144 }
  },
  {
    "id": "hack-92",
    "name": "Silver Ticket",
    grid: [
      "###############",
      "#  .       .  #",
      "#  ## ## $ ## #",
      "#  $  $  #  $ #",
      "## .  . ##    #",
      "#   ##$## $   #",
      "#   .  .      #",
      "#   @         #",
      "###############"
    ],
    targets: { threeStars: 90, twoStars: 162 }
  },
  {
    "id": "hack-93",
    "name": "DCSync Attack",
    grid: [
      "################",
      "#   .       .  #",
      "# # ## ## $ ## #",
      "#   $  $  #  $ #",
      "## .  . ##  #  #",
      "#   ##$## $    #",
      "#   .  .       #",
      "#    @         #",
      "################"
    ],
    targets: { threeStars: 90, twoStars: 162 }
  },
  {
    "id": "hack-94",
    "name": "NTLM Relay",
    grid: [
      "################",
      "#  .        .  #",
      "#  ## ## $ ## # #",
      "#  $  $  #   $  #",
      "## .  . ##   #  #",
      "#   ##$## $     #",
      "#   .  .        #",
      "#   @           #",
      "################"
    ],
    targets: { threeStars: 100, twoStars: 180 }
  },
  {
    "id": "hack-95",
    "name": "Lateral Movement",
    grid: [
      "#################",
      "#   .        .  #",
      "# # ## ## $ ##  #",
      "#   $  $  #   $ #",
      "## .  . ##   #  #",
      "#   ##$## $     #",
      "#   .  .        #",
      "#    @          #",
      "#################"
    ],
    targets: { threeStars: 110, twoStars: 198 }
  },
  {
    "id": "hack-96",
    "name": "C2 Beacon",
    grid: [
      "#################",
      "#  .         .  #",
      "#  ## ## $ ## # #",
      "#  $  $  #   $  #",
      "## .  . ##    # #",
      "#   ##$## $     #",
      "#   .  .        #",
      "#   @           #",
      "#################"
    ],
    targets: { threeStars: 100, twoStars: 180 }
  },
  {
    "id": "hack-97",
    "name": "Exfiltration",
    grid: [
      "##################",
      "#   .          .  #",
      "# # ## ## $ ## #  #",
      "#   $  $  #   $ $ #",
      "## .  . ##   #    #",
      "#   ##$##         #",
      "#   .  .          #",
      "#    @            #",
      "##################"
    ],
    targets: { threeStars: 120, twoStars: 216 }
  },
  {
    "id": "hack-98",
    "name": "Data Staging",
    grid: [
      "##################",
      "#  .           .  #",
      "#  ## ## $ ## ## #",
      "#  $  $  #    $  #",
      "## .  . ##    ## #",
      "#   ##$## $      #",
      "#   .  .         #",
      "#   @            #",
      "##################"
    ],
    targets: { threeStars: 110, twoStars: 198 }
  },
  {
    "id": "hack-99",
    "name": "Cover Tracks",
    grid: [
      "###################",
      "#   .           .  #",
      "# # ## ## $ ## ##  #",
      "#   $  $  #    $ $ #",
      "## .  . ##    ##   #",
      "#   ##$##          #",
      "#   .  .           #",
      "#    @             #",
      "###################"
    ],
    targets: { threeStars: 130, twoStars: 234 }
  },
  {
    "id": "hack-100",
    "name": "Root the Box",
    grid: [
      "####################",
      "#   .   .       .  #",
      "# # ## ## # ## ##  #",
      "#   $  $  # $  $ $ #",
      "## .  . ## .  ##   #",
      "#   ## ##  $  $    #",
      "#   .  . $ $ #$ $  #",
      "##  ## ##  #       #",
      "#    .   .     .   #",
      "#    @             #",
      "####################"
    ],
    targets: { threeStars: 160, twoStars: 288 }
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
  const deadlocked = /* @__PURE__ */ new Set();
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
      deadlocked.add(box.id);
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
  deadlockedBoxIds: /* @__PURE__ */ new Set(),
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
      deadlockedBoxIds: /* @__PURE__ */ new Set(),
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

function shallow$1(objA, objB) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false;
    for (const [key, value] of objA) {
      if (!Object.is(value, objB.get(key))) {
        return false;
      }
    }
    return true;
  }
  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false;
    for (const value of objA) {
      if (!objB.has(value)) {
        return false;
      }
    }
    return true;
  }
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) {
    return false;
  }
  for (const keyA of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, keyA) || !Object.is(objA[keyA], objB[keyA])) {
      return false;
    }
  }
  return true;
}

const React$4 = await importShared('react');
function Tile({
  cell,
  x,
  y,
  widthPercent,
  heightPercent
}) {
  if (cell === TileType.EMPTY) return null;
  const tileStyle = {
    left: `${x * widthPercent}%`,
    top: `${y * heightPercent}%`,
    width: `${widthPercent}%`,
    height: `${heightPercent}%`
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute", style: tileStyle, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[#080808]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 opacity-[0.05]",
        style: {
          backgroundImage: `
              linear-gradient(rgba(255,176,0,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,176,0,0.15) 1px, transparent 1px)
            `,
          backgroundSize: "6px 6px"
        }
      }
    ) }),
    cell === TileType.WALL && /* @__PURE__ */ jsxRuntimeExports.jsx(FirewallTile, {}),
    cell === TileType.TARGET && /* @__PURE__ */ jsxRuntimeExports.jsx(SignalPortTile, {})
  ] });
}
function FirewallTile() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-[88%] h-[88%] overflow-hidden border border-[#FFB000]/30 bg-gradient-to-b from-[#161616] to-[#0D0D0D]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0 opacity-[0.08]",
        style: {
          backgroundImage: "repeating-linear-gradient(180deg, transparent, transparent 2px, rgba(255,176,0,0.5) 2px, rgba(255,176,0,0.5) 3px)"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-[2px] left-[2px] w-[3px] h-[3px] rounded-full bg-[#FFB000]/60" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center font-mono text-[8px] font-bold tracking-tight text-[#FFB000]/75", children: "FW" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 h-[1px] bg-[#FFB000]/20" })
  ] }) });
}
function SignalPortTile() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 flex items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute w-[70%] h-[70%] rounded-full",
        style: {
          background: "radial-gradient(circle, rgba(0,255,153,0.25), transparent 70%)",
          animation: "signalPulse 2s ease-in-out infinite"
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center w-[55%] h-[55%] border border-[#00FF99]/50 bg-[#07110D]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[7px] font-bold text-[#00FF99]/80", children: "RX" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-[1px] bg-[#00FF99]/30" })
    ] })
  ] });
}
const Tile$1 = React$4.memo(Tile);

const React$3 = await importShared('react');
function Box({ box, board, isDeadlocked, tileWidthPercent, tileHeightPercent }) {
  const isOnTarget = board[box.y]?.[box.x] === TileType.TARGET;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute p-[2px] z-10",
      style: {
        left: `${box.x * tileWidthPercent}%`,
        top: `${box.y * tileHeightPercent}%`,
        width: `${tileWidthPercent}%`,
        height: `${tileHeightPercent}%`,
        transition: "left 100ms ease-out, top 100ms ease-out"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-full h-full relative overflow-hidden ${isDeadlocked ? "opacity-60" : ""}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: `w-full h-full rounded-[1px] relative overflow-hidden ${isOnTarget ? "bg-gradient-to-br from-[#3a2a00] via-[#2a1a00] to-[#1a0e00] border border-[#FFB000]/70" : "bg-gradient-to-br from-[#2a1a0a] via-[#1f1205] to-[#150d03] border border-[#FFB000]/35"}`,
          style: {
            boxShadow: isOnTarget ? "inset 0 0 10px rgba(255,176,0,0.12), 0 0 6px rgba(255,176,0,0.08)" : "inset 0 1px 0 rgba(255,176,0,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)"
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-[8%] top-[30%] h-[1px] bg-[#FFB000]/10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-[8%] top-[55%] h-[1px] bg-[#FFB000]/10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-[8%] top-[80%] h-[1px] bg-[#FFB000]/10" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute inset-0 opacity-[0.06]",
                style: {
                  backgroundImage: "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,176,0,0.5) 3px, rgba(255,176,0,0.5) 4px)"
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute top-0 left-0 w-[35%] h-[1px] bg-[#FFB000]/10",
                style: { transform: "rotate(35deg)", transformOrigin: "top left" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute bottom-0 right-0 w-[35%] h-[1px] bg-[#FFB000]/10",
                style: { transform: "rotate(35deg)", transformOrigin: "bottom right" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute top-0 right-0 w-[35%] h-[1px] bg-[#FFB000]/10",
                style: { transform: "rotate(-35deg)", transformOrigin: "top right" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute bottom-0 left-0 w-[35%] h-[1px] bg-[#FFB000]/10",
                style: { transform: "rotate(-35deg)", transformOrigin: "bottom left" }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-[2px] left-[2px] w-[5px] h-[5px] border-l-[1.5px] border-t-[1.5px] border-[#FFB000]/25 rounded-tl-[1px]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-[2px] right-[2px] w-[5px] h-[5px] border-r-[1.5px] border-t-[1.5px] border-[#FFB000]/25 rounded-tr-[1px]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-[2px] left-[2px] w-[5px] h-[5px] border-l-[1.5px] border-b-[1.5px] border-[#FFB000]/25 rounded-bl-[1px]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-[2px] right-[2px] w-[5px] h-[5px] border-r-[1.5px] border-b-[1.5px] border-[#FFB000]/25 rounded-br-[1px]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-b from-[#FFB000]/10 to-transparent" }),
            isOnTarget && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "absolute inset-0",
                style: {
                  background: "radial-gradient(circle at 50% 50%, rgba(255,176,0,0.08), transparent 70%)",
                  animation: "targetPulse 2s ease-in-out infinite"
                }
              }
            ),
            isDeadlocked && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[#FF4444]/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: "text-[#FF4444] font-bold leading-none select-none",
                style: {
                  fontSize: "clamp(4px, 30%, 10px)",
                  textShadow: "0 0 4px rgba(255,68,68,0.5)"
                },
                children: "✗"
              }
            ) })
          ]
        }
      ) })
    }
  );
}
const BoxTile = React$3.memo(Box);

const React$2 = await importShared('react');
const {useEffect: useEffect$3,useState: useState$2} = React$2;

function PetSprite({
  size = "100%",
  stage = 1,
  status = "idle",
  isSleeping = false,
  isHungry = false,
  className = ""
}) {
  const [animFrame, setAnimFrame] = useState$2(0);
  useEffect$3(() => {
    if (status === "moving" || status === "playing") {
      const timer = setInterval(() => setAnimFrame((f) => (f + 1) % 2), 400);
      return () => clearInterval(timer);
    }
    setAnimFrame(0);
  }, [status]);
  const isEating = status === "eating";
  const isPlaying = status === "playing";
  const isMoving = status === "moving";
  const bounceClass = isPlaying || isMoving ? "animate-bounce" : "";
  const wiggleStyle = isMoving || status === "idle" && animFrame === 1 ? { transform: "rotate(3deg)", transformOrigin: "bottom center" } : {};
  const renderStageSprite = () => {
    switch (stage) {
      case 1:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "3", width: "6", height: "10", rx: "3", fill: "#eeeecc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "5", width: "8", height: "7", rx: "2", fill: "#eeeecc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isEating && animFrame === 0 ? "7" : "6", y: "5", width: "2", height: "2", fill: "#44aa44" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isEating && animFrame === 0 ? "8" : "9", y: "8", width: "2", height: "2", fill: "#44aa44" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "10", width: "2", height: "1", fill: "#44aa44" })
        ] });
      case 2: {
        const leafColor = isHungry ? "#cccc33" : "#33aa33";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: animFrame === 0 ? "10" : "9", width: "2", height: "2", fill: "#88cc88" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "7", width: "7", height: "6", rx: "2", fill: "#88cc88" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "9", width: "9", height: "3", fill: "#88cc88" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isMoving && animFrame === 0 ? "4" : "5", y: "13", width: "2", height: "1", fill: "#448844" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isMoving && animFrame === 1 ? "11" : "10", y: "13", width: "2", height: "1", fill: "#448844" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "8", y: animFrame === 0 ? "5" : "6", width: "2", height: "2", fill: leafColor }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: animFrame === 0 ? "4" : "5", width: "2", height: "2", fill: leafColor }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "8", y: "7", width: "1", height: "1", fill: "#448844" }),
          !isSleeping ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "8", width: "2", height: "2", fill: "#ffffff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6.5", y: "8.5", width: "1", height: "1", fill: "#ff4444" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "8", width: "2", height: "2", fill: "#ffffff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10.5", y: "8.5", width: "1", height: "1", fill: "#ff4444" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "8", y: "11", width: "2", height: "1", fill: "#448844" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "9", width: "2", height: "1", fill: "#448844" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "9", width: "2", height: "1", fill: "#448844" })
          ] })
        ] });
      }
      case 3:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: isEating && animFrame === 0 ? "2" : "3", width: "3", height: "3", rx: "1", fill: "#ff66aa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "5", width: "5", height: "1", fill: "#338833" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "6", width: "9", height: "7", rx: "2", fill: "#55aaaa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "8", width: "11", height: "4", fill: "#55aaaa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isMoving && animFrame === 0 ? "3" : "4", y: "13", width: "2", height: "1", fill: "#227777" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isMoving && animFrame === 1 ? "12" : "11", y: "13", width: "2", height: "1", fill: "#227777" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "1", y: "9", width: "3", height: "2", fill: "#55aaaa" }),
          !isSleeping ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "8", y: "7", width: "2", height: "2", fill: "#ffffff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "7.5", width: "1", height: "1", fill: "#ff2222" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "7", width: "2", height: "2", fill: "#ffffff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "7.5", width: "1", height: "1", fill: "#ff2222" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "10", width: "3", height: "1", fill: "#227777" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "8", width: "2", height: "1", fill: "#227777" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "8", width: "2", height: "1", fill: "#227777" })
          ] })
        ] });
      case 4:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "5", width: "9", height: "1", fill: "#226622" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: animFrame === 0 ? "2" : "3", width: "7", height: "3", fill: "#ff4488" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: animFrame === 0 ? "1" : "2", width: "3", height: "1", fill: "#ffcc00" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "6", width: "11", height: "7", rx: "2", fill: "#2d6a6a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "13", y: "8", width: "2", height: "2", fill: "#2d6a6a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "14", y: isPlaying && animFrame === 0 ? "5" : "6", width: "2", height: "2", fill: "#226622" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "13", width: "2", height: "1", fill: "#124a4a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "11", y: "13", width: "2", height: "1", fill: "#124a4a" }),
          !isSleeping ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "8", width: "2", height: "2", fill: "#ffffff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "8", width: "1", height: "1", fill: "#ff0000" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "8", width: "2", height: "2", fill: "#ffffff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "11", y: "8", width: "1", height: "1", fill: "#ff0000" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "11", width: "3", height: "1", fill: "#124a4a" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "9", width: "2", height: "1", fill: "#124a4a" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "9", width: "2", height: "1", fill: "#124a4a" })
          ] })
        ] });
      case 5: {
        const floatOffset = animFrame === 0 ? -1 : 1;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { style: { transform: `translateY(${floatOffset}px)` }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "11", width: "1", height: "1", fill: "#ffff99", opacity: animFrame === 0 ? 0.3 : 0.8 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "14", y: "4", width: "1", height: "1", fill: "#ffff99", opacity: animFrame === 0 ? 0.8 : 0.3 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "13", y: "11", width: "1", height: "1", fill: "#ffff99", opacity: animFrame === 0 ? 0.4 : 0.9 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: animFrame === 0 ? "M 3,6 L 0,2 L 1,7 Z" : "M 3,6 L 0,4 L 1,8 Z", fill: "#33aa33" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: animFrame === 0 ? "M 13,6 L 16,2 L 15,7 Z" : "M 13,6 L 16,4 L 15,8 Z", fill: "#33aa33" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "0", width: "5", height: "2", fill: "#ffff33" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "4", width: "9", height: "1", fill: "#226622" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "2", width: "7", height: "2", fill: "#ff0066" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "1", width: "3", height: "1", fill: "#ffff33" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "5", width: "11", height: "7", rx: "2", fill: "#2d6a6a" }),
          !isSleeping ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "7", width: "2", height: "2", fill: "#ffffff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "7", width: "1", height: "1", fill: "#ff0000" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "7", width: "2", height: "2", fill: "#ffffff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "11", y: "7", width: "1", height: "1", fill: "#ff0000" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "8", width: "2", height: "1", fill: "#124a4a" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "8", width: "2", height: "1", fill: "#124a4a" })
          ] })
        ] });
      }
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "svg",
    {
      viewBox: "0 0 16 16",
      className: `${bounceClass} ${className}`,
      style: { width: size, height: size, ...wiggleStyle },
      children: [
        renderStageSprite(),
        isSleeping && /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { className: "animate-pulse", style: { fill: "var(--color-cozy-border)", opacity: 0.8 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "11", y: "4", style: { fontSize: "4px", fontFamily: "monospace" }, children: "Z" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("text", { x: "13", y: "2", style: { fontSize: "3px", fontFamily: "monospace" }, children: "z" })
        ] })
      ]
    }
  );
}
const PetSprite$1 = React$2.memo(PetSprite);

const React$1 = await importShared('react');
function PlayerLayer({ x, y, tileWidthPercent, tileHeightPercent, status, direction, petStage = 1 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "absolute z-20",
      style: {
        left: `${x * tileWidthPercent}%`,
        top: `${y * tileHeightPercent}%`,
        width: `${tileWidthPercent}%`,
        height: `${tileHeightPercent}%`,
        transition: "left 80ms ease-out, top 80ms ease-out"
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        PetSprite$1,
        {
          stage: petStage,
          status,
          direction,
          className: "drop-shadow-[0_0_4px_rgba(255,176,0,0.3)]"
        }
      ) })
    }
  );
}
const PlayerLayer$1 = React$1.memo(PlayerLayer);

function Board({ petStage = 1 }) {
  const { board, player, boxes, deadlockedBoxIds, lastDirection, isMoving } = useSokobanStore(
    (s) => ({
      board: s.board,
      player: s.player,
      boxes: s.boxes,
      deadlockedBoxIds: s.deadlockedBoxIds,
      lastDirection: s.lastDirection,
      isMoving: s.isMoving
    }),
    shallow$1
  );
  if (board.length === 0)
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-cozy-text p-4 text-[10px]", children: "LOADING BOARD..." });
  const rows = board.length;
  const cols = board[0].length;
  const tw = 100 / cols;
  const th = 100 / rows;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "relative w-full border border-[#FFB000] bg-[#050505] select-none overflow-hidden rounded-sm",
      style: { aspectRatio: `${cols} / ${rows}` },
      role: "grid",
      "aria-label": "Sokoban game board",
      tabIndex: 0,
      children: [
        board.map(
          (row, y) => row.map((cell, x) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tile$1, { cell, x, y, widthPercent: tw, heightPercent: th }, `tile-${x}-${y}`))
        ),
        boxes.map((box) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          BoxTile,
          {
            box,
            board,
            isDeadlocked: deadlockedBoxIds.has(box.id),
            tileWidthPercent: tw,
            tileHeightPercent: th
          },
          box.id
        )),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          PlayerLayer$1,
          {
            x: player.x,
            y: player.y,
            tileWidthPercent: tw,
            tileHeightPercent: th,
            status: isMoving ? "moving" : "idle",
            direction: lastDirection,
            petStage
          }
        )
      ]
    }
  );
}

function LevelSelect({ onSelect, bestStars, currentLevelIdx }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-cozy-text font-mono w-full min-h-0 flex-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-press text-[12px] text-center my-2 shrink-0", children: "SELECT LEVEL" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-3 p-2 overflow-y-auto flex-1 min-h-0", children: SOKOBAN_LEVELS.map((level, idx) => {
      const stars = bestStars[level.id] ?? 0;
      const active = currentLevelIdx === idx;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => onSelect(idx),
          className: `w-10 h-10 border flex flex-col items-center justify-center font-press cursor-pointer transition-colors active:translate-y-0.5 ${active ? "border-[#FFB000] bg-[#FFB000]/10 text-[#FFB000]" : stars > 0 ? "border-cozy-border bg-black text-[#FFB000] hover:bg-cozy-text hover:text-black hover:scale-105" : "border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black hover:scale-105"}`,
          "aria-label": `Select level ${idx + 1}${stars > 0 ? ` (${stars} star${stars > 1 ? "s" : ""})` : ""}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px]", children: idx + 1 }),
            stars > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[6px] leading-none mt-0.5", children: [
              "★".repeat(stars),
              "☆".repeat(3 - stars)
            ] })
          ]
        },
        level.id
      );
    }) })
  ] });
}

const {useEffect: useEffect$2,useRef} = await importShared('react');
function Controls() {
  const move = useSokobanStore((state) => state.move);
  const isWon = useSokobanStore((state) => state.isWon);
  const touchStart = useRef(null);
  useEffect$2(() => {
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
  useEffect$2(() => {
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
const {useEffect: useEffect$1,useState: useState$1} = React;
const progressService$1 = new ProgressService(new LocalProgressRepository());
function calcStars(moves, threeStars, twoStars) {
  if (moves <= threeStars) return 3;
  if (moves <= twoStars) return 2;
  return 1;
}
function WinModal({ onBack }) {
  const isWon = useSokobanStore((state) => state.isWon);
  const nextLevel = useSokobanStore((state) => state.nextLevel);
  const moves = useSokobanStore((state) => state.moves);
  const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);
  const [rewardMsg, setRewardMsg] = useState$1(null);
  const [earnedStars, setEarnedStars] = useState$1(0);
  useEffect$1(() => {
    if (isWon) {
      synth.playWin();
    }
  }, [isWon]);
  useEffect$1(() => {
    if (!isWon) {
      setRewardMsg(null);
      setEarnedStars(0);
      return;
    }
    const level = SOKOBAN_LEVELS[currentLevelIdx];
    const stars = level ? calcStars(moves, level.targets.threeStars, level.targets.twoStars) : 1;
    setEarnedStars(stars);
    void progressService$1.completeLevelWithStars("sokoban", level?.id ?? `level-${currentLevelIdx}`, stars).then((improved) => {
      setRewardMsg(improved ? `+${stars} FOOD` : "ALREADY BEST");
    });
  }, [isWon, currentLevelIdx, moves]);
  if (!isWon) return /* @__PURE__ */ jsxRuntimeExports.jsx(React.Fragment, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 select-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-[#FFB000] bg-[#050505] p-6 max-w-xs w-full text-center flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-press text-[14px] text-cozy-text animate-bounce", children: "STAGE CLEAR!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[18px] tracking-widest", children: [
      "★".repeat(earnedStars),
      "☆".repeat(3 - earnedStars)
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-mono text-sm text-cozy-text", children: [
      "Finished in",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold font-press text-[11px] text-cozy-text", children: moves }),
      " ",
      "movements."
    ] }),
    rewardMsg && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-press text-[9px] border border-cozy-border px-2 py-1 text-cozy-text", children: rewardMsg }),
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

const {useState,useEffect,useCallback} = await importShared('react');
const progressService = new ProgressService(new LocalProgressRepository());
function SokobanApp() {
  const [view, setView] = useState("menu");
  const [bestStars, setBestStars] = useState({});
  const [petStage, setPetStage] = useState(1);
  const loadLevel = useSokobanStore((state) => state.loadLevel);
  const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);
  const refreshProgress = useCallback(async () => {
    const state = await progressService.getState();
    const map = {};
    for (const c of state.completedLevels) {
      if (c.module === "sokoban") {
        map[c.levelId] = c.stars ?? 1;
      }
    }
    setBestStars(map);
    setPetStage(state.pet.stage);
  }, []);
  useEffect(() => {
    void refreshProgress();
    const handler = () => {
      void refreshProgress();
    };
    window.addEventListener("cozyos:progress-updated", handler);
    return () => window.removeEventListener("cozyos:progress-updated", handler);
  }, [refreshProgress]);
  const handleSelectLevel = (idx) => {
    loadLevel(idx);
    setView("game");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-[450px] border border-cozy-border bg-black p-4 select-none relative flex flex-col items-center text-cozy-text max-h-[calc(100vh-120px)]", children: view === "menu" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    LevelSelect,
    {
      onSelect: handleSelectLevel,
      bestStars,
      currentLevelIdx
    }
  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 items-center w-full relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(HUD, { onBack: () => setView("menu") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Board, { petStage }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Controls, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WinModal, { onBack: () => setView("menu") })
  ] }) });
}

export { SokobanApp as default, jsxRuntimeExports as j };
