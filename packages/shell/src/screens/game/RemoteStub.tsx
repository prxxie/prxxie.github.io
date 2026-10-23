import React from "react";

/**
 * Stands in for a remote board during the prerender build. It is never rendered —
 * `GameRoute` answers the server with its placeholder — but Rollup needs a module
 * to resolve when it bundles `GameBoard.tsx`.
 */
export default function RemoteStub(): React.ReactElement | null {
  return null;
}
