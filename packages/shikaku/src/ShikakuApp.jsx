import React, { useState, useEffect } from 'react';
import { useShikakuStore } from './store/useShikakuStore';
import { SHIKAKU_LEVELS } from './levels';
import HUD from './components/HUD';
import Board from './components/Board';
import LevelSelect from './components/LevelSelect';
import { synth } from './engine/synth';

export default function ShikakuApp() {
  const [selectedIdx, setSelectedIdx] = useState(null);
  const { isWon, loadLevel } = useShikakuStore();

  useEffect(() => {
    if (isWon) {
      synth.playWin();
    }
  }, [isWon]);

  const handleSelectLevel = (idx) => {
    setSelectedIdx(idx);
    loadLevel(SHIKAKU_LEVELS, idx);
  };

  return (
    <div className="w-full max-w-[450px] border-4 border-[#2b4c3f] bg-[#e2f4e5] p-6 shadow-md select-none">
      {selectedIdx === null ? (
        <LevelSelect onSelect={handleSelectLevel} />
      ) : (
        <div className="flex flex-col gap-6 items-center">
          <HUD onBack={() => setSelectedIdx(null)} />
          <Board />
        </div>
      )}
    </div>
  );
}

