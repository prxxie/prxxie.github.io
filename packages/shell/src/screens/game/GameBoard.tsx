import React, { lazy } from "react";

/*
 * The three remote boards live in their own module so the prerender step never
 * evaluates a remote import: the build renders the placeholder, the browser
 * renders the board (US-SITE-003 AC4).
 */
const ShikakuApp = lazy(() => import("shikaku/ShikakuApp"));
const SokobanApp = lazy(() => import("sokoban/SokobanApp"));
const SlitherlinkApp = lazy(() => import("slitherlink/SlitherlinkApp"));

export default function GameBoard({ slug }: { slug: string }): React.ReactElement | null {
  switch (slug) {
    case "shikaku":
      return <ShikakuApp />;
    case "sokoban":
      return <SokobanApp />;
    case "slitherlink":
      return <SlitherlinkApp />;
    default:
      return null;
  }
}
