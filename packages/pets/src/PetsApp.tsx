import React, { useEffect, useState } from "react";
import { PixelChickenIcon, PixelBearIcon, PixelMoonIcon, PixelSunIcon, PixelHeartIcon } from "./Icons";
import { create, type StoreApi, type UseBoundStore } from "zustand";

type PetStatus = "idle" | "eating" | "playing" | "sleeping";

interface PetState {
  hunger: number;
  happiness: number;
  status: PetStatus;
  isSleeping: boolean;
  feed: () => void;
  play: () => void;
  toggleSleep: () => void;
  setStatus: (status: PetStatus) => void;
  tick?: () => void; // Optional fallback tick
}

type PetStore = UseBoundStore<StoreApi<PetState>>;

const useLocalStore = create<PetState>()((set) => ({
  hunger: 50,
  happiness: 50,
  status: "idle",
  isSleeping: false,

  feed: () =>
    set((state) => {
      if (state.isSleeping) return state;
      return {
        ...state,
        hunger: Math.max(0, state.hunger - 20),
        status: "eating",
      };
    }),
  play: () =>
    set((state) => {
      if (state.isSleeping) return state;
      return {
        ...state,
        happiness: Math.min(100, state.happiness + 20),
        status: "playing",
      };
    }),
  toggleSleep: () =>
    set((state) => ({
      isSleeping: !state.isSleeping,
      status: !state.isSleeping ? "sleeping" : "idle",
    })),
  setStatus: (status: PetStatus) => set({ status }),
}));

interface PetsAppProps {
  usePetStore?: PetStore;
}

const getAsciiBar = (value: number): string => {
  const totalSegments = 12;
  const filledSegments = Math.round((value / 100) * totalSegments);
  const emptySegments = totalSegments - filledSegments;
  return `[${"█".repeat(filledSegments)}${"░".repeat(emptySegments)}] ${value}%`;
};

export default function PetsApp({
  usePetStore,
}: PetsAppProps): React.ReactElement {
  const store: PetStore = usePetStore || useLocalStore;

  const hunger = store((state) => state.hunger);
  const happiness = store((state) => state.happiness);
  const status = store((state) => state.status);
  const isSleeping = store((state) => state.isSleeping);
  const feed = store((state) => state.feed);
  const play = store((state) => state.play);
  const toggleSleep = store((state) => state.toggleSleep);
  const setStatus = store((state) => state.setStatus);

  const [animationFrame, setAnimationFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationFrame((f) => (f + 1) % 2);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (status === "eating" || status === "playing") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, setStatus]);

  const renderPetSprite = (): React.ReactNode => {
    let color = "oklch(20.8% 0.042 265.755)";
    if (status === "eating") color = "#CC6666";
    if (status === "playing") color = "#CC6666";
    if (isSleeping) color = "#779988";

    return (
      <svg
        viewBox="0 0 16 16"
        className={`w-28 h-28 ${status === "playing" ? "animate-bounce" : ""}`}
      >
        <rect x="4" y="4" width="8" height="8" fill={color} />
        {animationFrame === 0 ? (
          <>
            <rect
              x="4"
              y="12"
              width="2"
              height="2"
              fill="var(--color-cozy-border)"
            />
            <rect
              x="10"
              y="12"
              width="2"
              height="2"
              fill="var(--color-cozy-border)"
            />
          </>
        ) : (
          <>
            <rect
              x="5"
              y="12"
              width="2"
              height="2"
              fill="var(--color-cozy-border)"
            />
            <rect
              x="9"
              y="12"
              width="2"
              height="2"
              fill="var(--color-cozy-border)"
            />
          </>
        )}
        {!isSleeping ? (
          <>
            <rect x="6" y="6" width="1" height="1" fill="#fff" />
            <rect x="9" y="6" width="1" height="1" fill="#fff" />
            <rect
              x="7"
              y="9"
              width="2"
              height="1"
              fill="var(--color-cozy-border)"
            />
          </>
        ) : (
          <>
            <rect
              x="5"
              y="7"
              width="2"
              height="1"
              fill="var(--color-cozy-border)"
            />
            <rect
              x="9"
              y="7"
              width="2"
              height="1"
              fill="var(--color-cozy-border)"
            />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-2 box-border">
      {!usePetStore && (
        <div className="flex gap-4 text-xs font-press bg-black border border-cozy-border p-2 mb-2 box-border items-center text-cozy-text">
          <span className="flex items-center gap-1"><PixelChickenIcon className="w-3.5 h-3.5" /> HNG: {hunger}</span>
          <span className="flex items-center gap-1"><PixelHeartIcon className="w-3.5 h-3.5" /> HPP: {happiness}</span>
        </div>
      )}

      {usePetStore && (
        <div className="w-full flex flex-col gap-2 text-xs font-mono mb-4 text-cozy-text">
          <div className="flex justify-between items-center">
            <span>HUNGER:</span>
            <span className="font-mono">{getAsciiBar(hunger)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>HAPPINESS:</span>
            <span className="font-mono">{getAsciiBar(happiness)}</span>
          </div>
        </div>
      )}

      <div
        className={`p-4 border border-cozy-border bg-black rounded flex items-center justify-center w-36 h-36 relative overflow-hidden`}
      >
        {/* Corner Crosshairs */}
        <span className="absolute top-1 left-2 text-[10px] text-cozy-text font-mono select-none">+</span>
        <span className="absolute top-1 right-2 text-[10px] text-cozy-text font-mono select-none">+</span>
        <span className="absolute bottom-1 left-2 text-[10px] text-cozy-text font-mono select-none">+</span>
        <span className="absolute bottom-1 right-2 text-[10px] text-cozy-text font-mono select-none">+</span>

        <div style={{ filter: "sepia(1) saturate(5) hue-rotate(5deg) brightness(1.2)" }}>
          {renderPetSprite()}
        </div>

        {isSleeping && (
          <span className="absolute top-2 right-2 text-cozy-text font-press text-[8px] animate-pulse">
            ZZZ...
          </span>
        )}
      </div>

      <div className="flex gap-2 w-full mt-4">
        <button
          onClick={feed}
          className="pixel-btn text-[8px] flex-1 py-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text"
        >
          FEED <PixelChickenIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={play}
          className="pixel-btn text-[8px] flex-1 py-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text"
        >
          PLAY <PixelBearIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleSleep}
          className="pixel-btn text-[8px] flex-1 py-1 flex items-center justify-center gap-1 bg-cozy-accent text-cozy-bg border-cozy-border hover:bg-black hover:text-cozy-text"
        >
          {isSleeping ? (
            <>
              WAKE <PixelSunIcon className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              SLEEP <PixelMoonIcon className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
