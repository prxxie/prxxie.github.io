import React from 'react';
import { usePetStore } from '../store/petStore';

export default function ConsoleFrame({ children, currentTab, setTab }) {
  const hunger = usePetStore((state) => state.hunger);
  const happiness = usePetStore((state) => state.happiness);
  const status = usePetStore((state) => state.status);

  return (
    <div className="w-[500px] pixel-border bg-[#cce9d2] p-6 rounded-lg flex flex-col gap-4">
      {/* Status Bar */}
      <div className="flex justify-between items-center bg-[#fff] p-2 border-2 border-cozy-border font-press text-[8px]">
        <span>🔋 COZY-OS v1.0</span>
        <span>STATUS: {status.toUpperCase()}</span>
      </div>

      {/* Console Screen */}
      <div className="bg-[#fff] min-h-[300px] border-4 border-cozy-border p-4 relative overflow-hidden flex flex-col justify-between">
        <div className="flex-1">{children}</div>
      </div>

      {/* Pet status LCD indicator */}
      <div className="grid grid-cols-2 gap-2 bg-[#d7ecd9] border-2 border-cozy-border p-2 text-sm">
        <div>🍔 HUNGER: {hunger}/100</div>
        <div>💖 HAPPY: {happiness}/100</div>
      </div>

      {/* Action Controls */}
      <div className="flex justify-around gap-2 mt-2">
        <button onClick={() => setTab('home')} className={`pixel-btn flex-1 ${currentTab === 'home' ? 'bg-[#bce0c3]' : ''}`}>
          HOME
        </button>
        <button onClick={() => setTab('about')} className={`pixel-btn flex-1 ${currentTab === 'about' ? 'bg-[#bce0c3]' : ''}`}>
          ABOUT
        </button>
        <button onClick={() => setTab('posts')} className={`pixel-btn flex-1 ${currentTab === 'posts' ? 'bg-[#bce0c3]' : ''}`}>
          POSTS
        </button>
        <button onClick={() => setTab('pets')} className={`pixel-btn flex-1 ${currentTab === 'pets' ? 'bg-[#bce0c3]' : ''}`}>
          PETS
        </button>
      </div>
    </div>
  );
}
