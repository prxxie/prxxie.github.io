import React from "react";
import { useSokobanStore } from "../store/useSokobanStore";
import { SOKOBAN_LEVELS } from "../levels";

interface HUDProps {
  onBack: () => void;
}

export default function HUD({ onBack }: HUDProps): React.ReactElement {
  const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);
  const moves = useSokobanStore((state) => state.moves);
  const undo = useSokobanStore((state) => state.undo);
  const restart = useSokobanStore((state) => state.restart);
  const history = useSokobanStore((state) => state.history);
  const isMuted = useSokobanStore((state) => state.isMuted);
  const setMuted = useSokobanStore((state) => state.setMuted);

  const levelName = SOKOBAN_LEVELS[currentLevelIdx]?.name || `Level ${currentLevelIdx + 1}`;

  return (
    <div className="w-full flex flex-col gap-2 p-2 border-b-2 border-gray-400 font-press text-[10px] select-none text-[#2b4c3f]">
      <div className="flex justify-between items-center w-full">
        <button onClick={onBack} className="pixel-btn px-2 py-1 text-[8px]" aria-label="Back to level selection">
          &lt; MENU
        </button>
        <span>{levelName.toUpperCase()}</span>
        <span>MOVES: {moves}</span>
      </div>
      <div className="flex gap-4 justify-center items-center mt-2">
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="pixel-btn disabled:opacity-40 disabled:pointer-events-none"
          aria-label="Undo Move"
        >
          UNDO
        </button>
        <button onClick={restart} className="pixel-btn" aria-label="Restart Level">
          RESET
        </button>
        <button
          onClick={() => setMuted(!isMuted)}
          className="pixel-btn"
          aria-label={isMuted ? "Unmute Audio" : "Mute Audio"}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
      </div>
    </div>
  );
}
