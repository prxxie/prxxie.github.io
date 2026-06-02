import React, { useEffect } from "react";
import { useSlitherlinkStore } from "../store/useSlitherlinkStore";
import { synth } from "../engine/synth";

interface HUDProps {
  onBack: () => void;
}

export default function HUD({ onBack }: HUDProps): React.ReactElement {
  const level = useSlitherlinkStore((state) => state.level);
  const elapsedTime = useSlitherlinkStore((state) => state.elapsedTime);
  const undo = useSlitherlinkStore((state) => state.undo);
  const resetLevel = useSlitherlinkStore((state) => state.resetLevel);
  const tickTimer = useSlitherlinkStore((state) => state.tickTimer);
  const [muted, setMuted] = React.useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  const handleMute = () => {
    const nextMuted = !muted;
    synth.setMuted(nextMuted);
    setMuted(nextMuted);
    synth.playClick();
  };

  const formatTime = (sec: number): string => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full flex flex-col gap-4 border-b border-cozy-border pb-4 font-press text-[10px] text-cozy-text select-none">
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            synth.playClick();
            onBack();
          }}
          className="border border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black px-2 py-1 cursor-pointer font-mono"
        >
          ◀ MENU
        </button>
        <span>LVL: {level?.id.toUpperCase()}</span>
        <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={undo}
            className="border border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black px-2 py-1 cursor-pointer font-mono"
          >
            UNDO
          </button>
          <button
            onClick={resetLevel}
            className="border border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black px-2 py-1 cursor-pointer font-mono"
          >
            RESET
          </button>
        </div>
        <button
          onClick={handleMute}
          className="border border-cozy-border bg-black text-cozy-text hover:bg-cozy-text hover:text-black px-2 py-1 cursor-pointer font-mono"
        >
          {muted ? "UNMUTE" : "MUTE"}
        </button>
      </div>
    </div>
  );
}
