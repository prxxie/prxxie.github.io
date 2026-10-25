import React, { useState } from "react";
import { NavLink } from "react-router";
import { NAV_ITEMS } from "./navItems";
import { playBeepSound, getAudioMuted, setAudioMuted } from "../../utils/audio";
import Button from "../primitives/Button";

/** The one banner landmark: brand, the three sections, and the console switches. */
export default function Header(): React.ReactElement {
  const [muted, setMuted] = useState<boolean>(getAudioMuted);

  const toggleAudio = (): void => {
    const nextMuted = !muted;
    setAudioMuted(nextMuted);
    setMuted(nextMuted);
    if (!nextMuted) playBeepSound(520, 0.08);
  };

  return (
    <header className="w-full border-b border-hairline bg-canvas">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <NavLink to="/" end className="font-code text-xs font-bold uppercase tracking-wide text-ink no-underline">
          prxxie<span className="text-muted">.dev</span>
        </NavLink>

        <nav aria-label="Sections" className="flex flex-wrap items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => playBeepSound(440, 0.06)}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-sm px-3 py-1 font-body text-[13px] no-underline ${
                  isActive ? "bg-primary text-canvas" : "text-muted hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={toggleAudio} className="px-2 py-[2px] text-[12px]" aria-pressed={!muted}>
            Sound {muted ? "off" : "on"}
          </Button>
        </div>
      </div>
    </header>
  );
}
