import React, { useState } from "react";
import { useSokobanStore } from "./store/useSokobanStore";
import HUD from "./components/HUD";
import Board from "./components/Board";
import LevelSelect from "./components/LevelSelect";
import Controls from "./components/Controls";
import WinModal from "./components/WinModal";

export default function SokobanApp(): React.ReactElement {
  const [view, setView] = useState<"menu" | "game">("menu");
  const loadLevel = useSokobanStore((state) => state.loadLevel);

  const handleSelectLevel = (idx: number): void => {
    loadLevel(idx);
    setView("game");
  };

  return (
    <div className="w-full max-w-[450px] border-4 border-[#2b4c3f] bg-[#e2f4e5] p-4 shadow-md select-none relative flex flex-col items-center">
      {view === "menu" ? (
        <LevelSelect onSelect={handleSelectLevel} />
      ) : (
        <div className="flex flex-col gap-4 items-center w-full relative">
          <HUD onBack={() => setView("menu")} />
          <Board />
          <Controls />
          <WinModal onBack={() => setView("menu")} />
        </div>
      )}
    </div>
  );
}
