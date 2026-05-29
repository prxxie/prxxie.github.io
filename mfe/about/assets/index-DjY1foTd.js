import { importShared } from './__federation_fn_import-DRpujy9w.js';
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
const {useState} = React;

function AboutApp() {
  const [openFolder, setOpenFolder] = useState(null);
  const skills = [
    { name: "React", level: 9 },
    { name: "Tailwind CSS", level: 8 },
    { name: "Zustand / Redux", level: 7 },
    { name: "GitHub Actions", level: 6 }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full gap-2 overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1", children: "🗄️ BIO DIRECTORY" }),
    openFolder === null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: () => setOpenFolder("bio"), className: "border-2 border-cozy-border p-2 bg-[#f0f9f2] cursor-pointer hover:bg-[#d5eedb]", children: "📁 [BIO] - Who is prxxie?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: () => setOpenFolder("skills"), className: "border-2 border-cozy-border p-2 bg-[#f0f9f2] cursor-pointer hover:bg-[#d5eedb]", children: "📁 [SKILLS] - Character Stats" })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setOpenFolder(null), className: "pixel-btn text-[8px] py-1 px-2 mb-2", children: "🔙 BACK" }),
      openFolder === "bio" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-cozy-border p-3 bg-white text-sm leading-relaxed", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "NAME:" }),
          " prxxie"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "CLASS:" }),
          " Web Developer"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Hello! I build highly interactive websites. I love combining clean engineering practices (like micro frontends) with rich visual game designs." })
      ] }),
      openFolder === "skills" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-cozy-border p-3 bg-white text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold mb-2", children: "CHARACTER LEVELS:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2", children: skills.map((skill) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between font-bold text-xs mb-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: skill.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "LV.",
              skill.level
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 border-2 border-cozy-border bg-gray-100 relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full bg-cozy-accent",
              style: { width: `${skill.level * 10}%` }
            }
          ) })
        ] }, skill.name)) })
      ] })
    ] })
  ] });
}

export { AboutApp as default };
