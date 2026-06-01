import React, { useState, useEffect, useCallback } from "react";
import { ProgressService, LocalProgressRepository } from "shared";
import { useSokobanStore } from "./store/useSokobanStore";
import HUD from "./components/HUD";
import Board from "./components/Board";
import LevelSelect from "./components/LevelSelect";
import Controls from "./components/Controls";
import WinModal from "./components/WinModal";

const progressService = new ProgressService(new LocalProgressRepository());

export default function SokobanApp(): React.ReactElement {
  const [view, setView] = useState<"menu" | "game">("menu");
  const [bestStars, setBestStars] = useState<Record<string, number>>({});
  const loadLevel = useSokobanStore((state) => state.loadLevel);
  const currentLevelIdx = useSokobanStore((state) => state.currentLevelIdx);

  const refreshProgress = useCallback(async () => {
    const state = await progressService.getState();
    const map: Record<string, number> = {};
    for (const c of state.completedLevels) {
      if (c.module === "sokoban") {
        map[c.levelId] = c.stars ?? 1;
      }
    }
    setBestStars(map);
  }, []);

  useEffect(() => {
    void refreshProgress();
    const handler = () => { void refreshProgress(); };
    window.addEventListener("cozyos:progress-updated", handler);
    return () => window.removeEventListener("cozyos:progress-updated", handler);
  }, [refreshProgress]);

  const handleSelectLevel = (idx: number): void => {
    loadLevel(idx);
    setView("game");
  };

  return (
    <div className="w-full max-w-[450px] border border-cozy-border bg-black p-4 select-none relative flex flex-col items-center text-cozy-text max-h-[calc(100vh-120px)]">
      {view === "menu" ? (
        <LevelSelect
          onSelect={handleSelectLevel}
          bestStars={bestStars}
          currentLevelIdx={currentLevelIdx}
        />
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
