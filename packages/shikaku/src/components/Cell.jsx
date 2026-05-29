import React from 'react';

export default function Cell({ x, y, clue, isCovered, onPointerDown, onPointerEnter }) {
  return (
    <div
      onPointerDown={(e) => {
        e.preventDefault();
        try {
          e.target.releasePointerCapture(e.pointerId);
        } catch (err) {
          // Fail silently in environments where pointer capture methods are absent
        }
        onPointerDown(x, y);
      }}
      onPointerEnter={() => onPointerEnter(x, y)}
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

