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
  { tab: "shikaku", key: "SH" },
  { tab: "sokoban", key: "SO" },
  { tab: "slitherlink", key: "SL" },
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
    <div className="panel panel-dark p-2">
      <div className="text-[10px] font-code text-accent-teal mb-2 text-center bg-surface-dark-elevated py-1">
        COMMAND_MATRIX
      </div>
      <div className="grid grid-cols-2 gap-2">
        {GRID_ITEMS.map((item) => (
          <button
            key={item.tab}
            onClick={() => handleButtonClick(item.tab)}
            className={`btn text-[9px] py-2 px-1 text-center font-code capitalize ${
              currentTab === item.tab
                ? "bg-primary text-canvas border-hairline"
                : "bg-transparent text-on-dark hover:bg-surface-dark-elevated"
            }`}
          >
            [{item.key}] {item.tab}
          </button>
        ))}
      </div>
    </div>
  );
}
