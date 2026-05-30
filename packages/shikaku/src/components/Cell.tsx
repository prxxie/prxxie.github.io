import React from "react";

interface CellProps {
  x: number;
  y: number;
  clue: number | undefined;
  isCovered: boolean;
  onPointerDown: (x: number, y: number) => void;
  onPointerEnter: (x: number, y: number) => void;
}

export default function Cell({
  x,
  y,
  clue,
  isCovered,
  onPointerDown,
  onPointerEnter,
}: CellProps): React.ReactElement {
  return (
    <div
      onPointerDown={(e) => {
        e.preventDefault();
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          // Fail silently in environments where pointer capture methods are absent
        }
        onPointerDown(x, y);
      }}
      onPointerEnter={() => onPointerEnter(x, y)}
      className="aspect-square border border-cozy-border bg-black text-cozy-text hover:bg-[#101010] select-none flex items-center justify-center relative touch-none"
      style={{ touchAction: "none" }}
    >
      {clue !== undefined && (
        <span
          className={`font-press text-[12px] ${isCovered ? "opacity-30" : "font-bold"}`}
        >
          {clue}
        </span>
      )}
    </div>
  );
}
