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
    pet: { xp: 0, stage: 1, lastFedAt: 0 }
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
      return data.state;
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
    const state = await this.getState();
    const alreadyDone = state.completedLevels.some(
      (l) => l.module === module && l.levelId === levelId
    );
    if (alreadyDone) return false;
    await this.saveState({
      ...state,
      completedLevels: [
        ...state.completedLevels,
        { module, levelId, completedAt: Date.now() }
      ]
    });
    return true;
  }
  async feedPet() {
    const state = await this.getState();
    const newXp = state.pet.xp + 1;
    await this.saveState({
      ...state,
      foodConsumed: state.foodConsumed + 1,
      pet: {
        xp: newXp,
        stage: getEvolutionStage(newXp),
        lastFedAt: Date.now()
      }
    });
  }
}

const HUNGER_COOLDOWN = 4 * 60 * 60 * 1e3;
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
  async feedPet() {
    const state = await this.repo.getState();
    const isHungry = Date.now() - state.pet.lastFedAt >= HUNGER_COOLDOWN;
    const foodAvailable = Math.max(0, state.completedLevels.length - state.foodConsumed);
    if (!isHungry || foodAvailable <= 0) return;
    await this.repo.feedPet();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("cozyos:progress-updated"));
    }
  }
  async getFoodAvailable() {
    const state = await this.repo.getState();
    return Math.max(0, state.completedLevels.length - state.foodConsumed);
  }
  async isPetHungry() {
    const state = await this.repo.getState();
    return Date.now() - state.pet.lastFedAt >= HUNGER_COOLDOWN;
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
    ]
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
    ]
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
    ]
  },
  {
    "id": "hack-04",
    "name": "First Commit",
    grid: [
      "########",
      "#   .  #",
      "# #$## #",
      "#  $   #",
      "## ##.##",
      "#   $  #",
      "#  .@ ##",
      "########"
    ]
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
    ]
  },
  {
    "id": "hack-06",
    "name": "Stack Overflow",
    grid: [
      " ########",
      "##  .   #",
      "#  $#$ .#",
      "# # $#. #",
      "#  $ .  #",
      "## ##  ##",
      "#    @  #",
      "########"
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    "id": "hack-10",
    "name": "Buffer Overflow",
    grid: [
      " ##########",
      "##  .  .  #",
      "#  $##$## #",
      "# #  .    #",
      "#  $##$   #",
      "## # .  ###",
      " #   @  #",
      " ########"
    ]
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
    ]
  },
  {
    "id": "hack-12",
    "name": "Heap Fragmentation",
    grid: [
      " ##########",
      "##  .  .  #",
      "#   ## ## #",
      "# #  . #  #",
      "#  $##$   #",
      "## # . $  #",
      "#   $  # ##",
      "#   @    #",
      "##########"
    ]
  },
  {
    "id": "hack-13",
    "name": "Deadlock",
    grid: [
      "###########",
      "#  .   .  #",
      "#  ##$##$ #",
      "#  . # .  #",
      "## $   $  #",
      "#  ##.##  #",
      "#   $@    #",
      "###########"
    ]
  },
  {
    "id": "hack-14",
    "name": "Thread Starvation",
    grid: [
      " ###########",
      "##   .  .  #",
      "#  # ##$## #",
      "# $  . #   #",
      "## ##$  $  #",
      "#  . #  # ##",
      "#  $  .   #",
      "##   @   ##",
      " #########"
    ]
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
      "#  . # . $ #",
      "# $  $  #  #",
      "#    @     #",
      "############"
    ]
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
    ]
  },
  {
    "id": "hack-17",
    "name": "XSS Attack",
    grid: [
      " ############",
      "##  .   .   #",
      "#   ## ## # #",
      "# #  . #    #",
      "#  $##$  $  #",
      "## # . ##   #",
      "#  $  . $ ###",
      "#  #  #  @#",
      "###########"
    ]
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
      "#  . # . $  #",
      "# $  $  ##  #",
      "#  #  #  @ ##",
      "#############"
    ]
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
      "#  . # . $   #",
      "# $  $  ##$  #",
      "#  #  #   @ ##",
      "##############"
    ]
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
    ]
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
      "#  . # . $  $ #",
      "# $  $  ##$   #",
      "#  #  #  # # ##",
      "#     @       #",
      "###############"
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
      "#  #  #  #  ##  #",
      "#     @        ##",
      "#################"
    ]
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
    ]
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
      "#  #  #  #  # # ##",
      "#     @          #",
      "##################"
    ]
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
    ]
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
      "#  #  #  #  # # # #",
      "#     @          ##",
      "###################"
    ]
  },
  {
    "id": "hack-31",
    "name": "Port Scan",
    grid: [
      "########",
      "#  .   #",
      "# $##$ #",
      "#  .   #",
      "# $#$  #",
      "#   .  #",
      "#  @   #",
      "########"
    ]
  },
  {
    "id": "hack-32",
    "name": "Firewall Rule",
    grid: [
      "#########",
      "#  . .  #",
      "# $##$  #",
      "#  .  . #",
      "##$  $  #",
      "#  .  @ #",
      "#########"
    ]
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
      "#  $  .  #",
      "#   @    #",
      "##########"
    ]
  },
  {
    "id": "hack-34",
    "name": "DNS Spoofing",
    grid: [
      "##########",
      "#  .  .  #",
      "#  $##$  #",
      "## ## ## #",
      "#  $  $  #",
      "#  .  .  #",
      "#   @   ##",
      "##########"
    ]
  },
  {
    "id": "hack-35",
    "name": "Fuzzing",
    grid: [
      "###########",
      "#  .   .  #",
      "#  $#$ #  #",
      "## .   .  #",
      "#  $# ##  #",
      "#  .  $ @ #",
      "###########"
    ]
  },
  {
    "id": "hack-36",
    "name": "Reverse Shell",
    grid: [
      "###########",
      "#   .  .  #",
      "# # ## ## #",
      "#  $   $  #",
      "## ## ##  #",
      "#  . $ .  #",
      "#   @     #",
      "###########"
    ]
  },
  {
    "id": "hack-37",
    "name": "Payload Drop",
    grid: [
      "############",
      "#   .   .  #",
      "# # ## ##  #",
      "#   $  $ # #",
      "## ## ## . #",
      "#  $  . $  #",
      "#   @   #  #",
      "############"
    ]
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
      "#  .  . $  #",
      "#  #  #  @ #",
      "############"
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
      "#  . $  . $ $ #",
      "#   @    #   ##",
      "###############"
    ]
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
      "# $.    $ ##  #",
      "#  #  #    @  #",
      "###############"
    ]
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
    ]
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
      "# $.    $ ##   #",
      "#  #  #    @  ##",
      "################"
    ]
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
      "#  . $  . $ $   #",
      "#   @    #  #  ##",
      "#################"
    ]
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
      "#  ##.##  $ $ $ #",
      "# $.    $ ## #  #",
      "#  #  #     @  ##",
      "#################"
    ]
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
      "#  . $  . $ $  $  #",
      "#   @    #  # #  ##",
      "##################"
    ]
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
      "#  ##.##  $ $ $   #",
      "# $.    $ ## ##   #",
      "#  #  #      @  ###",
      "##################"
    ]
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
    ]
  },
  {
    "id": "hack-52",
    "name": "Disassembly",
    grid: [
      "#########",
      "#  .    #",
      "#  $##. #",
      "## #    #",
      "#  $  . #",
      "#  # $  #",
      "#    @  #",
      "#########"
    ]
  },
  {
    "id": "hack-53",
    "name": "Decompiler",
    grid: [
      "##########",
      "#   .    #",
      "# #.##.  #",
      "#  $  $  #",
      "## ## #  #",
      "#  $ $   #",
      "#    @   #",
      "##########"
    ]
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
    ]
  },
  {
    "id": "hack-55",
    "name": "Entropy Analysis",
    grid: [
      "###########",
      "#   .  .  #",
      "# # #. ## #",
      "#  $   $  #",
      "## . . ##  #",
      "#  $#$    #",
      "#    @    #",
      "###########"
    ]
  },
  {
    "id": "hack-56",
    "name": "Obfuscation",
    grid: [
      "###########",
      "#  .   .  #",
      "#  ## #.  #",
      "#  $  $   #",
      "## .  . # #",
      "#  $#$#   #",
      "#    @    #",
      "###########"
    ]
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
      "#  .  . $  #",
      "#   @   #  #",
      "############"
    ]
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
      "#  $##$ $  #",
      "#    @  #  #",
      "############"
    ]
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
      "#  $##$  $  #",
      "#    @   #  #",
      "#############"
    ]
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
      "#  $##$  $  #",
      "#  #  #  @  #",
      "#############"
    ]
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
      "#  $##$  $ $ #",
      "#    @   ##  #",
      "##############"
    ]
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
      "#  $##$  $ $ #",
      "#  #  #   @  #",
      "##############"
    ]
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
      "#  $##$  $ $  #",
      "#    @   ##   #",
      "###############"
    ]
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
      "#  $##$  $ $  #",
      "#  #  #    @  #",
      "###############"
    ]
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
      "#  $##$  $ $ $ #",
      "#    @   ##    #",
      "################"
    ]
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
      "#  $##$  $ $   #",
      "#  #  #     @  #",
      "################"
    ]
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
      "#  $##$  $ $ $  #",
      "#    @   ##   # #",
      "#################"
    ]
  },
  {
    "id": "hack-68",
    "name": "Evil Twin",
    grid: [
      "#################",
      "#  .         .  #",
      "#  ## ## ## ##  #",
      "#  $  $  # $ #  #",
      "## .  . ##  $ $ #",
      "#  $##$  $ $    #",
      "#  #  #      @  #",
      "#################"
    ]
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
      "#  $##$  $ $ $ $  #",
      "#    @   ##    #  #",
      "##################"
    ]
  },
  {
    "id": "hack-70",
    "name": "WPA Handshake",
    grid: [
      "##################",
      "#  .           .  #",
      "#  ## ## ## ## ## #",
      "#  $  $  # $ # $  #",
      "## .  . ##  $  $  #",
      "#  $##$  $ $   $  #",
      "#  #  #       @  ##",
      "##################"
    ]
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
      "#  .  . #",
      "#  @ #  #",
      "#########"
    ]
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
      "#  .  .  #",
      "#   @    #",
      "##########"
    ]
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
      "#  .  .   #",
      "#    @    #",
      "###########"
    ]
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
      "#  .  .   #",
      "#   @     #",
      "###########"
    ]
  },
  {
    "id": "hack-75",
    "name": "Brute Force",
    grid: [
      "############",
      "#   .   .  #",
      "# # $# #$  #",
      "#   .   .  #",
      "## $##$##  #",
      "#   .   .  #",
      "#   @    $ #",
      "############"
    ]
  },
  {
    "id": "hack-76",
    "name": "Dictionary Attack",
    grid: [
      "############",
      "#  .    .  #",
      "#  $# #$#  #",
      "##  .   .  #",
      "#  $##$##  #",
      "#   .   .  #",
      "#  @     $ #",
      "############"
    ]
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
    ]
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
      "#  @      $ #",
      "#############"
    ]
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
      "#   .   . $ $#",
      "#   @      $ #",
      "##############"
    ]
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
      "#  @     $ $ #",
      "##############"
    ]
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
      "#  $ .  #",
      "#   @   #",
      "#########"
    ]
  },
  {
    "id": "hack-82",
    "name": "DLL Hijack",
    grid: [
      "##########",
      "#  .  .  #",
      "# $##$## #",
      "#  . # . #",
      "## $  $  #",
      "#  .  .  #",
      "#   @    #",
      "##########"
    ]
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
    ]
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
    ]
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
      "#   .  .   #",
      "#    @     #",
      "############"
    ]
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
      "#   .  .   #",
      "#   @      #",
      "############"
    ]
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
      "#   .  . $  #",
      "#    @      #",
      "#############"
    ]
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
      "#   .  . $  #",
      "#   @       #",
      "#############"
    ]
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
    ]
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
      "#   @      $ #",
      "##############"
    ]
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
      "#   .  .  $ $ #",
      "#    @      $ #",
      "###############"
    ]
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
      "#   .  .  $ $ #",
      "#   @       $ #",
      "###############"
    ]
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
      "#   .  .  $ $  #",
      "#    @       $ #",
      "################"
    ]
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
      "#   ##$## $  $  #",
      "#   .  .  $ $   #",
      "#   @        $  #",
      "################"
    ]
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
      "#   ##$## $  $  #",
      "#   .  .  $ $ $ #",
      "#    @        $ #",
      "#################"
    ]
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
      "#   ##$## $  $  #",
      "#   .  .  $ $   #",
      "#   @         $ #",
      "#################"
    ]
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
      "#   ##$## $  $    #",
      "#   .  .  $ $ $   #",
      "#    @         $  #",
      "##################"
    ]
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
      "#   ##$## $   $  #",
      "#   .  .  $ $  $ #",
      "#   @          $ #",
      "##################"
    ]
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
      "#   ##$## $   $    #",
      "#   .  .  $ $  $ $ #",
      "#    @           $ #",
      "###################"
    ]
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
      "## $##$##  #   $   #",
      "#    .   .   $ .   #",
      "#    @          $  #",
      "####################"
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

function getBodyColor(status, isSleeping) {
  if (isSleeping) return "#779988";
  if (status === "eating" || status === "playing") return "#CC6666";
  if (status === "moving") return "#CC9966";
  return "#A0785A";
}
function getEyeOffset(direction) {
  const baseX = direction === "left" ? -0.5 : direction === "right" ? 0.5 : 0;
  const baseY = direction === "up" ? -0.5 : direction === "down" ? 0.5 : 0;
  return { ex: baseX, ey: baseY };
}
function PetSprite({
  size = "100%",
  status = "idle",
  isSleeping = false,
  direction = "down",
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
  const bodyColor = getBodyColor(status, isSleeping);
  const { ex, ey } = getEyeOffset(direction);
  const bounceClass = status === "playing" || status === "moving" ? "animate-bounce" : "";
  const legOffset = status === "moving" ? animFrame === 0 ? 0 : 1 : 0;
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
        status === "playing" && /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "13", y: animFrame === 0 ? "4" : "6", width: "2", height: "2", fill: bodyColor }),
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
const PetSprite$1 = React$2.memo(PetSprite);

const React$1 = await importShared('react');
function PlayerLayer({ x, y, tileWidthPercent, tileHeightPercent, status, direction }) {
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
          status,
          direction,
          className: "drop-shadow-[0_0_4px_rgba(255,176,0,0.3)]"
        }
      ) })
    }
  );
}
const PlayerLayer$1 = React$1.memo(PlayerLayer);

function Board() {
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
            direction: lastDirection
          }
        )
      ]
    }
  );
}

function LevelSelect({ onSelect, completedLevelIds, currentLevelIdx }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2 text-cozy-text font-mono w-full min-h-0 flex-1", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-press text-[12px] text-center my-2 shrink-0", children: "SELECT LEVEL" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-5 gap-3 p-2 overflow-y-auto flex-1 min-h-0", children: SOKOBAN_LEVELS.map((level, idx) => {
      const completed = completedLevelIds.has(level.id);
      const active = currentLevelIdx === idx;
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => onSelect(idx),
          className: `w-10 h-10 border flex items-center justify-center font-press text-[11px] cursor-pointer transition-colors active:translate-y-0.5 ${active ? "border-[#FFB000] bg-[#FFB000]/10 text-[#FFB000]" : completed ? "border-cozy-border bg-black text-[#FFB000] hover:bg-cozy-text hover:text-black hover:scale-105" : "border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black hover:scale-105"}`,
          "aria-label": `Select level ${idx + 1}${completed ? " (completed)" : ""}`,
          children: completed ? "★" : idx + 1
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
function WinModal({ onBack }) {
  const isWon = useSokobanStore((state) => state.isWon);
  const nextLevel = useSokobanStore((state) => state.nextLevel);
  const moves = useSokobanStore((state) => state.moves);
  const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);
  const [rewardMsg, setRewardMsg] = useState$1(null);
  useEffect$1(() => {
    if (isWon) {
      synth.playWin();
    }
  }, [isWon]);
  useEffect$1(() => {
    if (!isWon) {
      setRewardMsg(null);
      return;
    }
    void progressService$1.completeLevel("sokoban", SOKOBAN_LEVELS[currentLevelIdx]?.id ?? `level-${currentLevelIdx}`).then((firstTime) => {
      setRewardMsg(firstTime ? "+1 FOOD" : "ALREADY COMPLETE");
    });
  }, [isWon, currentLevelIdx]);
  if (!isWon) return /* @__PURE__ */ jsxRuntimeExports.jsx(React.Fragment, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 select-none", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-[#FFB000] bg-[#050505] p-6 max-w-xs w-full text-center flex flex-col items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-press text-[14px] text-cozy-text animate-bounce", children: "STAGE CLEAR!" }),
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
  const [completedLevelIds, setCompletedLevelIds] = useState(/* @__PURE__ */ new Set());
  const loadLevel = useSokobanStore((state) => state.loadLevel);
  const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);
  const refreshCompleted = useCallback(async () => {
    const state = await progressService.getState();
    const ids = new Set(
      state.completedLevels.filter((c) => c.module === "sokoban").map((c) => c.levelId)
    );
    setCompletedLevelIds(ids);
  }, []);
  useEffect(() => {
    void refreshCompleted();
    const handler = () => {
      void refreshCompleted();
    };
    window.addEventListener("cozyos:progress-updated", handler);
    return () => window.removeEventListener("cozyos:progress-updated", handler);
  }, [refreshCompleted]);
  const handleSelectLevel = (idx) => {
    loadLevel(idx);
    setView("game");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full max-w-[450px] border border-cozy-border bg-black p-4 select-none relative flex flex-col items-center text-cozy-text max-h-[calc(100vh-120px)]", children: view === "menu" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    LevelSelect,
    {
      onSelect: handleSelectLevel,
      completedLevelIds,
      currentLevelIdx
    }
  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-4 items-center w-full relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(HUD, { onBack: () => setView("menu") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Board, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Controls, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WinModal, { onBack: () => setView("menu") })
  ] }) });
}

export { SokobanApp as default, jsxRuntimeExports as j };
