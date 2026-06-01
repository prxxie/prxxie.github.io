import React, { useEffect, useState } from "react";
import { PixelChickenIcon, PixelBearIcon, PixelMoonIcon, PixelSunIcon } from "./Icons";
import PetSprite from "../../shell/src/components/PetSprite";
import type { PetStatus } from "../../shell/src/types";
import { EVOLUTION_THRESHOLDS } from "../../shared/src/pet/evolution";

// --- Type matching useProgressService return shape ---
interface ProgressState {
  state: {
    pet: {
      xp: number;
      stage: number;
      lastFedAt: number;
      happiness: number;
      lastPlayedAt: number;
      isSleeping: boolean;
    };
    completedLevels: unknown[];
    foodConsumed: number;
  };
  isHungry: boolean;
  foodAvailable: number;
  hungryLevel: number;
  happiness: number;
  isSleeping: boolean;
  feedPet: () => Promise<void>;
  playWithPet: () => Promise<void>;
  toggleSleep: () => Promise<void>;
}

interface PetsAppProps {
  progressState?: ProgressState;
}

const getAsciiBar = (value: number): string => {
  const totalSegments = 12;
  const filledSegments = Math.round((value / 100) * totalSegments);
  const emptySegments = totalSegments - filledSegments;
  return `[${"█".repeat(filledSegments)}${"░".repeat(emptySegments)}] ${value}%`;
};

const getStageName = (stage: number): string => {
  switch (stage) {
    case 1: return "EGG";
    case 2: return "LEAFY SPROUT";
    case 3: return "BUDREPTILE";
    case 4: return "FLORASAUR";
    case 5: return "MEGA FLORASAUR";
    default: return "UNKNOWN";
  }
};

const getStageLore = (stage: number): string => {
  switch (stage) {
    case 1: return "A mysterious egg pulsing with green energy.";
    case 2: return "A tiny sprout! It wiggles when happy.";
    case 3: return "A leafy reptile — strong and determined!";
    case 4: return "A magnificent forest dinosaur with a blossomed flower.";
    case 5: return "Mega-Evolved Legend! Emits a glowing aura on leaf wings.";
    default: return "A mysterious digital creature.";
  }
};

const getXpToNextStage = (stage: number): number => {
  // EVOLUTION_THRESHOLDS = [0, 10, 30, 60, 100]
  // threshold[stage] is the XP required to reach `stage` (1-indexed)
  // so the XP needed to reach the NEXT stage is threshold[stage]
  return EVOLUTION_THRESHOLDS[stage] ?? EVOLUTION_THRESHOLDS[EVOLUTION_THRESHOLDS.length - 1];
};

export default function PetsApp({
  progressState,
}: PetsAppProps): React.ReactElement {
  const hasProgress = !!progressState;
  const petState = progressState?.state.pet ?? { xp: 0, stage: 1, isSleeping: false, happiness: 50, lastFedAt: 0, lastPlayedAt: 0 };
  const foodAvailable = progressState?.foodAvailable ?? 0;
  const isHungry = progressState?.isHungry ?? false;
  const hungryLevel = progressState?.hungryLevel ?? 0;
  const happiness = progressState?.happiness ?? 50;
  const isSleeping = progressState?.isSleeping ?? false;

  const [spriteStatus, setSpriteStatus] = useState<PetStatus>("idle");
  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationFrame((f) => (f + 1) % 2);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFeed = async () => {
    if (!hasProgress) return;
    await progressState.feedPet();
    setSpriteStatus("eating");
    setTimeout(() => setSpriteStatus("idle"), 2000);
  };

  const handlePlay = async () => {
    if (!hasProgress) return;
    await progressState.playWithPet();
    setSpriteStatus("playing");
    setTimeout(() => setSpriteStatus("idle"), 2000);
  };

  const handleSleepToggle = async () => {
    if (!hasProgress) return;
    await progressState.toggleSleep();
  };

  const canFeed = isHungry && foodAvailable > 0 && !isSleeping;
  const canPlay = !isSleeping;

  // Map 0-6 hunger level to 100% full down to 0%
  const hungerPct = Math.max(0, 100 - Math.round((hungryLevel / 6) * 100));

  // XP progress within current stage
  // EVOLUTION_THRESHOLDS[stage-1] = XP floor for current stage
  // EVOLUTION_THRESHOLDS[stage]   = XP needed for next stage
  const currentStageXpFloor = EVOLUTION_THRESHOLDS[petState.stage - 1] ?? 0;
  const nextStageXp = getXpToNextStage(petState.stage);
  const xpRange = nextStageXp - currentStageXpFloor;
  const xpProgress = xpRange > 0
    ? Math.min(100, Math.round(((petState.xp - currentStageXpFloor) / xpRange) * 100))
    : 100;

  return (
    <div className="flex flex-col items-center justify-between h-full py-4 px-2 box-border text-cozy-text font-mono">
      {/* Header */}
      <div className="w-full border-b border-dashed border-cozy-border pb-2 mb-4 text-center">
        <h2 className="font-press text-xs text-cozy-text">PET STATUS CONSOLE</h2>
        <p className="text-[8px] text-cozy-accent mt-1">
          {hasProgress ? "SYSTEM SYNC: ACTIVE" : "STANDALONE MODE"}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full items-center justify-center flex-1">
        {/* Pet Screen Frame */}
        <div className="flex flex-col items-center gap-2">
          <div className="p-4 border border-cozy-border bg-black rounded flex items-center justify-center w-40 h-40 relative overflow-hidden">
            <span className="absolute top-1 left-2 text-[10px] text-cozy-text font-mono select-none">+</span>
            <span className="absolute top-1 right-2 text-[10px] text-cozy-text font-mono select-none">+</span>
            <span className="absolute bottom-1 left-2 text-[10px] text-cozy-text font-mono select-none">+</span>
            <span className="absolute bottom-1 right-2 text-[10px] text-cozy-text font-mono select-none">+</span>

            <PetSprite
              size={120}
              stage={petState.stage}
              status={isSleeping ? "sleeping" : spriteStatus}
              isSleeping={isSleeping}
              isHungry={isHungry}
              animationFrame={animationFrame}
            />

            {isSleeping && (
              <span className="absolute top-2 right-2 text-cozy-text font-press text-[8px] animate-pulse">
                ZZZ...
              </span>
            )}
          </div>

          <div className="text-center">
            <span className="font-press text-[9px] block text-cozy-accent">
              {getStageName(petState.stage)}
            </span>
            <span className="text-[8px] max-w-[160px] block mt-1 leading-normal text-cozy-text opacity-85 italic">
              &ldquo;{getStageLore(petState.stage)}&rdquo;
            </span>
          </div>
        </div>

        {/* Stats and Action Buttons */}
        <div className="flex-1 flex flex-col gap-4 max-w-xs w-full">
          <div className="flex flex-col gap-2 text-[10px]">
            {/* XP Progress */}
            <div className="flex justify-between items-center">
              <span>XP PROGRESS:</span>
              <span>{petState.xp} XP</span>
            </div>
            <div className="border border-cozy-border h-2.5 bg-black p-0.5">
              <div
                className="bg-cozy-accent h-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="text-[8px] text-cozy-text opacity-60 text-right">
              {petState.stage < 5
                ? `→ STAGE ${petState.stage + 1} at ${nextStageXp} XP`
                : "MAX EVOLUTION REACHED ★"}
            </div>

            {/* Hunger bar */}
            <div className="flex justify-between items-center mt-1">
              <span>HUNGER (FULLNESS):</span>
              <span>{getAsciiBar(hungerPct)}</span>
            </div>

            {/* Happiness bar */}
            <div className="flex justify-between items-center mt-1">
              <span>HAPPINESS:</span>
              <span>{getAsciiBar(happiness)}</span>
            </div>

            {/* Status badge */}
            <div className="flex justify-between items-center mt-1">
              <span>STATUS:</span>
              <span className={isSleeping ? "text-blue-400" : isHungry ? "text-yellow-400" : "text-green-400"}>
                {isSleeping ? "SLEEPING 💤" : isHungry ? "HUNGRY 🍽" : "CONTENT ✓"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-dashed border-cozy-border pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-[9px] mb-1">
              <span>AVAILABLE FOOD:</span>
              <span className="text-cozy-accent">★ x {foodAvailable}</span>
            </div>

            <button
              onClick={() => { void handleFeed(); }}
              disabled={!canFeed || !hasProgress}
              className="pixel-btn text-[8px] py-1.5 w-full flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text disabled:opacity-40 disabled:pointer-events-none"
            >
              {isSleeping ? "WAKE UP TO FEED" : canFeed ? "FEED STAR-FOOD" : isHungry ? "NO STAR-FOOD" : "NOT HUNGRY"}
              <PixelChickenIcon className="w-3.5 h-3.5" />
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => { void handlePlay(); }}
                disabled={!canPlay || !hasProgress}
                className="pixel-btn text-[8px] py-1.5 flex-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text disabled:opacity-40 disabled:pointer-events-none"
              >
                PLAY <PixelBearIcon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { void handleSleepToggle(); }}
                disabled={!hasProgress}
                className="pixel-btn text-[8px] py-1.5 flex-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text disabled:opacity-40 disabled:pointer-events-none"
              >
                {isSleeping ? (
                  <>WAKE <PixelSunIcon className="w-3.5 h-3.5" /></>
                ) : (
                  <>SLEEP <PixelMoonIcon className="w-3.5 h-3.5" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
