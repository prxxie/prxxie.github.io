import React from "react";
import { SOKOBAN_LEVELS } from "../levels";

interface LevelSelectProps {
  onSelect: (idx: number) => void;
  completedLevelIds: Set<string>;
  currentLevelIdx?: number;
}

export default function LevelSelect({ onSelect, completedLevelIds, currentLevelIdx }: LevelSelectProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-2 text-cozy-text font-mono w-full min-h-0 flex-1">
      <h2 className="font-press text-[12px] text-center my-2 shrink-0">SELECT LEVEL</h2>
      <div className="grid grid-cols-5 gap-3 p-2 overflow-y-auto flex-1 min-h-0">
        {SOKOBAN_LEVELS.map((level, idx) => {
          const completed = completedLevelIds.has(level.id);
          const active = currentLevelIdx === idx;
          return (
            <button
              key={level.id}
              onClick={() => onSelect(idx)}
              className={`w-10 h-10 border flex items-center justify-center font-press text-[11px] cursor-pointer transition-colors active:translate-y-0.5 ${
                active
                  ? "border-[#FFB000] bg-[#FFB000]/10 text-[#FFB000]"
                  : completed
                  ? "border-cozy-border bg-black text-[#FFB000] hover:bg-cozy-text hover:text-black hover:scale-105"
                  : "border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black hover:scale-105"
              }`}
              aria-label={`Select level ${idx + 1}${completed ? " (completed)" : ""}`}
            >
              {completed ? "★" : idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
