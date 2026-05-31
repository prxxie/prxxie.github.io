import React, { useState, useEffect } from "react";
import { ProgressService, LocalProgressRepository } from "shared";
import { useShikakuStore } from "./store/useShikakuStore";
import { SHIKAKU_LEVELS } from "./levels";
import HUD from "./components/HUD";
import Board from "./components/Board";
import LevelSelect from "./components/LevelSelect";
import { synth } from "./engine/synth";

const progressService = new ProgressService(new LocalProgressRepository());

export default function ShikakuApp(): React.ReactElement {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);
  const isWon = useShikakuStore((state) => state.isWon);
  const puzzle = useShikakuStore((state) => state.puzzle);
  const loadLevel = useShikakuStore((state) => state.loadLevel);

  useEffect(() => {
    if (isWon) {
      synth.playWin();
    }
  }, [isWon]);

  useEffect(() => {
    if (!isWon || !puzzle || selectedIdx === null) return;
    void progressService.completeLevel("shikaku", puzzle.id).then((firstTime) => {
      setRewardMsg(firstTime ? "+1 FOOD" : "ALREADY COMPLETE");
    });
  }, [isWon, puzzle, selectedIdx]);

  const handleSelectLevel = (idx: number): void => {
    setSelectedIdx(idx);
    setRewardMsg(null);
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
          {isWon && rewardMsg && (
            <div className="font-press text-[9px] border border-cozy-border px-3 py-1 text-cozy-text">
              {rewardMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
