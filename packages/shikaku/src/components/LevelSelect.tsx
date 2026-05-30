import React, { useEffect } from "react";
import { useShikakuStore } from "../store/useShikakuStore";
import { SHIKAKU_LEVELS } from "../levels";
import { synth } from "../engine/synth";

interface LevelSelectProps {
  onSelect: (index: number) => void;
}

export default function LevelSelect({
  onSelect,
}: LevelSelectProps): React.ReactElement {
  const completedLevels = useShikakuStore((state) => state.completedLevels);
  const loadSave = useShikakuStore((state) => state.loadSave);

  useEffect(() => {
    loadSave();
  }, [loadSave]);

  return (
    <div className="w-full flex flex-col gap-6 text-cozy-text font-press">
      <h2 className="text-[12px] text-center border-b-2 border-cozy-border pb-3">
        SELECT LEVEL
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {SHIKAKU_LEVELS.map((lvl, index) => {
          const save = completedLevels[lvl.id];
          const stars = save ? save.stars : 0;
          return (
            <button
              key={lvl.id}
              onClick={() => {
                synth.playClick();
                onSelect(index);
              }}
              className="border-2 border-cozy-border bg-black text-cozy-text p-3 flex flex-col items-center justify-center cursor-pointer active:translate-y-0.5 hover:bg-cozy-text hover:text-black transition-colors"
            >
              <span className="text-[10px]">{index + 1}</span>
              <span className="text-[6px] mt-1 text-cozy-muted font-sans">
                {lvl.width}x{lvl.height}
              </span>
              <div className="text-[8px] mt-2">
                {"★".repeat(stars)}
                {"☆".repeat(3 - stars)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
