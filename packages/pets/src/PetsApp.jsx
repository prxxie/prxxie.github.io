import React, { useEffect, useState } from 'react';
import { create } from 'zustand';

// Local fallback store for standalone development
const useLocalStore = create((set) => ({
  hunger: 50,
  happiness: 50,
  status: 'idle',
  isSleeping: false,
  feed: () => set((state) => {
    if (state.isSleeping) return {};
    return { hunger: Math.max(0, state.hunger - 20), status: 'eating' };
  }),
  play: () => set((state) => {
    if (state.isSleeping) return {};
    return { happiness: Math.min(100, state.happiness + 20), status: 'playing' };
  }),
  toggleSleep: () => set((state) => ({ isSleeping: !state.isSleeping, status: !state.isSleeping ? 'sleeping' : 'idle' })),
  setStatus: (status) => set({ status })
}));

export default function PetsApp({ usePetStore }) {
  const store = usePetStore || useLocalStore;

  const hunger = store((state) => state.hunger);
  const happiness = store((state) => state.happiness);
  const status = store((state) => state.status);
  const isSleeping = store((state) => state.isSleeping);
  const feed = store((state) => state.feed);
  const play = store((state) => state.play);
  const toggleSleep = store((state) => state.toggleSleep);
  const setStatus = store((state) => state.setStatus);

  const [animationFrame, setAnimationFrame] = useState(0);

  // Animation frame loop for leg bouncy movement
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationFrame((f) => (f + 1) % 2);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Clear status back to idle after 2 seconds of eating/playing
  useEffect(() => {
    if (status === 'eating' || status === 'playing') {
      const timer = setTimeout(() => {
        setStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status, setStatus]);

  // Simple procedural pixel pet rendering
  const renderPetSprite = () => {
    let color = '#2b4c3f';
    if (status === 'eating') color = '#996633';
    if (status === 'playing') color = '#2b4c3f';
    if (isSleeping) color = '#779988';

    return (
      <svg viewBox="0 0 16 16" className={`w-28 h-28 ${status === 'playing' ? 'animate-bounce' : ''}`}>
        {/* Main Body */}
        <rect x="4" y="4" width="8" height="8" fill={color} />
        {/* Bottom Feet */}
        {animationFrame === 0 ? (
          <>
            <rect x="4" y="12" width="2" height="2" fill="#000" />
            <rect x="10" y="12" width="2" height="2" fill="#000" />
          </>
        ) : (
          <>
            <rect x="5" y="12" width="2" height="2" fill="#000" />
            <rect x="9" y="12" width="2" height="2" fill="#000" />
          </>
        )}
        {/* Face */}
        {!isSleeping ? (
          <>
            <rect x="6" y="6" width="1" height="1" fill="#fff" />
            <rect x="9" y="6" width="1" height="1" fill="#fff" />
            <rect x="7" y="9" width="2" height="1" fill="#000" />
          </>
        ) : (
          <>
            <rect x="5" y="7" width="2" height="1" fill="#000" />
            <rect x="9" y="7" width="2" height="1" fill="#000" />
          </>
        )}
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center justify-between h-full py-2">
      <h2 className="font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1 w-full text-center">🐾 TAMAGOTCHI ROOM</h2>

      {/* Standalone UI enhancements */}
      <div className="flex gap-4 text-xs font-press bg-[#d7ecd9] border-2 border-cozy-border p-1 mb-2">
        <span>🍔 HNG: {hunger}</span>
        <span>💖 HPP: {happiness}</span>
      </div>

      {/* Pet display */}
      <div className={`p-4 border-4 border-cozy-border bg-white rounded flex items-center justify-center w-36 h-36 relative ${isSleeping ? 'bg-slate-900' : ''}`}>
        {renderPetSprite()}
        {isSleeping && <span className="absolute top-2 right-2 text-white font-press text-[8px] animate-pulse">Zzz...</span>}
      </div>

      {/* Buttons to mutate store state */}
      <div className="flex gap-2 w-full">
        <button onClick={feed} className="pixel-btn text-[8px] flex-1 py-1">FEED 🍗</button>
        <button onClick={play} className="pixel-btn text-[8px] flex-1 py-1">PLAY 🧸</button>
        <button onClick={toggleSleep} className="pixel-btn text-[8px] flex-1 py-1">
          {isSleeping ? 'WAKE ☀' : 'SLEEP 🌙'}
        </button>
      </div>
    </div>
  );
}
