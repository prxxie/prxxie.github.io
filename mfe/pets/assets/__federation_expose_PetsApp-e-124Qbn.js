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

const PixelChickenIcon = ({ className = "w-4 h-4 inline-block" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className, viewBox: "0 0 16 16", fill: "currentColor", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "1", width: "2", height: "3" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "4", width: "3", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "11", y: "4", width: "3", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "5", width: "6", height: "6" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "6", width: "8", height: "4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "9", width: "3", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "11", y: "9", width: "3", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "12", width: "2", height: "3" })
] });

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

const EVOLUTION_THRESHOLDS = [0, 10, 30, 60, 100];

const {useEffect,useState} = await importShared('react');
const getAsciiBar = (value) => {
  const totalSegments = 12;
  const filledSegments = Math.round(value / 100 * totalSegments);
  const emptySegments = totalSegments - filledSegments;
  return `[${"█".repeat(filledSegments)}${"░".repeat(emptySegments)}] ${value}%`;
};
const getStageName = (stage) => {
  switch (stage) {
    case 1:
      return "EGG";
    case 2:
      return "LEAFY SPROUT";
    case 3:
      return "BUDREPTILE";
    case 4:
      return "FLORASAUR";
    case 5:
      return "MEGA FLORASAUR";
    default:
      return "UNKNOWN";
  }
};
const getStageLore = (stage) => {
  switch (stage) {
    case 1:
      return "A mysterious egg pulsing with green energy.";
    case 2:
      return "A tiny sprout! It wiggles when happy.";
    case 3:
      return "A leafy reptile — strong and determined!";
    case 4:
      return "A magnificent forest dinosaur with a blossomed flower.";
    case 5:
      return "Mega-Evolved Legend! Emits a glowing aura on leaf wings.";
    default:
      return "A mysterious digital creature.";
  }
};
const getXpToNextStage = (stage) => {
  return EVOLUTION_THRESHOLDS[stage] ?? EVOLUTION_THRESHOLDS[EVOLUTION_THRESHOLDS.length - 1];
};
function PetsApp({
  progressState
}) {
  const hasProgress = !!progressState;
  const petState = progressState?.state.pet ?? { xp: 0, stage: 1};
  const foodAvailable = progressState?.foodAvailable ?? 0;
  const isHungry = progressState?.isHungry ?? false;
  const hungryLevel = progressState?.hungryLevel ?? 0;
  const happiness = progressState?.happiness ?? 50;
  const [spriteStatus, setSpriteStatus] = useState("idle");
  const [animationFrame, setAnimationFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationFrame((f) => (f + 1) % 2);
    }, 1e3);
    return () => clearInterval(timer);
  }, []);
  const handleFeed = async () => {
    if (!hasProgress) return;
    await progressState.feedPet();
    setSpriteStatus("eating");
    setTimeout(() => setSpriteStatus("idle"), 2e3);
  };
  const canFeed = isHungry && foodAvailable > 0;
  const hungerPct = Math.max(0, 100 - Math.round(hungryLevel / 6 * 100));
  const currentStageXpFloor = EVOLUTION_THRESHOLDS[petState.stage - 1] ?? 0;
  const nextStageXp = getXpToNextStage(petState.stage);
  const xpRange = nextStageXp - currentStageXpFloor;
  const xpProgress = xpRange > 0 ? Math.min(100, Math.round((petState.xp - currentStageXpFloor) / xpRange * 100)) : 100;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-between h-full py-4 px-2 box-border text-cozy-text font-mono", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full border-b border-dashed border-cozy-border pb-2 mb-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-press text-xs text-cozy-text", children: "PET STATUS CONSOLE" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[8px] text-cozy-accent mt-1", children: hasProgress ? "SYSTEM SYNC: ACTIVE" : "STANDALONE MODE" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-6 w-full items-center justify-center flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border border-cozy-border bg-black rounded flex items-center justify-center w-40 h-40 relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-2 text-[10px] text-cozy-text font-mono select-none", children: "+" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 right-2 text-[10px] text-cozy-text font-mono select-none", children: "+" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-1 left-2 text-[10px] text-cozy-text font-mono select-none", children: "+" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-1 right-2 text-[10px] text-cozy-text font-mono select-none", children: "+" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            PetSprite,
            {
              size: 120,
              stage: petState.stage,
              status: spriteStatus,
              isSleeping: false,
              isHungry,
              animationFrame
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-press text-[9px] block text-cozy-accent", children: getStageName(petState.stage) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[8px] max-w-[160px] block mt-1 leading-normal text-cozy-text opacity-85 italic", children: [
            "“",
            getStageLore(petState.stage),
            "”"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col gap-4 max-w-xs w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 text-[10px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "XP PROGRESS:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              petState.xp,
              " XP"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-cozy-border h-2.5 bg-black p-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "bg-cozy-accent h-full transition-all duration-500",
              style: { width: `${xpProgress}%` }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] text-cozy-text opacity-60 text-right", children: petState.stage < 5 ? `→ STAGE ${petState.stage + 1} at ${nextStageXp} XP` : "MAX EVOLUTION REACHED ★" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "HUNGER (FULLNESS):" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getAsciiBar(hungerPct) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "HAPPINESS:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: getAsciiBar(happiness) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "STATUS:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: isHungry ? "text-yellow-400" : "text-green-400", children: isHungry ? "HUNGRY 🍽" : "CONTENT ✓" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-dashed border-cozy-border pt-4 flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[9px] mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "AVAILABLE FOOD:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-cozy-accent", children: [
              "★ x ",
              foodAvailable
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                void handleFeed();
              },
              disabled: !canFeed || !hasProgress,
              className: "pixel-btn text-[8px] py-1.5 w-full flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text disabled:opacity-40 disabled:pointer-events-none",
              children: [
                canFeed ? "FEED STAR-FOOD" : isHungry ? "NO STAR-FOOD" : "NOT HUNGRY",
                /* @__PURE__ */ jsxRuntimeExports.jsx(PixelChickenIcon, { className: "w-3.5 h-3.5" })
              ]
            }
          )
        ] })
      ] })
    ] })
  ] });
}

export { PetsApp as default, jsxRuntimeExports as j };
