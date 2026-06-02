import React, { useState, useEffect, useCallback } from "react";
import { ProgressService, LocalProgressRepository } from "shared";
import { useSlitherlinkStore } from "./store/useSlitherlinkStore";
import { SLITHERLINK_LEVELS } from "./levels";
import HUD from "./components/HUD";
import Board from "./components/Board";
import LevelSelect from "./components/LevelSelect";
import WinModal from "./components/WinModal";

const progressService = new ProgressService(new LocalProgressRepository());

export default function SlitherlinkApp(): React.ReactElement {
  const [view, setView] = useState<"menu" | "game">("menu");
  const [completedLevels, setCompletedLevels] = useState<Record<string, number>>({});
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);

  const level = useSlitherlinkStore((state) => state.level);
  const isWon = useSlitherlinkStore((state) => state.isWon);
  const starsAchieved = useSlitherlinkStore((state) => state.starsAchieved);
  const loadLevel = useSlitherlinkStore((state) => state.loadLevel);

  const refreshProgress = useCallback(async () => {
    const state = await progressService.getState();
    const map: Record<string, number> = {};
    for (const c of state.completedLevels) {
      if (c.module === "slitherlink") {
        map[c.levelId] = c.stars ?? 1;
      }
    }
    setCompletedLevels(map);
  }, []);

  useEffect(() => {
    void refreshProgress();
    const handler = () => { void refreshProgress(); };
    window.addEventListener("cozyos:progress-updated", handler);
    return () => window.removeEventListener("cozyos:progress-updated", handler);
  }, [refreshProgress]);

  // Handle level completion saving
  useEffect(() => {
    if (isWon && level && view === "game") {
      progressService.completeLevelWithStars("slitherlink", level.id, starsAchieved)
        .then((firstTime) => {
          setRewardMsg(firstTime ? "+1 FOOD" : "ALREADY COMPLETE");
        })
        .catch((err) => {
          console.error("Failed to complete level:", err);
        });
    }
  }, [isWon, level, starsAchieved, view]);

  const handleSelectLevel = (idx: number): void => {
    setRewardMsg(null);
    loadLevel(SLITHERLINK_LEVELS[idx]);
    setView("game");
  };

  return (
    <div className="w-full max-w-[450px] border border-cozy-border bg-black p-6 select-none text-cozy-text flex flex-col items-center">
      {view === "menu" ? (
        <LevelSelect
          onSelect={handleSelectLevel}
          completedLevels={completedLevels}
        />
      ) : (
        <div className="flex flex-col gap-6 items-center w-full">
          <HUD onBack={() => setView("menu")} />
          <Board />
          <WinModal onBack={() => setView("menu")} rewardMsg={rewardMsg} />
        </div>
      )}
    </div>
  );
}
