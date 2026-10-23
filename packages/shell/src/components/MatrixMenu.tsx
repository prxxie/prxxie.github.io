import React from "react";
import { NavLink } from "react-router";
import { playBeepSound } from "../utils/audio";

const NAV_ITEMS: Array<{ to: string; label: string; end?: boolean }> = [
  { to: "/", label: "Home", end: true },
  { to: "/games", label: "Games" },
  { to: "/games/shikaku", label: "Shikaku" },
  { to: "/games/sokoban", label: "Sokoban" },
  { to: "/games/slitherlink", label: "Slitherlink" },
  { to: "/devlog", label: "Devlog" },
];

export default function MatrixMenu(): React.ReactElement {
  return (
    <nav aria-label="Sections" className="panel">
      <div className="panel-header">
        <span className="panel-header-accent">Sections</span>
      </div>
      <div className="panel-body grid grid-cols-2 gap-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => playBeepSound(440, 0.06)}
            className={({ isActive }) =>
              `btn text-[12px] py-2 px-1 text-center no-underline ${
                isActive ? "bg-primary text-canvas border-primary" : "text-ink"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
