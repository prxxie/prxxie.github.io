import React from "react";
import type { Tab } from "../types";
import { playBeepSound } from "../utils/audio";

interface MatrixMenuProps {
  currentTab: Tab;
  navigate: (tab: Tab) => void;
}

const GRID_ITEMS: Array<{ tab: Tab; key: string }> = [
  { tab: "home", key: "HM" },
  { tab: "about", key: "AB" },
  { tab: "posts", key: "PO" },
  { tab: "pets", key: "PE" },
  { tab: "shikaku", key: "SH" },
  { tab: "sokoban", key: "SO" },
];

export default function MatrixMenu({
  currentTab,
  navigate,
}: MatrixMenuProps): React.ReactElement {
  const handleButtonClick = (tabName: Tab): void => {
    playBeepSound(440, 0.06);
    navigate(tabName);
  };

  return (
    <div className="border border-cozy-border p-2 bg-black">
      <div className="text-[10px] font-press text-cozy-accent mb-2 text-center bg-cozy-muted/20 py-1">
        COMMAND_MATRIX
      </div>
      <div className="grid grid-cols-3 gap-2">
        {GRID_ITEMS.map((item) => (
          <button
            key={item.tab}
            onClick={() => handleButtonClick(item.tab)}
            className={`pixel-btn text-[9px] py-2 px-1 text-center font-press capitalize ${
              currentTab === item.tab
                ? "bg-cozy-accent text-black shadow-none border-cozy-border"
                : "bg-transparent text-cozy-text hover:bg-cozy-muted/20"
            }`}
          >
            [{item.key}] {item.tab}
          </button>
        ))}
      </div>
    </div>
  );
}
