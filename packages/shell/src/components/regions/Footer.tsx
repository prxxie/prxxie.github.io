import React from "react";
import ContactBlock from "../ContactBlock";

/**
 * The one contentinfo landmark: the contact links (US-SITE-006) and the slot the
 * pet widget mounts into (US-PET-003).
 */
export default function Footer(): React.ReactElement {
  return (
    <footer className="mt-auto w-full border-t border-hairline bg-canvas">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6">
        <div id="pet-widget-slot" />
        <ContactBlock />
        <div className="flex flex-wrap items-center justify-between gap-2 font-code text-[11px] text-muted">
          <span>prxxie.dev — made in the open, one story at a time</span>
        </div>
      </div>
    </footer>
  );
}
