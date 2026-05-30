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
  'sokoban':{url:'/mfe/sokoban/assets/remoteEntry.js',format:'esm',from:'vite'}
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

const PixelFolderIcon = ({ className = "w-4 h-4 inline-block" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "square", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 3h4l2 2h8v8H1V3z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "1", y1: "5", x2: "15", y2: "5" })
] });
const PixelBookIcon = ({ className = "w-4 h-4 inline-block" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinecap: "square", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M1 2h6v11H1V2z M9 2h6v11H9V2z" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "3", y1: "5", x2: "5", y2: "5" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "3", y1: "8", x2: "5", y2: "8" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "11", y1: "5", x2: "13", y2: "5" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "11", y1: "8", x2: "13", y2: "8" })
] });
const PixelPawIcon = ({ className = "w-4 h-4 inline-block" }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className, viewBox: "0 0 16 16", fill: "currentColor", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "7", y: "7", width: "2", height: "3" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "4", y: "9", width: "2", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "10", y: "9", width: "2", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "5", y: "4", width: "2", height: "2" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "9", y: "4", width: "2", height: "2" })
] });

const {create: create$1} = await importShared('zustand');

const useUiStore = create$1()((set) => ({
  isMenuOpen: false,
  setMenuOpen: (isOpen) => set({ isMenuOpen: isOpen }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen }))
}));

const {useEffect: useEffect$1} = await importShared('react');
const NAV_ITEMS = [
  { id: "home", label: "HOME" },
  { id: "about", label: "ABOUT" },
  { id: "posts", label: "POSTS" },
  { id: "pets", label: "PETS" },
  { id: "shikaku", label: "SHIKAKU" },
  { id: "sokoban", label: "SOKOBAN" }
];
function ConsoleFrame({
  children,
  currentTab,
  setTab
}) {
  const isMenuOpen = useUiStore((state) => state.isMenuOpen);
  const setMenuOpen = useUiStore((state) => state.setMenuOpen);
  const toggleMenu = useUiStore((state) => state.toggleMenu);
  useEffect$1(() => {
    if (isMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMenuOpen]);
  useEffect$1(() => {
    if (!isMenuOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, setMenuOpen]);
  const handleTabClick = (tabName) => {
    setTab(tabName);
    setMenuOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full min-h-screen flex flex-col bg-cozy-bg box-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "bg-black border-b-4 border-cozy-border p-3 shadow-[0_3px_0px_var(--color-cozy-accent)] box-border w-full relative z-30", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto flex justify-between items-center w-full px-4 box-border", children: [
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-press text-xs font-bold text-cozy-accent", children: "PRXXIE" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden md:flex gap-2", children: NAV_ITEMS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => handleTabClick(item.id),
          className: `pixel-btn text-[9px] px-3 py-1 ${currentTab === item.id ? "bg-cozy-accent text-cozy-bg border-cozy-border shadow-none translate-y-[2px]" : ""}`,
          children: item.label
        },
        item.id
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: toggleMenu,
          className: "md:hidden pixel-btn text-[9px] px-3 py-1",
          "aria-expanded": isMenuOpen,
          "aria-controls": "mobile-menu-drawer",
          "aria-label": "Toggle navigation menu",
          children: "[MENU]"
        }
      )
    ] }) }),
    isMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 bg-black/45 z-40 md:hidden animate-[fade-in_0.2s_ease-out]",
        onClick: () => setMenuOpen(false),
        "aria-hidden": "true"
      }
    ),
    isMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        id: "mobile-menu-drawer",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Navigation menu",
        className: "fixed top-0 right-0 bottom-0 w-64 bg-black border-l-4 border-cozy-border z-50 p-4 flex flex-col gap-4 shadow-[-4px_0_0_var(--color-cozy-border)] animate-[slideIn_0.2s_ease-out] md:hidden",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b-2 border-dashed border-cozy-border pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-press text-[10px] text-cozy-accent flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PixelFolderIcon, { className: "w-3.5 h-3.5" }),
              " MENU"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setMenuOpen(false),
                className: "text-cozy-accent font-bold cursor-pointer font-press text-[10px] bg-transparent border-none",
                "aria-label": "Close navigation menu",
                children: "[X]"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-col gap-3", children: NAV_ITEMS.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleTabClick(item.id),
              className: `pixel-btn w-full text-[10px] text-left py-2 px-3 ${currentTab === item.id ? "bg-cozy-accent text-cozy-bg border-cozy-border shadow-none" : ""}`,
              children: [
                currentTab === item.id ? "[x]" : "[ ]",
                " ",
                item.label
              ]
            },
            item.id
          )) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "w-full max-w-5xl mx-auto flex-1 px-4 py-6 box-border", children })
  ] });
}

const {create} = await importShared('zustand');

const usePetStore = create()((set) => ({
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
  setStatus: (status) => set({ status }),
  tick: () => set((state) => {
    const nextHunger = Math.min(
      100,
      state.hunger + (state.isSleeping ? 2 : 5)
    );
    const nextHappiness = Math.max(
      0,
      state.happiness - (state.isSleeping ? 1 : 5)
    );
    let nextStatus = state.status;
    if (state.status === "eating" || state.status === "playing") {
      nextStatus = "idle";
    }
    if (state.isSleeping) {
      nextStatus = "sleeping";
    }
    return {
      ...state,
      hunger: nextHunger,
      happiness: nextHappiness,
      status: nextStatus
    };
  })
}));

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
  const [tab, setTab] = useState("home");
  const tick = usePetStore((state) => state.tick);
  const windowRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPetHudOpen, setIsPetHudOpen] = useState(false);
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
  useEffect(() => {
    const timer = setInterval(() => {
      tick();
    }, 5e3);
    return () => clearInterval(timer);
  }, [tick]);
  const renderMainContent = () => {
    switch (tab) {
      case "about":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AboutApp, {});
      case "posts":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PostsApp, {});
      case "pets":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PetsApp, { usePetStore });
      case "shikaku":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(ShikakuApp, {});
      case "sokoban":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(SokobanApp, {});
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-press text-[14px] mb-4 text-cozy-accent", children: "WELCOME HOME" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "I am prxxie. This is my responsive retro dashboard workspace. Swivel tabs above to see more sections!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-12 h-12 bg-cozy-accent mt-6 animate-bounce",
              style: {
                clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)"
              }
            }
          )
        ] });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full flex justify-center min-h-screen", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ConsoleFrame, { currentTab: tab, setTab, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-20 gap-6 items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          ref: windowRef,
          className: `col-span-1 ${tab === "pets" ? "md:col-span-20" : "md:col-span-13"} retro-window`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "window-header", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PixelBookIcon, { className: "w-3.5 h-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "window-header-accent", children: [
                  tab.toUpperCase(),
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
                fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-press text-center pt-10 text-[8px]", children: "LOADING MFE..." }),
                children: renderMainContent()
              }
            ) })
          ]
        }
      ),
      tab !== "pets" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex md:col-span-7 retro-window", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "window-header", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PixelPawIcon, { className: "w-3.5 h-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "window-header-accent", children: "PET_HUD" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-cozy-accent font-bold cursor-pointer", children: "[-]" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "window-body min-h-[350px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-press text-center pt-10 text-[8px]", children: "LOADING PET..." }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(PetsApp, { usePetStore }) }) })
      ] })
    ] }),
    tab !== "pets" && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setIsPetHudOpen(true),
        className: "md:hidden fixed bottom-6 right-6 z-40 pixel-btn text-[9px] shadow-lg",
        children: "[ PET HUD ]"
      }
    ),
    isPetHudOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/75 z-45 md:hidden", onClick: () => setIsPetHudOpen(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: `fixed top-0 right-0 bottom-0 w-80 bg-black border-l-4 border-cozy-border z-50 p-4 flex flex-col shadow-2xl transition-transform duration-300 md:hidden
              ${isPetHudOpen ? "translate-x-0" : "translate-x-full"}
            `,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b-2 border-dashed border-cozy-border pb-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-press text-[9px] text-cozy-text flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PixelPawIcon, { className: "w-3.5 h-3.5" }),
              " PET_HUD"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setIsPetHudOpen(false),
                className: "text-cozy-text font-bold cursor-pointer font-press text-[9px] bg-transparent border-none",
                children: "[X]"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-press text-center pt-10 text-[8px]", children: "LOADING PET..." }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(PetsApp, { usePetStore }) }) })
        ]
      }
    )
  ] }) }) });
}

const React = await importShared('react');
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}
client.createRoot(rootElement).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
