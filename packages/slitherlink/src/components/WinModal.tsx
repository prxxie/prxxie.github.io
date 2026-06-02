import React from "react";
import { useSlitherlinkStore } from "../store/useSlitherlinkStore";
import { synth } from "../engine/synth";
import { motion } from "framer-motion";

interface WinModalProps {
  onBack: () => void;
  rewardMsg: string | null;
}

export default function WinModal({ onBack, rewardMsg }: WinModalProps): React.ReactElement | null {
  const isWon = useSlitherlinkStore((state) => state.isWon);
  const elapsedTime = useSlitherlinkStore((state) => state.elapsedTime);
  const starsAchieved = useSlitherlinkStore((state) => state.starsAchieved);
  const level = useSlitherlinkStore((state) => state.level);

  if (!isWon || !level) return null;

  const formatTime = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 font-press text-[10px] text-cozy-text select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="border border-cozy-border bg-black max-w-[300px] w-full p-6 flex flex-col items-center gap-4 text-center box-shadow-[0_0_15px_rgba(255,176,0,0.2)]"
      >
        <h2 className="text-[12px] text-cozy-accent animate-pulse font-mono font-bold">LEVEL SOLVED!</h2>
        
        <div className="text-[14px] my-2 font-mono">
          {"★".repeat(starsAchieved)}
          {"☆".repeat(3 - starsAchieved)}
        </div>

        <div className="flex flex-col gap-1 text-[8px] text-left w-full border-y border-dashed border-cozy-border py-3 my-1 font-mono">
          <div className="flex justify-between">
            <span>TIME TAKEN:</span>
            <span>{formatTime(elapsedTime)}</span>
          </div>
          <div className="flex justify-between text-cozy-muted">
            <span>3 STARS GOAL:</span>
            <span>&le; {formatTime(level.targets.threeStars)}</span>
          </div>
          <div className="flex justify-between text-cozy-muted">
            <span>2 STARS GOAL:</span>
            <span>&le; {formatTime(level.targets.twoStars)}</span>
          </div>
        </div>

        {rewardMsg && (
          <div className="border border-cozy-border px-3 py-1 font-mono text-[9px]">
            {rewardMsg}
          </div>
        )}

        <button
          onClick={() => {
            synth.playClick();
            onBack();
          }}
          className="border border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black px-4 py-2 mt-2 cursor-pointer font-mono font-bold"
        >
          CONTINUE
        </button>
      </motion.div>
    </div>
  );
}
