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
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "4", width: "6", height: "6" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "5", width: "8", height: "4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "8", y: "10", width: "2", height: "3" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "12", width: "4", height: "2" })
] });
const PixelBearIcon = ({ className = "w-4 h-4 inline-block" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className, viewBox: "0 0 16 16", fill: "currentColor", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "3", width: "3", height: "3" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "3", width: "3", height: "3" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "5", width: "8", height: "8" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "8", width: "1", height: "1", fill: "#fff" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "8", width: "1", height: "1", fill: "#fff" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "10", width: "2", height: "1" })
] });
const PixelMoonIcon = ({ className = "w-4 h-4 inline-block" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className, viewBox: "0 0 16 16", fill: "currentColor", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "2", width: "4", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "4", width: "4", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "6", width: "3", height: "4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "10", width: "4", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "12", width: "4", height: "2" })
] });
const PixelSunIcon = ({ className = "w-4 h-4 inline-block" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className, viewBox: "0 0 16 16", fill: "currentColor", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "6", width: "4", height: "4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "2", width: "2", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "12", width: "2", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "7", width: "2", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "12", y: "7", width: "2", height: "2" })
] });
const PixelHeartIcon = ({ className = "w-4 h-4 inline-block" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className, viewBox: "0 0 16 16", fill: "currentColor", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "3", y: "3", width: "3", height: "3" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "3", width: "3", height: "3" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "2", y: "6", width: "12", height: "4" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "10", width: "8", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "12", width: "4", height: "2" })
] });

const {useEffect,useState} = await importShared('react');
const {create} = await importShared('zustand');

const useLocalStore = create()((set) => ({
  hunger: 50,
  happiness: 50,
  status: "idle",
  isSleeping: false,
  feed: () => set((state) => {
    if (state.isSleeping) return state;
    return {
      ...state,
      hunger: Math.max(0, state.hunger - 20),
      status: "eating"
    };
  }),
  play: () => set((state) => {
    if (state.isSleeping) return state;
    return {
      ...state,
      happiness: Math.min(100, state.happiness + 20),
      status: "playing"
    };
  }),
  toggleSleep: () => set((state) => ({
    isSleeping: !state.isSleeping,
    status: !state.isSleeping ? "sleeping" : "idle"
  })),
  setStatus: (status) => set({ status })
}));
const getAsciiBar = (value) => {
  const totalSegments = 12;
  const filledSegments = Math.round(value / 100 * totalSegments);
  const emptySegments = totalSegments - filledSegments;
  return `[${"█".repeat(filledSegments)}${"░".repeat(emptySegments)}] ${value}%`;
};
function PetsApp({
  usePetStore
}) {
  const store = usePetStore || useLocalStore;
  const hunger = store((state) => state.hunger);
  const happiness = store((state) => state.happiness);
  const status = store((state) => state.status);
  const isSleeping = store((state) => state.isSleeping);
  const feed = store((state) => state.feed);
  const play = store((state) => state.play);
  const toggleSleep = store((state) => state.toggleSleep);
  const setStatus = store((state) => state.setStatus);
  const [animationFrame, setAnimationFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationFrame((f) => (f + 1) % 2);
    }, 1e3);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (status === "eating" || status === "playing") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 2e3);
      return () => clearTimeout(timer);
    }
  }, [status, setStatus]);
  const renderPetSprite = () => {
    let color = "oklch(20.8% 0.042 265.755)";
    if (status === "eating") color = "#CC6666";
    if (status === "playing") color = "#CC6666";
    if (isSleeping) color = "#779988";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        viewBox: "0 0 16 16",
        className: `w-28 h-28 ${status === "playing" ? "animate-bounce" : ""}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "4", width: "8", height: "8", fill: color }),
          animationFrame === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "rect",
              {
                x: "4",
                y: "12",
                width: "2",
                height: "2",
                fill: "var(--color-cozy-border)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "rect",
              {
                x: "10",
                y: "12",
                width: "2",
                height: "2",
                fill: "var(--color-cozy-border)"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "rect",
              {
                x: "5",
                y: "12",
                width: "2",
                height: "2",
                fill: "var(--color-cozy-border)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "rect",
              {
                x: "9",
                y: "12",
                width: "2",
                height: "2",
                fill: "var(--color-cozy-border)"
              }
            )
          ] }),
          !isSleeping ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "6", width: "1", height: "1", fill: "#fff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "6", width: "1", height: "1", fill: "#fff" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "rect",
              {
                x: "7",
                y: "9",
                width: "2",
                height: "1",
                fill: "var(--color-cozy-border)"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "rect",
              {
                x: "5",
                y: "7",
                width: "2",
                height: "1",
                fill: "var(--color-cozy-border)"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "rect",
              {
                x: "9",
                y: "7",
                width: "2",
                height: "1",
                fill: "var(--color-cozy-border)"
              }
            )
          ] })
        ]
      }
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-between h-full py-2 box-border", children: [
    !usePetStore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-xs font-press bg-black border border-cozy-border p-2 mb-2 box-border items-center text-cozy-text", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PixelChickenIcon, { className: "w-3.5 h-3.5" }),
        " HNG: ",
        hunger
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PixelHeartIcon, { className: "w-3.5 h-3.5" }),
        " HPP: ",
        happiness
      ] })
    ] }),
    usePetStore && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex flex-col gap-2 text-xs font-mono mb-4 text-cozy-text", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "HUNGER:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: getAsciiBar(hunger) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "HAPPINESS:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono", children: getAsciiBar(happiness) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `p-4 border border-cozy-border bg-black rounded flex items-center justify-center w-36 h-36 relative overflow-hidden`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 left-2 text-[10px] text-cozy-text font-mono select-none", children: "+" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1 right-2 text-[10px] text-cozy-text font-mono select-none", children: "+" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-1 left-2 text-[10px] text-cozy-text font-mono select-none", children: "+" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-1 right-2 text-[10px] text-cozy-text font-mono select-none", children: "+" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { filter: "sepia(1) saturate(5) hue-rotate(5deg) brightness(1.2)" }, children: renderPetSprite() }),
          isSleeping && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 right-2 text-cozy-text font-press text-[8px] animate-pulse", children: "ZZZ..." })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 w-full mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: feed,
          className: "pixel-btn text-[8px] flex-1 py-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text",
          children: [
            "FEED ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(PixelChickenIcon, { className: "w-3.5 h-3.5" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: play,
          className: "pixel-btn text-[8px] flex-1 py-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text",
          children: [
            "PLAY ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(PixelBearIcon, { className: "w-3.5 h-3.5" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: toggleSleep,
          className: "pixel-btn text-[8px] flex-1 py-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text",
          children: isSleeping ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "WAKE ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(PixelSunIcon, { className: "w-3.5 h-3.5" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "SLEEP ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(PixelMoonIcon, { className: "w-3.5 h-3.5" })
          ] })
        }
      )
    ] })
  ] });
}

export { PetsApp as default, jsxRuntimeExports as j };
