import React, { useEffect, useState } from 'react';

// Remote imports state store safely
let usePetStore;
try {
  const storeModule = await import('shell/petStore');
  usePetStore = storeModule.usePetStore;
} catch (e) {
  // Local fallback store if shell isn't active
  const create = (await import('zustand')).create;
  usePetStore = create((set) => ({
    hunger: 50,
    happiness: 50,
    status: 'idle',
    isSleeping: false,
    feed: () => set((state) => ({ hunger: Math.max(0, state.hunger - 20), status: 'eating' })),
    play: () => set((state) => ({ happiness: Math.min(100, state.happiness + 20), status: 'playing' })),
    toggleSleep: () => set((state) => ({ isSleeping: !state.isSleeping, status: !state.isSleeping ? 'sleeping' : 'idle' })),
    setStatus: (status) => set({ status })
  }));
}

export default function PetsApp() {
  const hunger = usePetStore((state) => state.hunger);
  const happiness = usePetStore((state) => state.happiness);
  const status = usePetStore((state) => state.status);
  const isSleeping = usePetStore((state) => state.isSleeping);
  const feed = usePetStore((state) => state.feed);
  const play = usePetStore((state) => state.play);
  const toggleSleep = usePetStore((state) => state.toggleSleep);
  const setStatus = usePetStore((state) => state.setStatus);

  const [animationFrame, setAnimationFrame] = useState(0);

  // Basic animation frame loop for bouncy movement
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationFrame((f) => (f + 1) % 2);
      // Clear action status back to idle
      if (status === 'eating' || status === 'playing') {
        setTimeout(() => setStatus('idle'), 2000);
      }
    }, 1000);
    return () => clearInterval(timer);
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
