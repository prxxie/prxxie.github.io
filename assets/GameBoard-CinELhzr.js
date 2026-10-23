import { i as importShared } from './_virtual___federation_fn_import-Bhvr9fyf.js';
import { _ as __federation_method_getRemote, a as __federation_method_wrapDefault } from './_virtual___federation__-B8sEZB0N.js';
import { j as jsxRuntimeExports } from './jsx-runtime-CyoIsdjr.js';

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
