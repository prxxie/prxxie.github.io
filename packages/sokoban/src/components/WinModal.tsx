import React, { useEffect, useState } from "react";
import { ProgressService, LocalProgressRepository } from "shared";
import { useSokobanStore } from "../store/useSokobanStore";
import { synth } from "../engine/synth";

const progressService = new ProgressService(new LocalProgressRepository());

interface WinModalProps {
  onBack: () => void;
}

export default function WinModal({ onBack }: WinModalProps): React.ReactElement {
  const isWon = useSokobanStore((state) => state.isWon);
  const nextLevel = useSokobanStore((state) => state.nextLevel);
  const moves = useSokobanStore((state) => state.moves);
  const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isWon) {
      synth.playWin();
    }
  }, [isWon]);

  useEffect(() => {
    if (!isWon) {
      setRewardMsg(null);
      return;
    }
    void progressService
      .completeLevel("sokoban", `level-${currentLevelIdx}`)
      .then((firstTime) => {
        setRewardMsg(firstTime ? "+1 FOOD" : "ALREADY COMPLETE");
      });
  }, [isWon, currentLevelIdx]);

  if (!isWon) return <React.Fragment />;

  return (
    <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4 select-none">
      <div className="border border-[#FFB000] bg-[#050505] p-6 max-w-xs w-full text-center flex flex-col items-center gap-4">
        <h2 className="font-press text-[14px] text-cozy-text animate-bounce">
          STAGE CLEAR!
        </h2>
        <p className="font-mono text-sm text-cozy-text">
          Finished in{" "}
          <span className="font-bold font-press text-[11px] text-cozy-text">
            {moves}
          </span>{" "}
          movements.
        </p>
        {rewardMsg && (
          <p className="font-press text-[9px] border border-cozy-border px-2 py-1 text-cozy-text">
            {rewardMsg}
          </p>
        )}
        <div className="flex gap-4 mt-2">
          <button
            onClick={nextLevel}
            className="pixel-btn text-[10px] text-cozy-text"
            aria-label="Next stage"
          >
            NEXT &gt;
          </button>
          <button
            onClick={onBack}
            className="pixel-btn text-[10px] text-cozy-text/70"
            aria-label="Main menu"
          >
            MENU
          </button>
        </div>
      </div>
    </div>
  );
}
