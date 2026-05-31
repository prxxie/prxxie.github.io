import React, { useState, useCallback } from "react";
import PetSprite from "./PetSprite";
import { useProgressService } from "../hooks/useProgressService";
import type { PetStatus } from "../types";

export default function PetWidget(): React.ReactElement {
  const { state, isHungry, foodAvailable, feedPet } = useProgressService();
  const [spriteStatus, setSpriteStatus] = useState<PetStatus>("idle");

  const handleFeed = useCallback(async () => {
    await feedPet();
    setSpriteStatus("eating");
    setTimeout(() => setSpriteStatus("idle"), 2000);
  }, [feedPet]);

  const canFeed = isHungry && foodAvailable > 0;

  return (
    <div className="flex flex-col items-center gap-2 p-2 text-cozy-text">
      <div className="border border-cozy-border p-2 bg-black flex items-center justify-center">
        <PetSprite size={64} status={spriteStatus} />
      </div>

      <div className="w-full flex flex-col gap-1 font-mono text-[9px]">
        <div className="flex justify-between">
          <span className="font-press">STAGE:</span>
          <span>{state.pet.stage}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-press">XP:</span>
          <span>{state.pet.xp}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-press">FOOD:</span>
          <span>{foodAvailable}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-press">STATUS:</span>
          <span>{isHungry ? "HUNGRY" : "FULL"}</span>
        </div>
      </div>

      <button
        onClick={() => { void handleFeed(); }}
        disabled={!canFeed}
        className="w-full pixel-btn text-[8px] disabled:opacity-40 disabled:pointer-events-none"
      >
        {canFeed ? "FEED PET" : isHungry ? "NO FOOD" : "NOT HUNGRY"}
      </button>
    </div>
  );
}
