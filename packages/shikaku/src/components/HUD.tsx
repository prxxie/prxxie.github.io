import React, { useEffect } from "react";
import { useShikakuStore } from "../store/useShikakuStore";
import { synth } from "../engine/synth";

interface HUDProps {
  onBack: () => void;
}

export default function HUD({ onBack }: HUDProps): React.ReactElement {
  const puzzle = useShikakuStore((state) => state.puzzle);
  const elapsedTime = useShikakuStore((state) => state.elapsedTime);
  const starsAchieved = useShikakuStore((state) => state.starsAchieved);
  const undo = useShikakuStore((state) => state.undo);
  const resetLevel = useShikakuStore((state) => state.resetLevel);
  const getHint = useShikakuStore((state) => state.getHint);
  const tickTimer = useShikakuStore((state) => state.tickTimer);

  useEffect(() => {
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  const formatTime = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full flex flex-col gap-4 border-b border-cozy-border pb-4 font-press text-[10px] text-cozy-text">
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            synth.playClick();
            onBack();
          }}
          className="border border-cozy-border bg-black text-cozy-text hover:bg-[#101010] px-2 py-1 cursor-pointer active:translate-y-0.5"
        >
          ◀ BACK
        </button>
        <span>LVL: {puzzle?.id?.toUpperCase()}</span>
        <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => {
              synth.playClick();
              undo();
            }}
            className="border border-cozy-border bg-black text-cozy-text hover:bg-[#101010] px-2 py-1 cursor-pointer active:translate-y-0.5"
          >
            UNDO
          </button>
          <button
            onClick={() => {
              synth.playClick();
              resetLevel();
            }}
            className="border border-cozy-border bg-black text-cozy-text hover:bg-[#101010] px-2 py-1 cursor-pointer active:translate-y-0.5"
          >
            RESET
          </button>
          <button
            onClick={() => {
              synth.playClick();
              getHint();
            }}
            className="border border-cozy-border bg-black text-cozy-text hover:bg-[#101010] px-2 py-1 cursor-pointer active:translate-y-0.5"
          >
            HINT
          </button>
        </div>
        <div>
          {"★".repeat(starsAchieved)}
          {"☆".repeat(3 - starsAchieved)}
        </div>
      </div>
    </div>
  );
}
