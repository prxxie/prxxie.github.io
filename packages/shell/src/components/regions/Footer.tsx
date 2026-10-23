import React from "react";

/**
 * The one contentinfo landmark. The pet widget mounts into `#pet-widget-slot`
 * (US-PET-003) and the contact links arrive with US-SITE-006.
 */
export default function Footer(): React.ReactElement {
  return (
    <footer className="mt-auto w-full border-t border-hairline bg-canvas">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6">
        <div id="pet-widget-slot" />
        <div className="flex flex-wrap items-center justify-between gap-2 font-code text-[11px] text-muted">
          <span>prxxie.dev — made in the open, one story at a time</span>
        </div>
      </div>
    </footer>
  );
}
