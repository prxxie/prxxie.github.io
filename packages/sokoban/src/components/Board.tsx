import React from "react";
import { useSokobanStore } from "../store/useSokobanStore";
import { TileType } from "../types";

export default function Board(): React.ReactElement {
  const board = useSokobanStore((state) => state.board);
  const player = useSokobanStore((state) => state.player);
  const boxes = useSokobanStore((state) => state.boxes);
  const deadlockedBoxIds = useSokobanStore((state) => state.deadlockedBoxIds);

  if (board.length === 0) return <div>No Board Loaded</div>;

  const rows = board.length;
  const cols = board[0].length;

  const tileWidthPercent = 100 / cols;
  const tileHeightPercent = 100 / rows;

  return (
    <div
      className="relative w-full border border-[#FFB000] bg-[#050505] select-none overflow-hidden"
      style={{ aspectRatio: `${cols} / ${rows}` }}
    >
      {/* Render Static Tiles (Wall, Floor, Target) */}
      {board.map((row, y) =>
        row.map((cell, x) => {
          if (cell === TileType.EMPTY) return null;

          return (
            <div
              key={`tile-${x}-${y}`}
              className="absolute"
              style={{
                left: `${x * tileWidthPercent}%`,
                top: `${y * tileHeightPercent}%`,
                width: `${tileWidthPercent}%`,
                height: `${tileHeightPercent}%`,
              }}
            >
              {cell === TileType.WALL && (
                <div className="w-full h-full border-[1.5px] border-[#FFB000] bg-[#805800]" />
              )}
              {cell === TileType.FLOOR && (
                <div className="w-full h-full bg-[#000000]" />
              )}
              {cell === TileType.TARGET && (
                <div className="w-full h-full bg-[#000000] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#FFB000] border border-cozy-border opacity-80" />
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Render Boxes */}
      {boxes.map((box) => {
        const isOnTarget = board[box.y]?.[box.x] === TileType.TARGET;
        const isDeadlocked = deadlockedBoxIds.includes(box.id);

        return (
          <div
            key={box.id}
            className="absolute p-[2px] transition-all duration-[120ms] ease-out z-10"
            style={{
              left: `${box.x * tileWidthPercent}%`,
              top: `${box.y * tileHeightPercent}%`,
              width: `${tileWidthPercent}%`,
              height: `${tileHeightPercent}%`,
            }}
          >
            <div
              className={`w-full h-full border border-cozy-border flex items-center justify-center font-bold font-press text-[8px] transition-colors relative
                ${isOnTarget ? "bg-[#805800] text-black" : "bg-black text-[#FFB000]"}
                ${isDeadlocked ? "opacity-60 border-dashed animate-pulse" : ""}
              `}
              style={{
                clipPath: "polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)"
              }}
            >
              <div className="absolute inset-0 border border-cozy-border pointer-events-none opacity-20 m-1" />
              📦
              {isDeadlocked && (
                <span className="absolute top-0 right-0 bg-[#FFB000] text-black text-[6px] px-0.5 rounded leading-none">
                  !
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Render Player */}
      <div
        className="absolute p-[2px] transition-all duration-[100ms] ease-out z-20"
        style={{
          left: `${player.x * tileWidthPercent}%`,
          top: `${player.y * tileHeightPercent}%`,
          width: `${tileWidthPercent}%`,
          height: `${tileHeightPercent}%`,
        }}
      >
        <div
          className="w-full h-full bg-[#FFB000] border border-cozy-border flex items-center justify-center text-[12px] relative"
          style={{
            borderRadius: "50%"
          }}
        >
          <div className="absolute top-1 left-1.5 w-1 h-1 bg-black rounded-full" />
          <div className="absolute top-1 right-1.5 w-1 h-1 bg-black rounded-full" />
          🧑
        </div>
      </div>
    </div>
  );
}
