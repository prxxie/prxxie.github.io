import { importShared } from './__federation_fn_import-IAOfKW3J.js';
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

const React = await importShared('react');
const {useEffect,useState} = React;

const {create} = await importShared('zustand');

const useLocalStore = create((set) => ({
  hunger: 50,
  happiness: 50,
  status: "idle",
  isSleeping: false,
  feed: () => set((state) => {
    if (state.isSleeping) return {};
    return { hunger: Math.max(0, state.hunger - 20), status: "eating" };
  }),
  play: () => set((state) => {
    if (state.isSleeping) return {};
    return { happiness: Math.min(100, state.happiness + 20), status: "playing" };
  }),
  toggleSleep: () => set((state) => ({ isSleeping: !state.isSleeping, status: !state.isSleeping ? "sleeping" : "idle" })),
  setStatus: (status) => set({ status })
}));
function PetsApp({ usePetStore }) {
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
    let color = "#2b4c3f";
    if (status === "eating") color = "#996633";
    if (status === "playing") color = "#2b4c3f";
    if (isSleeping) color = "#779988";
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 16 16", className: `w-28 h-28 ${status === "playing" ? "animate-bounce" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "4", width: "8", height: "8", fill: color }),
      animationFrame === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "12", width: "2", height: "2", fill: "#000" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "12", width: "2", height: "2", fill: "#000" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "12", width: "2", height: "2", fill: "#000" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "12", width: "2", height: "2", fill: "#000" })
      ] }),
      !isSleeping ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "6", y: "6", width: "1", height: "1", fill: "#fff" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "6", width: "1", height: "1", fill: "#fff" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "9", width: "2", height: "1", fill: "#000" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "7", width: "2", height: "1", fill: "#000" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "7", width: "2", height: "1", fill: "#000" })
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-between h-full py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1 w-full text-center", children: "🐾 TAMAGOTCHI ROOM" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 text-xs font-press bg-[#d7ecd9] border-2 border-cozy-border p-1 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "🍔 HNG: ",
        hunger
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "💖 HPP: ",
        happiness
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-4 border-4 border-cozy-border bg-white rounded flex items-center justify-center w-36 h-36 relative ${isSleeping ? "bg-slate-900" : ""}`, children: [
      renderPetSprite(),
      isSleeping && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 right-2 text-white font-press text-[8px] animate-pulse", children: "Zzz..." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: feed, className: "pixel-btn text-[8px] flex-1 py-1", children: "FEED 🍗" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: play, className: "pixel-btn text-[8px] flex-1 py-1", children: "PLAY 🧸" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleSleep, className: "pixel-btn text-[8px] flex-1 py-1", children: isSleeping ? "WAKE ☀" : "SLEEP 🌙" })
    ] })
  ] });
}

export { PetsApp as default };
