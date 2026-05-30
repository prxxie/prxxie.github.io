import React, { useState, useEffect } from "react";
import { useShikakuStore } from "./store/useShikakuStore";
import { SHIKAKU_LEVELS } from "./levels";
import HUD from "./components/HUD";
import Board from "./components/Board";
import LevelSelect from "./components/LevelSelect";
import { synth } from "./engine/synth";

export default function ShikakuApp(): React.ReactElement {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const isWon = useShikakuStore((state) => state.isWon);
  const loadLevel = useShikakuStore((state) => state.loadLevel);

  useEffect(() => {
    if (isWon) {
      synth.playWin();
    }
  }, [isWon]);

  const handleSelectLevel = (idx: number): void => {
    setSelectedIdx(idx);
    loadLevel(SHIKAKU_LEVELS, idx);
  };

  return (
    <div className="w-full max-w-[450px] border border-cozy-border bg-black p-6 select-none text-cozy-text">
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
