import React from 'react';

export default function Cell({ x, y, clue, isCovered, onPointerDown, onPointerEnter, onPointerUp }) {
  return (
    <div
      onPointerDown={(e) => {
        e.preventDefault();
        onPointerDown(x, y);
      }}
      onPointerEnter={() => onPointerEnter(x, y)}
      onPointerUp={onPointerUp}
      className="aspect-square border border-[#2b4c3f]/30 bg-[#e2f4e5] select-none flex items-center justify-center relative touch-none"
      style={{ touchAction: 'none' }}
    >
      {clue !== undefined && (
        <span className={`font-press text-[12px] ${isCovered ? 'opacity-30' : 'font-bold'}`}>
          {clue}
        </span>
      )}
    </div>
  );
}
