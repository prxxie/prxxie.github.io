import React, { useEffect } from 'react';
import { useShikakuStore } from '../store/useShikakuStore';
import { synth } from '../engine/synth';

export default function HUD({ onBack }) {
  const { 
    puzzle, 
    elapsedTime, 
    isWon, 
    starsAchieved, 
    undo, 
    resetLevel, 
    getHint,
    tickTimer
  } = useShikakuStore();

  useEffect(() => {
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col gap-4 border-b-2 border-[#2b4c3f] pb-4 font-press text-[10px] text-[#2b4c3f]">
      <div className="flex justify-between items-center">
        <button 
          onClick={() => { synth.playClick(); onBack(); }}
          className="border-2 border-[#2b4c3f] bg-[#e2f4e5] px-2 py-1 cursor-pointer active:translate-y-0.5"
        >
          ◀ BACK
        </button>
        <span>LVL: {puzzle?.id?.toUpperCase()}</span>
        <span className="font-mono text-sm">{formatTime(elapsedTime)}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button 
            onClick={() => { synth.playClick(); undo(); }}
            className="border-2 border-[#2b4c3f] bg-[#e2f4e5] px-2 py-1 cursor-pointer active:translate-y-0.5"
          >
            UNDO
          </button>
          <button 
            onClick={() => { synth.playClick(); resetLevel(); }}
            className="border-2 border-[#2b4c3f] bg-[#e2f4e5] px-2 py-1 cursor-pointer active:translate-y-0.5"
          >
            RESET
          </button>
          <button 
            onClick={() => { synth.playClick(); getHint(); }}
            className="border-2 border-[#2b4c3f] bg-[#e2f4e5] px-2 py-1 cursor-pointer active:translate-y-0.5"
          >
            HINT
          </button>
        </div>
        <div>
          {"★".repeat(starsAchieved)}{"☆".repeat(3 - starsAchieved)}
        </div>
      </div>
    </div>
  );
}
