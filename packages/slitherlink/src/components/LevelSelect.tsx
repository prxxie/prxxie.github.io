import React from "react";
import { SLITHERLINK_LEVELS } from "../levels";
import { synth } from "../engine/synth";

interface LevelSelectProps {
  onSelect: (index: number) => void;
  completedLevels: Record<string, number>;
}

export default function LevelSelect({
  onSelect,
  completedLevels
}: LevelSelectProps): React.ReactElement {
  return (
    <div className="w-full flex flex-col gap-6 text-cozy-text font-press select-none">
      <h2 className="text-[12px] text-center border-b border-cozy-border pb-3 font-mono">
        SELECT LEVEL
      </h2>

      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-[9px] mb-3 text-cozy-muted font-mono">EASY (5x5)</h3>
          <div className="grid grid-cols-3 gap-3">
            {SLITHERLINK_LEVELS.filter(l => l.difficulty === "Easy").map((lvl) => {
              const idx = SLITHERLINK_LEVELS.findIndex(l => l.id === lvl.id);
              const stars = completedLevels[lvl.id] || 0;
              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    synth.playClick();
                    onSelect(idx);
                  }}
                  className="border border-cozy-border bg-black text-cozy-text p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-cozy-text hover:text-black transition-colors font-mono"
                >
                  <span className="text-[10px]">{idx + 1}</span>
                  <span className="text-[6px] mt-1 opacity-70">5x5</span>
                  <div className="text-[8px] mt-2">
                    {"★".repeat(stars)}
                    {"☆".repeat(3 - stars)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-[9px] mb-3 text-cozy-muted font-mono">MEDIUM (6x6)</h3>
          <div className="grid grid-cols-3 gap-3">
            {SLITHERLINK_LEVELS.filter(l => l.difficulty === "Medium").map((lvl) => {
              const idx = SLITHERLINK_LEVELS.findIndex(l => l.id === lvl.id);
              const stars = completedLevels[lvl.id] || 0;
              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    synth.playClick();
                    onSelect(idx);
                  }}
                  className="border border-cozy-border bg-black text-cozy-text p-3 flex flex-col items-center justify-center cursor-pointer hover:bg-cozy-text hover:text-black transition-colors font-mono"
                >
                  <span className="text-[10px]">{idx + 1}</span>
                  <span className="text-[6px] mt-1 opacity-70">6x6</span>
                  <div className="text-[8px] mt-2">
                    {"★".repeat(stars)}
                    {"☆".repeat(3 - stars)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
