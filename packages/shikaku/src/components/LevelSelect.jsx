import React, { useEffect } from 'react';
import { useShikakuStore } from '../store/useShikakuStore';
import { SHIKAKU_LEVELS } from '../levels';
import { synth } from '../engine/synth';

export default function LevelSelect({ onSelect }) {
  const { completedLevels, loadSave } = useShikakuStore();

  useEffect(() => {
    loadSave();
  }, [loadSave]);

  return (
    <div className="w-full flex flex-col gap-6 text-[#2b4c3f] font-press">
      <h2 className="text-[12px] text-center border-b-2 border-[#2b4c3f] pb-3">SELECT LEVEL</h2>
      
      <div className="grid grid-cols-3 gap-3">
        {SHIKAKU_LEVELS.map((lvl, index) => {
          const save = completedLevels[lvl.id];
          const stars = save?.stars || 0;
          return (
            <button
              key={lvl.id}
              onClick={() => {
                synth.playClick();
                onSelect(index);
              }}
              className="border-2 border-[#2b4c3f] bg-[#e2f4e5] p-3 flex flex-col items-center justify-center cursor-pointer active:translate-y-0.5 hover:bg-[#cce8d0] transition-colors"
            >
              <span className="text-[10px]">{index + 1}</span>
              <span className="text-[6px] mt-1 text-slate-500 font-sans">{lvl.width}x{lvl.height}</span>
              <div className="text-[8px] mt-2">
                {"★".repeat(stars)}{"☆".repeat(3 - stars)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
