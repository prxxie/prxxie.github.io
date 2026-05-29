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
'about':{url:'./mfe/about/assets/remoteEntry.js',format:'esm',from:'vite'},
  'posts':{url:'./mfe/posts/assets/remoteEntry.js',format:'esm',from:'vite'},
  'pets':{url:'./mfe/pets/assets/remoteEntry.js',format:'esm',from:'vite'}
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

const {create} = await importShared('zustand');


const usePetStore = create((set) => ({
  hunger: 50,
  happiness: 50,
  status: 'idle', // 'idle' | 'eating' | 'playing' | 'sleeping'
  isSleeping: false,

  feed: () => set((state) => {
    if (state.isSleeping) return {};
    return {
      hunger: Math.max(0, state.hunger - 20),
      status: 'eating'
    };
  }),

  play: () => set((state) => {
    if (state.isSleeping) return {};
    return {
      happiness: Math.min(100, state.happiness + 20),
      status: 'playing'
    };
  }),

  toggleSleep: () => set((state) => ({
    isSleeping: !state.isSleeping,
    status: !state.isSleeping ? 'sleeping' : 'idle'
  })),

  setStatus: (status) => set({ status }),

  tick: () => set((state) => {
    const nextHunger = Math.min(100, state.hunger + (state.isSleeping ? 2 : 5));
    const nextHappiness = Math.max(0, state.happiness - (state.isSleeping ? 1 : 5));
    
    let nextStatus = state.status;
    if (state.status === 'eating' || state.status === 'playing') {
      nextStatus = 'idle';
    }
    if (state.isSleeping) {
      nextStatus = 'sleeping';
    }

    return {
      hunger: nextHunger,
      happiness: nextHappiness,
      status: nextStatus
    };
  })
}));

await importShared('react');
function ConsoleFrame({ children, currentTab, setTab }) {
  const hunger = usePetStore((state) => state.hunger);
  const happiness = usePetStore((state) => state.happiness);
  const status = usePetStore((state) => state.status);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-[500px] pixel-border bg-[#cce9d2] p-6 rounded-lg flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center bg-[#fff] p-2 border-2 border-cozy-border font-press text-[8px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🔋 COZY-OS v1.0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "STATUS: ",
        status.toUpperCase()
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-[#fff] min-h-[300px] border-4 border-cozy-border p-4 relative overflow-hidden flex flex-col justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 bg-[#d7ecd9] border-2 border-cozy-border p-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "🍔 HUNGER: ",
        hunger,
        "/100"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        "💖 HAPPY: ",
        happiness,
        "/100"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-around gap-2 mt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab("home"), className: `pixel-btn flex-1 ${currentTab === "home" ? "bg-[#bce0c3]" : ""}`, children: "HOME" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab("about"), className: `pixel-btn flex-1 ${currentTab === "about" ? "bg-[#bce0c3]" : ""}`, children: "ABOUT" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab("posts"), className: `pixel-btn flex-1 ${currentTab === "posts" ? "bg-[#bce0c3]" : ""}`, children: "POSTS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab("pets"), className: `pixel-btn flex-1 ${currentTab === "pets" ? "bg-[#bce0c3]" : ""}`, children: "PETS" })
    ] })
  ] });
}

const React$1 = await importShared('react');
const {useState,useEffect,lazy,Suspense} = React$1;
const {QueryClient,QueryClientProvider} = await importShared('@tanstack/react-query');

const queryClient = new QueryClient();
const AboutApp = lazy(() => __federation_method_getRemote("about" , "./AboutApp").then(module=>__federation_method_wrapDefault(module, true)).catch(() => ({ default: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Fallback, { name: "About" }) })));
const PostsApp = lazy(() => __federation_method_getRemote("posts" , "./PostsApp").then(module=>__federation_method_wrapDefault(module, true)).catch(() => ({ default: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Fallback, { name: "Posts" }) })));
const PetsApp = lazy(() => __federation_method_getRemote("pets" , "./PetsApp").then(module=>__federation_method_wrapDefault(module, true)).catch(() => ({ default: () => /* @__PURE__ */ jsxRuntimeExports.jsx(Fallback, { name: "Pets" }) })));
function Fallback({ name }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full gap-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-press text-[12px] text-red-600", children: "⚠ MFE LOAD ERROR" }),
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
  useEffect(() => {
    const timer = setInterval(() => {
      tick();
    }, 5e3);
    return () => clearInterval(timer);
  }, [tick]);
  const renderContent = () => {
    switch (tab) {
      case "about":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(AboutApp, {});
      case "posts":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PostsApp, {});
      case "pets":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PetsApp, { usePetStore });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full text-center p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-press text-[18px] mb-4", children: "WELCOME HOME" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: "I am prxxie. This is my cozy retro pocket portal. Nav-select below to explore pages!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-cozy-text mt-6 animate-bounce", style: {
            clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)"
          } })
        ] });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConsoleFrame, { currentTab: tab, setTab, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-press text-center pt-10 text-[10px]", children: "LOADING MFE..." }), children: renderContent() }) }) });
}

const React = await importShared('react');
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
