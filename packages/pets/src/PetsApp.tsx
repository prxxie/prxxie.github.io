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
        <div className="flex gap-4 text-xs font-press bg-[#f8f9fa] border-2 border-cozy-border p-2 mb-2 box-border items-center">
          <span className="flex items-center gap-1"><PixelChickenIcon className="w-3.5 h-3.5" /> HNG: {hunger}</span>
          <span className="flex items-center gap-1"><PixelHeartIcon className="w-3.5 h-3.5" /> HPP: {happiness}</span>
        </div>
      )}

      {usePetStore && (
        <div className="w-full flex flex-col gap-2 text-xs mb-4">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1"><PixelChickenIcon className="w-3.5 h-3.5" /> HUNGER</span>
            <span>{hunger}/100</span>
          </div>
          <div className="h-4 border-2 border-cozy-border bg-gray-100 relative">
            <div
              className="h-full bg-cozy-accent"
              style={{ width: `${hunger}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="flex items-center gap-1"><PixelHeartIcon className="w-3.5 h-3.5" /> HAPPINESS</span>
            <span>{happiness}/100</span>
          </div>
          <div className="h-4 border-2 border-cozy-border bg-gray-100 relative">
            <div
              className="h-full bg-cozy-accent"
              style={{ width: `${happiness}%` }}
            ></div>
          </div>
        </div>
      )}

      <div
        className={`p-4 border-4 border-cozy-border bg-white rounded flex items-center justify-center w-36 h-36 relative ${isSleeping ? "bg-slate-900" : ""}`}
      >
        {renderPetSprite()}
        {isSleeping && (
          <span className="absolute top-2 right-2 text-white font-press text-[8px] animate-pulse">
            Zzz...
          </span>
        )}
      </div>

      <div className="flex gap-2 w-full mt-4">
        <button onClick={feed} className="pixel-btn text-[8px] flex-1 py-1 flex items-center justify-center gap-1">
          FEED <PixelChickenIcon className="w-3.5 h-3.5" />
        </button>
        <button onClick={play} className="pixel-btn text-[8px] flex-1 py-1 flex items-center justify-center gap-1">
          PLAY <PixelBearIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={toggleSleep}
          className="pixel-btn text-[8px] flex-1 py-1 flex items-center justify-center gap-1"
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
