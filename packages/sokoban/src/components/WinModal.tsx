import React, { useEffect } from "react";
import { useSokobanStore } from "../store/useSokobanStore";
import { synth } from "../engine/synth";

interface WinModalProps {
  onBack: () => void;
}

export default function WinModal({ onBack }: WinModalProps): React.ReactElement {
  const isWon = useSokobanStore((state) => state.isWon);
  const nextLevel = useSokobanStore((state) => state.nextLevel);
  const moves = useSokobanStore((state) => state.moves);

  useEffect(() => {
    if (isWon) {
      synth.playWin();
    }
  }, [isWon]);

  if (!isWon) return <React.Fragment />;

  return (
    <div className="absolute inset-0 bg-[#2b4c3f]/80 z-50 flex items-center justify-center p-4 select-none">
      <div className="border-4 border-[#2b4c3f] bg-white p-6 shadow-md max-w-xs w-full text-center flex flex-col items-center gap-4">
        <h2 className="font-press text-[14px] text-[#CC6666] animate-bounce">
          STAGE CLEAR!
        </h2>
        <p className="font-mono text-sm text-[#2b4c3f]">
          Finished in <span className="font-bold font-press text-[11px] text-[#CC6666]">{moves}</span> movements.
        </p>
        <div className="flex gap-4 mt-2">
          <button
            onClick={nextLevel}
            className="pixel-btn text-[10px] text-[#2b4c3f]"
            aria-label="Next stage"
          >
            NEXT &gt;
          </button>
          <button
            onClick={onBack}
            className="pixel-btn text-[10px] text-gray-500"
            aria-label="Main menu"
          >
            MENU
          </button>
        </div>
      </div>
    </div>
  );
}
