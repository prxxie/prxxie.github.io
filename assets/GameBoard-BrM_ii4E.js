import { i as importShared } from './_virtual___federation_fn_import-awsP_RH0.js';
import { j as jsxRuntimeExports } from './jsx-runtime-CsM3lTE3.js';

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
                    'react':{'18.3.1':{get:()=>get(new URL('__federation_shared_react-C3Pr5fKJ.js', import.meta.url).href, remoteFrom), loaded:1}},'react-dom':{'18.3.1':{get:()=>get(new URL('__federation_shared_react-dom-34UylTkL.js', import.meta.url).href, remoteFrom), loaded:1}},'zustand':{'4.5.7':{get:()=>get(new URL('__federation_shared_zustand-D9Yp57aV.js', import.meta.url).href, remoteFrom), loaded:1}},'@tanstack/react-query':{'5.101.4':{get:()=>get(new URL('__federation_shared_@tanstack/react-query-DOvBSngk.js', import.meta.url).href, remoteFrom), loaded:1}}
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

const {lazy} = await importShared('react');

const ShikakuApp = lazy(() => __federation_method_getRemote("shikaku" , "./ShikakuApp").then(module=>__federation_method_wrapDefault(module, true)));
const SokobanApp = lazy(() => __federation_method_getRemote("sokoban" , "./SokobanApp").then(module=>__federation_method_wrapDefault(module, true)));
const SlitherlinkApp = lazy(() => __federation_method_getRemote("slitherlink" , "./SlitherlinkApp").then(module=>__federation_method_wrapDefault(module, true)));
function GameBoard({ slug }) {
  switch (slug) {
    case "shikaku":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ShikakuApp, {});
    case "sokoban":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(SokobanApp, {});
    case "slitherlink":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(SlitherlinkApp, {});
    default:
      return null;
  }
}

export { GameBoard as default };
