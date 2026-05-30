import React from "react";
import { SOKOBAN_LEVELS } from "../levels";

interface LevelSelectProps {
  onSelect: (idx: number) => void;
}

export default function LevelSelect({ onSelect }: LevelSelectProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-4 text-cozy-text font-mono">
      <h2 className="font-press text-[12px] text-center my-2">SELECT LEVEL</h2>
      <div className="grid grid-cols-5 gap-3 max-h-[300px] overflow-y-auto p-2">
        {SOKOBAN_LEVELS.map((level, idx) => (
          <button
            key={level.id}
            onClick={() => onSelect(idx)}
            className="w-10 h-10 border-2 border-cozy-border flex items-center justify-center font-press text-[11px] bg-black text-cozy-text cursor-pointer hover:bg-cozy-text hover:text-black hover:scale-105 active:translate-y-0.5 transition-colors"
            aria-label={`Select level ${idx + 1}`}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
