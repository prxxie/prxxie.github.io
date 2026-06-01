import React from "react";
import { SOKOBAN_LEVELS } from "../levels";

interface LevelSelectProps {
  onSelect: (idx: number) => void;
  bestStars: Record<string, number>;
  currentLevelIdx?: number;
}

export default function LevelSelect({ onSelect, bestStars, currentLevelIdx }: LevelSelectProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-2 text-cozy-text font-mono w-full min-h-0 flex-1">
      <h2 className="font-press text-[12px] text-center my-2 shrink-0">SELECT LEVEL</h2>
      <div className="grid grid-cols-5 gap-3 p-2 overflow-y-auto flex-1 min-h-0">
        {SOKOBAN_LEVELS.map((level, idx) => {
          const stars = bestStars[level.id] ?? 0;
          const active = currentLevelIdx === idx;
          return (
            <button
              key={level.id}
              onClick={() => onSelect(idx)}
              className={`w-10 h-10 border flex flex-col items-center justify-center font-press cursor-pointer transition-colors active:translate-y-0.5 ${
                active
                  ? "border-[#FFB000] bg-[#FFB000]/10 text-[#FFB000]"
                  : stars > 0
                  ? "border-cozy-border bg-black text-[#FFB000] hover:bg-cozy-text hover:text-black hover:scale-105"
                  : "border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black hover:scale-105"
              }`}
              aria-label={`Select level ${idx + 1}${stars > 0 ? ` (${stars} star${stars > 1 ? "s" : ""})` : ""}`}
            >
              <span className="text-[10px]">{idx + 1}</span>
              {stars > 0 && (
                <span className="text-[6px] leading-none mt-0.5">
                  {"★".repeat(stars)}{"☆".repeat(3 - stars)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
