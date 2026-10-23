import React from "react";
import { useLocation } from "react-router";
import ContactBlock from "../ContactBlock";
import PetWidget from "../PetWidget";

/**
 * The one contentinfo landmark: the contact links (US-SITE-006) and, on the front
 * page only, the pet widget (US-PET-003). The widget is client-side: the prerendered
 * footer carries the rest, so a reader without JavaScript sees no empty box.
 */
export default function Footer(): React.ReactElement {
  const { pathname } = useLocation();
  const showPet = pathname === "/";

  return (
    <footer className="mt-auto w-full border-t border-hairline bg-canvas">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-6">
        {showPet && (
          <div id="pet-widget-slot">
            <PetWidget />
          </div>
        )}
        <ContactBlock />
        <div className="flex flex-wrap items-center justify-between gap-2 font-code text-[11px] text-muted">
          <span>prxxie.dev — made in the open, one story at a time</span>
        </div>
      </div>
    </footer>
  );
}
