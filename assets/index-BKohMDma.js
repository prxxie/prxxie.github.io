import { i as importShared } from './_virtual___federation_fn_import-CqGs-Vnq.js';
import { j as jsxRuntimeExports } from './jsx-runtime-CyoIsdjr.js';
import { r as reactDomExports } from './index-D9Af7wOI.js';

true&&(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
}());

var client = {};

var m = reactDomExports;
{
  client.createRoot = m.createRoot;
  client.hydrateRoot = m.hydrateRoot;
}

const remotesMap = {
'about':{url:'/mfe/about/assets/remoteEntry.js',format:'esm',from:'vite'},
  'posts':{url:'/mfe/posts/assets/remoteEntry.js',format:'esm',from:'vite'},
  'pets':{url:'/mfe/pets/assets/remoteEntry.js',format:'esm',from:'vite'},
  'shikaku':{url:'/mfe/shikaku/assets/remoteEntry.js',format:'esm',from:'vite'},
  'sokoban':{url:'/mfe/sokoban/assets/remoteEntry.js',format:'esm',from:'vite'},
  'slitherlink':{url:'/mfe/slitherlink/assets/remoteEntry.js',format:'esm',from:'vite'}
};
                const currentImports = {};
                const loadJS = async (url, fn) => {
                    const resolvedUrl = typeof url === 'function' ? await url() : url;
                    const script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.onload = fn;
                    script.src = resolvedUrl;
                    document.getElementsByTagName('head')[0].appendChild(script);
                };

                function get(name, remoteFrom) {
                    return __federation_import(name).then(module => () => {
                        if (remoteFrom === 'webpack') {
                            return Object.prototype.toString.call(module).indexOf('Module') > -1 && module.default ? module.default : module
                        }
                        return module
                    })
                }
                
                function merge(obj1, obj2) {
                  const mergedObj = Object.assign(obj1, obj2);
                  for (const key of Object.keys(mergedObj)) {
                    if (typeof mergedObj[key] === 'object' && typeof obj2[key] === 'object') {
                      mergedObj[key] = merge(mergedObj[key], obj2[key]);
                    }
                  }
                  return mergedObj;
                }

                const wrapShareModule = remoteFrom => {
                  return merge({
                    'react':{'18.3.1':{get:()=>get(new URL('__federation_shared_react-BCcI129A.js', import.meta.url).href, remoteFrom), loaded:1}},'react-dom':{'18.3.1':{get:()=>get(new URL('__federation_shared_react-dom-BhMZJInU.js', import.meta.url).href, remoteFrom), loaded:1}},'zustand':{'4.5.7':{get:()=>get(new URL('__federation_shared_zustand-X2nUUWXs.js', import.meta.url).href, remoteFrom), loaded:1}},'@tanstack/react-query':{'5.100.14':{get:()=>get(new URL('__federation_shared_@tanstack/react-query-on9ivQZm.js', import.meta.url).href, remoteFrom), loaded:1}}
                  }, (globalThis.__federation_shared__ || {})['default'] || {});
                };

                async function __federation_import(name) {
                    currentImports[name] ??= import(name);
                    return currentImports[name]
                }

                async function __federation_method_ensure(remoteId) {
                    const remote = remotesMap[remoteId];
                    if (!remote.inited) {
                        if ('var' === remote.format) {
                            // loading js with script tag
                            return new Promise(resolve => {
                                const callback = () => {
                                    if (!remote.inited) {
                                        remote.lib = window[remoteId];
                                        remote.lib.init(wrapShareModule(remote.from));
                                        remote.inited = true;
                                    }
                                    resolve(remote.lib);
                                };
                                return loadJS(remote.url, callback);
                            });
                        } else if (['esm', 'systemjs'].includes(remote.format)) {
                            // loading js with import(...)
                            return new Promise((resolve, reject) => {
                                const getUrl = typeof remote.url === 'function' ? remote.url : () => Promise.resolve(remote.url);
                                getUrl().then(url => {
                                    import(/* @vite-ignore */ url).then(lib => {
                                        if (!remote.inited) {
                                            const shareScope = wrapShareModule(remote.from);
                                            lib.init(shareScope);
                                            remote.lib = lib;
                                            remote.lib.init(shareScope);
                                            remote.inited = true;
                                        }
                                        resolve(remote.lib);
                                    }).catch(reject);
                                });
                            })
                        }
                    } else {
                        return remote.lib;
                    }
                }

                function __federation_method_wrapDefault(module, need) {
                    if (!module?.default && need) {
                        let obj = Object.create(null);
                        obj.default = module;
                        obj.__esModule = true;
                        return obj;
                    }
                    return module;
                }

                function __federation_method_getRemote(remoteName, componentName) {
                    return __federation_method_ensure(remoteName).then((remote) => remote.get(componentName).then(factory => factory()));
                }

let audioCtx = null;
let isAudioMuted = true;
const STORAGE_KEY$1 = "prxxie_audio_muted";
function getAudioMuted() {
  return isAudioMuted;
}
function setAudioMuted(muted) {
  isAudioMuted = muted;
  try {
    localStorage.setItem(STORAGE_KEY$1, JSON.stringify(muted));
  } catch (e) {
    console.warn("Failed to persist audio preference", e);
  }
}
try {
  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY$1);
    if (saved !== null) {
      isAudioMuted = JSON.parse(saved) === true;
    }
  }
} catch (e) {
  console.error("Failed to load audio preference", e);
}
function playBeepSound(frequency = 440, duration = 0.08) {
  if (isAudioMuted) return;
  try {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    if (!audioCtx) {
      audioCtx = new AudioCtor();
    }
    if (audioCtx.state === "suspended") {
      void audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(1e-5, audioCtx.currentTime + duration);
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    console.warn("Failed to play synth sound:", err);
  }
}

const {useState: useState$5} = await importShared('react');
function ConsoleFrame({
  children,
  onMobileHud
}) {
  const [muted, setMuted] = useState$5(getAudioMuted);
  const handleAudioToggle = () => {
    const nextMuted = !muted;
    setAudioMuted(nextMuted);
    setMuted(nextMuted);
    if (!nextMuted) {
      playBeepSound(520, 0.08);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full min-h-screen flex flex-col bg-cozy-bg box-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-black border-b border-cozy-border p-3 box-border w-full relative z-30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto flex justify-between items-center w-full px-4 box-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "svg",
          {
            className: "inline-block",
            viewBox: "0 0 16 16",
            width: "16",
            height: "16",
            fill: "none",
            stroke: "var(--color-cozy-accent)",
            strokeWidth: "2.5",
            strokeLinecap: "square",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M3,4 L8,8 L3,12" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "9", y1: "12", x2: "14", y2: "12" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-press text-xs font-bold text-cozy-accent uppercase", children: "PRXXIE_OS v4.7" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleAudioToggle,
            className: `pixel-btn text-[9px] px-3 py-1 ${!muted ? "bg-cozy-accent text-black border-cozy-border" : ""}`,
            "aria-label": "Toggle Audio Beeps",
            children: [
              "SOUND: ",
              !muted ? "ON" : "OFF"
            ]
          }
        ),
        onMobileHud && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: onMobileHud,
            className: "md:hidden pixel-btn text-[9px] px-3 py-1",
            "aria-label": "Open mobile HUD",
            children: "[ HUD ]"
          }
        )
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "w-full max-w-5xl mx-auto flex-1 px-4 py-6 box-border", children })
  ] });
}

const PixelBookIcon = ({ className = "w-4 h-4 inline-block" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "square", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 2h6v11H1V2z M9 2h6v11H9V2z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "3", y1: "5", x2: "5", y2: "5" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "3", y1: "8", x2: "5", y2: "8" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "11", y1: "5", x2: "13", y2: "5" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "11", y1: "8", x2: "13", y2: "8" })
] });
const PixelPawIcon = ({ className = "w-4 h-4 inline-block" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className, viewBox: "0 0 16 16", fill: "currentColor", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "7", width: "2", height: "1" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "7", width: "2", height: "1" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "8", width: "8", height: "1" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "9", width: "8", height: "1" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "10", width: "6", height: "1" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "11", width: "4", height: "1" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "12", width: "2", height: "1" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "5", width: "2", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "3", width: "2", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "3", width: "2", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "12", y: "5", width: "2", height: "2" })
] });

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
      state.pet.stage = getEvolutionStage(state.pet.xp);
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
  async feedPet(lastFedAt, lastPlayedAt) {
    const state = await this.getState();
    const newXp = state.pet.xp + 1;
    await this.saveState({
      ...state,
      foodConsumed: state.foodConsumed + 1,
      pet: {
        ...state.pet,
        xp: newXp,
        stage: getEvolutionStage(newXp),
        lastFedAt: lastFedAt !== void 0 ? lastFedAt : Date.now(),
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
    const divisor = state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
    const currentLastFedAt = state.pet.lastFedAt === 0 ? Date.now() - 5 * divisor : state.pet.lastFedAt;
    const nextLastFed = Math.min(Date.now(), currentLastFedAt + divisor);
    let nextLastPlayedAt;
    if (state.pet.isSleeping && state.pet.lastPlayedAt !== 0) {
      const elapsed = Math.max(0, Date.now() - state.pet.lastPlayedAt);
      const oldHappinessDivisor = HAPPINESS_COOLDOWN * 4;
      const newElapsed = elapsed * (HAPPINESS_COOLDOWN / oldHappinessDivisor);
      nextLastPlayedAt = Date.now() - newElapsed;
    }
    await this.repo.feedPet(nextLastFed, nextLastPlayedAt);
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
    if (state.pet.lastFedAt === 0) return 5;
    const elapsed = Math.max(0, Date.now() - state.pet.lastFedAt);
    const divisor = state.pet.isSleeping ? HUNGER_COOLDOWN * 2 : HUNGER_COOLDOWN;
    return Math.min(5, Math.floor(elapsed / divisor));
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

const {useState: useState$4,useEffect: useEffect$5,useCallback: useCallback$1} = await importShared('react');
const progressService = new ProgressService(new LocalProgressRepository());
const EMPTY_STATE = {
  completedLevels: [],
  foodConsumed: 0,
  pet: { xp: 0, stage: 1, lastFedAt: 0, happiness: 50, lastPlayedAt: 0, isSleeping: false }
};
function useProgressService() {
  const [state, setState] = useState$4(EMPTY_STATE);
  const [isHungry, setIsHungry] = useState$4(false);
  const [foodAvailable, setFoodAvailable] = useState$4(0);
  const [hungryLevel, setHungryLevel] = useState$4(0);
  const [happiness, setHappiness] = useState$4(50);
  const refresh = useCallback$1(async () => {
    const [s, hungry, food, level, happy] = await Promise.all([
      progressService.getState(),
      progressService.isPetHungry(),
      progressService.getFoodAvailable(),
      progressService.getHungryLevel(),
      progressService.getHappiness()
    ]);
    setState(s);
    setIsHungry(hungry);
    setFoodAvailable(food);
    setHungryLevel(level);
    setHappiness(happy);
  }, []);
  useEffect$5(() => {
    void refresh();
    const handler = () => {
      void refresh();
    };
    window.addEventListener("cozyos:progress-updated", handler);
    return () => window.removeEventListener("cozyos:progress-updated", handler);
  }, [refresh]);
  const feedPet = useCallback$1(async () => {
    await progressService.feedPet();
  }, []);
  const playWithPet = useCallback$1(async () => {
    await progressService.playWithPet();
  }, []);
  const toggleSleep = useCallback$1(async () => {
    await progressService.toggleSleep();
  }, []);
  return {
    state,
    isHungry,
    foodAvailable,
    hungryLevel,
    happiness,
    isSleeping: state.pet.isSleeping,
    feedPet,
    playWithPet,
    toggleSleep
  };
}

const {useState: useState$3,useEffect: useEffect$4,useCallback} = await importShared('react');

const VALID_TABS = ["home", "about", "posts", "shikaku", "sokoban", "slitherlink"];
function getTabFromHash() {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  const path = hash.replace(/^#\/?/, "");
  if (VALID_TABS.includes(path)) {
    return path;
  }
  return "home";
}
function useHashRouter() {
  const [currentTab, setCurrentTab] = useState$3(getTabFromHash);
  useEffect$4(() => {
    const handleHashChange = () => {
      setCurrentTab(getTabFromHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  const navigate = useCallback((tab) => {
    window.location.hash = tab === "home" ? "" : `#/${tab}`;
    setCurrentTab(tab);
  }, []);
  return { currentTab, navigate };
}

const GRID_ITEMS = [
  { tab: "home", key: "HM" },
  { tab: "about", key: "AB" },
  { tab: "posts", key: "PO" },
  { tab: "shikaku", key: "SH" },
  { tab: "sokoban", key: "SO" },
  { tab: "slitherlink", key: "SL" }
];
function MatrixMenu({
  currentTab,
  navigate
}) {
  const handleButtonClick = (tabName) => {
    playBeepSound(440, 0.06);
    navigate(tabName);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-cozy-border p-2 bg-black", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-press text-cozy-accent mb-2 text-center bg-cozy-muted/20 py-1", children: "COMMAND_MATRIX" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: GRID_ITEMS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => handleButtonClick(item.tab),
        className: `pixel-btn text-[9px] py-2 px-1 text-center font-press capitalize ${currentTab === item.tab ? "bg-cozy-accent text-black border-cozy-border" : "bg-transparent text-cozy-text hover:bg-cozy-muted/20"}`,
        children: [
          "[",
          item.key,
          "] ",
          item.tab
        ]
      },
      item.tab
    )) })
  ] });
}

const {useEffect: useEffect$3,useState: useState$2} = await importShared('react');

const PROGRESS_KEY = "cozyos.progress.v1";
const STATIC_POSTS = [
  { date: "2026-05-30", title: "Monochrome Amber CRT theme conversion completed" },
  { date: "2026-05-29", title: "Building Sokoban micro-frontend puzzle game" }
];
function StatsTelemetry() {
  const [shikakuSolved, setShikakuSolved] = useState$2(0);
  const [sokobanSolved, setSokobanSolved] = useState$2(0);
  const [sokobanMaxLevel, setSokobanMaxLevel] = useState$2(-1);
  useEffect$3(() => {
    try {
      const savedShikaku = localStorage.getItem("cozy_os_shikaku_save");
      if (savedShikaku) {
        const parsed = JSON.parse(savedShikaku);
        if (parsed?.completed) {
          setShikakuSolved(Object.keys(parsed.completed).length);
        }
      }
    } catch (e) {
      console.error("Failed to parse Shikaku save progress in dashboard", e);
    }
    try {
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        const parsed = JSON.parse(savedProgress);
        if (parsed?.version === 1 && Array.isArray(parsed.state?.completedLevels)) {
          const sokobanLevels = parsed.state.completedLevels.filter(
            (l) => l.module === "sokoban"
          );
          setSokobanSolved(sokobanLevels.length);
          const maxIdx = sokobanLevels.reduce((max, l) => {
            const idx = parseInt(l.levelId, 10);
            return Number.isNaN(idx) ? max : Math.max(max, idx);
          }, -1);
          setSokobanMaxLevel(maxIdx);
        }
      }
    } catch {
    }
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-cozy-border p-2 bg-black text-cozy-text font-mono text-[9px] flex flex-col gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-press text-[9px] text-cozy-accent text-center bg-cozy-muted/20 py-1", children: "USER_STATS_TELEMETRY" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1.5 leading-relaxed", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cozy-accent font-bold", children: "● SHIKAKU CORES" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "SOLVED: ",
          shikakuSolved,
          " PUZZLE(S)"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cozy-accent font-bold", children: "● SOKOBAN CARGO" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "SOLVED: ",
          sokobanSolved,
          " | BEST LEVEL: ",
          sokobanMaxLevel >= 0 ? sokobanMaxLevel + 1 : 0
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-dashed border-cozy-border pt-1.5 mt-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cozy-accent font-bold", children: "● NEWEST POSTS LOG" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "list-none flex flex-col gap-1 mt-1", children: STATIC_POSTS.map((post, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "truncate", children: [
          "[",
          post.date,
          "] ",
          post.title
        ] }, idx)) })
      ] })
    ] })
  ] });
}

const {useEffect: useEffect$2,useRef: useRef$1} = await importShared('react');

function HomeDashboard() {
  const planetCanvasRef = useRef$1(null);
  const waterfallRef = useRef$1(null);
  const oscilloscopeRef = useRef$1(null);
  useEffect$2(() => {
    const canvas = planetCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let angle = 0;
    let animId = 0;
    const draw = () => {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 45;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "#161a0e";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#ffb000";
      ctx.stroke();
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      angle += 6e-3;
      const offset = angle * 40 % 80;
      ctx.strokeStyle = "#aa7500";
      ctx.lineWidth = 1;
      for (let i = -3; i <= 3; i++) {
        ctx.beginPath();
        ctx.ellipse(cx + i * 20 + offset - 30, cy, 30, r * 0.95, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#3a2800";
      ctx.beginPath();
      ctx.arc(cx + 10, cy - 8, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx - 18, cy + 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = "#ffb000";
      ctx.lineWidth = 0.75;
      ctx.strokeRect(cx - r - 6, cy - r - 6, 8, 8);
      ctx.strokeRect(cx + r - 2, cy + r - 2, 8, 8);
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);
  useEffect$2(() => {
    const osc = oscilloscopeRef.current;
    const wf = waterfallRef.current;
    if (!osc || !wf) return;
    const oCtx = osc.getContext("2d");
    const wCtx = wf.getContext("2d");
    if (!oCtx || !wCtx) return;
    let wavePhase = 0;
    let animId = 0;
    osc.width = osc.parentElement?.clientWidth || 250;
    osc.height = osc.parentElement?.clientHeight || 65;
    wf.width = wf.parentElement?.clientWidth || 250;
    wf.height = wf.parentElement?.clientHeight || 65;
    const drawWaves = () => {
      oCtx.clearRect(0, 0, osc.width, osc.height);
      oCtx.strokeStyle = "#ffb000";
      oCtx.lineWidth = 1;
      oCtx.beginPath();
      wavePhase += 0.15;
      for (let x = 0; x < osc.width; x++) {
        const y = osc.height / 2 + Math.sin(x * 0.05 + wavePhase) * 12 + Math.sin(x * 0.12 - wavePhase * 1.5) * 4;
        if (x === 0) oCtx.moveTo(x, y);
        else oCtx.lineTo(x, y);
      }
      oCtx.stroke();
      wCtx.clearRect(0, 0, wf.width, wf.height);
      wCtx.fillStyle = "#ffb000";
      const barWidth = 4;
      const gap = 2;
      const count = Math.floor(wf.width / (barWidth + gap));
      for (let i = 0; i < count; i++) {
        const height = Math.abs(
          Math.sin(i * 0.2 + wavePhase) * Math.cos(i * 0.05 + wavePhase * 0.8)
        ) * (wf.height - 10);
        wCtx.fillRect(i * (barWidth + gap), wf.height - height, barWidth, height);
      }
      animId = requestAnimationFrame(drawWaves);
    };
    drawWaves();
    return () => cancelAnimationFrame(animId);
  }, []);
  const logs = [
    "PID  USER    MEM%  TIME+    Command",
    "051  root20  0.20  0:00.00  tail -n +0 -F /logs",
    "052  root27  0.50  0:00.21  /tools/shell/MFE_LOAD",
    "053  root20  0.26  0:00.19  /usr/bin/web-audio-init",
    "056  root28  0.23  0:00.00  /node/packages/pets/tick",
    "057  root20  0.80  0:00.05  /bin/shikaku-solver-v1"
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 h-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-cozy-border p-2 flex gap-3 items-center bg-black relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-between h-full font-mono text-[9px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[7px] text-cozy-muted uppercase", children: "Planet Designation" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-cozy-text font-bold font-press text-[9px] mb-1", children: "BYRIA-RR9" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "MASS: 6.39 x 10^23 kg" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "GRAVITY: 3.721 m/s²" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "RADIUS: 3,389.5 km" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 flex justify-center items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "canvas",
          {
            ref: planetCanvasRef,
            width: 110,
            height: 110,
            className: "max-w-full"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-cozy-border p-2 bg-black flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] font-press text-cozy-accent border-b border-cozy-border pb-1 mb-1.5 flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "SYSTEM_BOOT_LOGS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cozy-text text-[8px] animate-pulse", children: "● ONLINE" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[9px] text-cozy-text leading-tight overflow-hidden whitespace-pre", children: logs.join("\n") })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-cozy-border p-2 bg-black flex flex-col h-[100px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[8px] font-mono text-cozy-accent border-b border-cozy-border pb-1 mb-1 flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Transmissions Scanning" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cozy-text font-bold", children: "1285 kHz" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: waterfallRef, className: "w-full h-full block bg-black/40" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-cozy-border p-2 bg-black flex flex-col h-[100px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[8px] font-mono text-cozy-accent border-b border-cozy-border pb-1 mb-1 flex justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Incoming Signal Wave" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cozy-text font-bold", children: "Channel: 98" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-h-0 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("canvas", { ref: oscilloscopeRef, className: "w-full h-full block bg-black/40" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-cozy-border p-2 bg-black flex flex-col justify-between h-[100px] font-mono text-[9px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-press text-cozy-accent border-b border-cozy-border pb-1 mb-1", children: "BROADCAST_TOWERS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 text-[8px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: "https://github.com/prxxie",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "hover:underline flex justify-between",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "BRT-743-T (GITHUB)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cozy-text", children: "ONLINE" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: "https://twitter.com",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "hover:underline flex justify-between",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "AEW-DYM-Y (TWITTER)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cozy-text", children: "STABLE" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-cozy-muted", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "RT-GPT-05 (LOCAL)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "RSSI: -83dBm" })
          ] })
        ] })
      ] })
    ] })
  ] });
}

function PetSprite({
  size = 16,
  stage = 1,
  status = "idle",
  isSleeping = false,
  isHungry = false,
  // direction is kept in props signature for API compatibility but unused in SVG render rules
  animationFrame = 0,
  className = ""
}) {
  const isEating = status === "eating";
  const isPlaying = status === "playing";
  const isMoving = status === "moving";
  const bounceClass = isPlaying || isMoving ? "animate-bounce" : "";
  const wiggleStyle = isMoving || status === "idle" && animationFrame === 1 ? { transform: "rotate(3deg)", transformOrigin: "bottom center" } : {};
  const renderStageSprite = () => {
    switch (stage) {
      case 1:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "3", width: "6", height: "10", rx: "3", fill: "#eeeecc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "5", width: "8", height: "7", rx: "2", fill: "#eeeecc" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isEating && animationFrame === 0 ? "7" : "6", y: "5", width: "2", height: "2", fill: "#44aa44" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isEating && animationFrame === 0 ? "8" : "9", y: "8", width: "2", height: "2", fill: "#44aa44" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "10", width: "2", height: "1", fill: "#44aa44" })
        ] });
      case 2: {
        const leafColor = isHungry ? "#cccc33" : "#33aa33";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "rect",
            {
              x: "3",
              y: animationFrame === 0 ? "10" : "9",
              width: "2",
              height: "2",
              fill: "#88cc88"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "7", width: "7", height: "6", rx: "2", fill: "#88cc88" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "9", width: "9", height: "3", fill: "#88cc88" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isMoving && animationFrame === 0 ? "4" : "5", y: "13", width: "2", height: "1", fill: "#448844" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isMoving && animationFrame === 1 ? "11" : "10", y: "13", width: "2", height: "1", fill: "#448844" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "8", y: animationFrame === 0 ? "5" : "6", width: "2", height: "2", fill: leafColor }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: animationFrame === 0 ? "4" : "5", width: "2", height: "2", fill: leafColor }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "8", y: "7", width: "1", height: "1", fill: "#448844" }),
          " ",
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: isEating && animationFrame === 0 ? "2" : "3", width: "3", height: "3", rx: "1", fill: "#ff66aa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "5", width: "5", height: "1", fill: "#338833" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "6", width: "9", height: "7", rx: "2", fill: "#55aaaa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "8", width: "11", height: "4", fill: "#55aaaa" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isMoving && animationFrame === 0 ? "3" : "4", y: "13", width: "2", height: "1", fill: "#227777" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: isMoving && animationFrame === 1 ? "12" : "11", y: "13", width: "2", height: "1", fill: "#227777" }),
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: animationFrame === 0 ? "2" : "3", width: "7", height: "3", fill: "#ff4488" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: animationFrame === 0 ? "1" : "2", width: "3", height: "1", fill: "#ffcc00" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "6", width: "11", height: "7", rx: "2", fill: "#2d6a6a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "13", y: "8", width: "2", height: "2", fill: "#2d6a6a" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "14", y: isPlaying && animationFrame === 0 ? "5" : "6", width: "2", height: "2", fill: "#226622" }),
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
        const floatOffset = animationFrame === 0 ? -1 : 1;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("g", { style: { transform: `translateY(${floatOffset}px)` }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "11", width: "1", height: "1", fill: "#ffff99", opacity: animationFrame === 0 ? 0.3 : 0.8 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "14", y: "4", width: "1", height: "1", fill: "#ffff99", opacity: animationFrame === 0 ? 0.8 : 0.3 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "13", y: "11", width: "1", height: "1", fill: "#ffff99", opacity: animationFrame === 0 ? 0.4 : 0.9 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: animationFrame === 0 ? "M 3,6 L 0,2 L 1,7 Z" : "M 3,6 L 0,4 L 1,8 Z", fill: "#33aa33" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: animationFrame === 0 ? "M 13,6 L 16,2 L 15,7 Z" : "M 13,6 L 16,4 L 15,8 Z", fill: "#33aa33" }),
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

const {useEffect: useEffect$1,useState: useState$1} = await importShared('react');
const MESSAGES = [
  "LOADING...",
  "PET IS WARMING UP...",
  "FETCHING MODULES...",
  "ALMOST THERE...",
  "BOOTING SYSTEM...",
  "PET IS EXCITED!"
];
function MfeLoader({ petStage = 1 }) {
  const [msgIdx, setMsgIdx] = useState$1(0);
  const [dots, setDots] = useState$1("");
  const [frame, setFrame] = useState$1(0);
  useEffect$1(() => {
    const t = setInterval(() => {
      setMsgIdx((i) => (i + 1) % MESSAGES.length);
    }, 1200);
    return () => clearInterval(t);
  }, []);
  useEffect$1(() => {
    const t = setInterval(() => {
      setDots((d) => d.length >= 3 ? "" : d + ".");
    }, 400);
    return () => clearInterval(t);
  }, []);
  useEffect$1(() => {
    const t = setInterval(() => {
      setFrame((f) => (f + 1) % 2);
    }, 500);
    return () => clearInterval(t);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center min-h-[350px] gap-6 select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute rounded-full animate-ping",
          style: {
            width: 80,
            height: 80,
            background: "radial-gradient(circle, rgba(255,176,0,0.15) 0%, transparent 70%)",
            animationDuration: "1.5s"
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full animate-pulse",
          style: {
            width: 40,
            height: 6,
            background: "rgba(255,176,0,0.2)",
            filter: "blur(4px)",
            bottom: -8
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-bounce", style: { animationDuration: "0.8s" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        PetSprite,
        {
          size: 72,
          stage: petStage,
          status: "playing",
          animationFrame: frame
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: "font-press text-[9px] text-cozy-accent",
          style: { minWidth: "16ch", textAlign: "center", letterSpacing: "0.05em" },
          children: [
            MESSAGES[msgIdx].replace(/\.\.\.$/, ""),
            dots
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "border border-cozy-border bg-black overflow-hidden",
          style: { width: 120, height: 6 },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full bg-cozy-accent",
              style: {
                animation: "mfe-progress-slide 1.2s ease-in-out infinite alternate"
              }
            }
          )
        }
      )
    ] })
  ] });
}

const {useState,useEffect,useRef,lazy,Suspense} = await importShared('react');
const {QueryClient,QueryClientProvider} = await importShared('@tanstack/react-query');
const queryClient = new QueryClient();
const AboutApp = lazy(
  () => __federation_method_getRemote("about" , "./AboutApp").then(module=>__federation_method_wrapDefault(module, true)).catch(() => ({
    default: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Fallback, { name: "About" })
  }))
);
const PostsApp = lazy(
  () => __federation_method_getRemote("posts" , "./PostsApp").then(module=>__federation_method_wrapDefault(module, true)).catch(() => ({
    default: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Fallback, { name: "Posts" })
  }))
);
const PetsApp = lazy(
  () => __federation_method_getRemote("pets" , "./PetsApp").then(module=>__federation_method_wrapDefault(module, true)).catch(() => ({
    default: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Fallback, { name: "Pets" })
  }))
);
const ShikakuApp = lazy(
  () => __federation_method_getRemote("shikaku" , "./ShikakuApp").then(module=>__federation_method_wrapDefault(module, true)).catch(() => ({
    default: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Fallback, { name: "Shikaku" })
  }))
);
const SokobanApp = lazy(
  () => __federation_method_getRemote("sokoban" , "./SokobanApp").then(module=>__federation_method_wrapDefault(module, true)).catch(() => ({
    default: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Fallback, { name: "Sokoban" })
  }))
);
const SlitherlinkApp = lazy(
  () => __federation_method_getRemote("slitherlink" , "./SlitherlinkApp").then(module=>__federation_method_wrapDefault(module, true)).catch(() => ({
    default: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Fallback, { name: "Slitherlink" })
  }))
);
function Fallback({ name }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-2 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-press text-[10px] text-red-600", children: "⚠ MFE LOAD ERROR" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-center", children: [
      "Remote `",
      name,
      "` is offline."
    ] })
  ] });
}
function App() {
  const { currentTab, navigate } = useHashRouter();
  const windowRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileHudOpen, setIsMobileHudOpen] = useState(false);
  const progressService = useProgressService();
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (windowRef.current) {
        windowRef.current.requestFullscreen().catch((err) => {
          console.error("Failed to enter fullscreen mode:", err);
        });
      }
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Failed to exit fullscreen mode:", err);
      });
    }
  };
  const renderMainContent = () => {
    switch (currentTab) {
      case "about":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AboutApp, {});
      case "posts":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PostsApp, {});
      case "shikaku":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ShikakuApp, {});
      case "sokoban":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SokobanApp, {});
      case "slitherlink":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SlitherlinkApp, {});
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(HomeDashboard, {});
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full flex justify-center min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    ConsoleFrame,
    {
      currentTab,
      setTab: navigate,
      onMobileHud: () => setIsMobileHudOpen(true),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-20 gap-6 items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              ref: windowRef,
              className: "col-span-1 md:col-span-13 retro-window",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "window-header", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PixelBookIcon, { className: "w-3.5 h-3.5" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "window-header-accent", children: [
                      currentTab.toUpperCase(),
                      "_VIEW"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: toggleFullscreen,
                        className: "text-cozy-accent font-bold cursor-pointer hover:underline bg-transparent border-none p-0 font-press text-[9px]",
                        "aria-label": "Toggle Fullscreen",
                        children: isFullscreen ? "[🗗]" : "[⛶]"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cozy-accent font-bold cursor-pointer", children: "[X]" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "window-body min-h-[350px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Suspense,
                  {
                    fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(MfeLoader, { petStage: progressService.state.pet.stage }),
                    children: renderMainContent()
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex md:col-span-7 flex-col gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MatrixMenu, { currentTab, navigate }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "retro-window", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "window-header", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PixelPawIcon, { className: "w-3.5 h-3.5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "window-header-accent", children: "PET_HUD" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cozy-accent font-bold cursor-pointer", children: "[-]" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "window-body p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(MfeLoader, { petStage: progressService.state.pet.stage }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(PetsApp, { progressState: progressService }) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatsTelemetry, {})
          ] })
        ] }),
        isMobileHudOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "fixed inset-0 bg-black/75 z-45 md:hidden",
            onClick: () => setIsMobileHudOpen(false)
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `fixed top-0 right-0 bottom-0 w-80 bg-black border-l border-cozy-border z-50 p-4 flex flex-col gap-4 transition-transform duration-300 md:hidden ${isMobileHudOpen ? "translate-x-0" : "translate-x-full"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-dashed border-cozy-border pb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-press text-[9px] text-cozy-text flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PixelPawIcon, { className: "w-3.5 h-3.5" }),
                  " MOBILE_HUD"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setIsMobileHudOpen(false),
                    className: "text-cozy-text font-bold cursor-pointer font-press text-[9px] bg-transparent border-none",
                    children: "[X]"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                MatrixMenu,
                {
                  currentTab,
                  navigate: (tab) => {
                    navigate(tab);
                    setIsMobileHudOpen(false);
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto flex flex-col gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-cozy-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(MfeLoader, { petStage: progressService.state.pet.stage }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(PetsApp, { progressState: progressService }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(StatsTelemetry, {})
              ] })
            ]
          }
        )
      ]
    }
  ) }) });
}

const React = await importShared('react');
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}
client.createRoot(rootElement).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
