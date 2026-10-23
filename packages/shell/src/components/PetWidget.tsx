import React, { useState, useCallback, useEffect, useRef } from "react";
import PetSprite from "./PetSprite";
import { useProgressService } from "../hooks/useProgressService";
import type { PetStatus } from "../types";

export default function PetWidget(): React.ReactElement {
  const { state, isHungry, foodAvailable, feedPet, isSleeping } = useProgressService();
  const [spriteStatus, setSpriteStatus] = useState<PetStatus>("idle");
  const [isFeeding, setIsFeeding] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleFeed = useCallback(async () => {
    setIsFeeding(true);
    try {
      await feedPet();
      setSpriteStatus("eating");
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => setSpriteStatus("idle"), 2000);
    } catch {
      // Error is logged by useProgressService, we ignore it here to prevent crash
    } finally {
      setIsFeeding(false);
    }
  }, [feedPet]);

  const canFeed = isHungry && foodAvailable > 0 && !isSleeping && !isFeeding;

  // Get evolution stage name
  const getStageName = (stage: number) => {
    switch (stage) {
      case 1: return "EGG";
      case 2: return "LEAFY SPROUT";
      case 3: return "BUDREPTILE";
      case 4: return "FLORASAUR";
      case 5: return "MEGA FLORASAUR";
      default: return "UNKNOWN";
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-2 text-on-dark">
      <div className="panel panel-dark p-2 flex items-center justify-center relative w-20 h-20">
        <PetSprite
          size={64}
          stage={state.pet.stage}
          status={isSleeping ? "sleeping" : spriteStatus}
          isSleeping={isSleeping}
          isHungry={isHungry}
        />
      </div>

      <div className="w-full flex flex-col gap-1 font-code text-[9px]">
        <div className="flex justify-between">
          <span className="font-code">STAGE:</span>
          <span>{getStageName(state.pet.stage)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-code">XP:</span>
          <span>{state.pet.xp}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-code">FOOD:</span>
          <span>★ {foodAvailable}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-code">STATUS:</span>
          <span
            className={
              isSleeping ? "text-on-dark-soft" : isHungry ? "text-warning-on-dark" : "text-success-on-dark"
            }
          >
            {isSleeping ? "SLEEPING" : isHungry ? "HUNGRY" : "FULL"}
          </span>
        </div>
      </div>

      <button
        onClick={() => { void handleFeed(); }}
        disabled={!canFeed}
        className={`w-full btn text-[8px] disabled:opacity-40 disabled:pointer-events-none ${
          isHungry && foodAvailable === 0 ? "text-error-on-dark" : ""
        }`}
      >
        {isSleeping ? "AWAKE TO FEED" : canFeed ? "FEED PET" : isHungry ? "NO FOOD" : "NOT HUNGRY"}
      </button>
    </div>
  );
}

