import React, { useEffect } from "react";
import { useSokobanStore } from "../store/useSokobanStore";
import { TileType } from "../types";
import PetSprite from "./PetSprite";

export default function Board(): React.ReactElement {
  const board = useSokobanStore((state) => state.board);
  const player = useSokobanStore((state) => state.player);
  const boxes = useSokobanStore((state) => state.boxes);
  const deadlockedBoxIds = useSokobanStore((state) => state.deadlockedBoxIds);
  const lastDirection = useSokobanStore((state) => state.lastDirection);
  const isMoving = useSokobanStore((state) => state.isMoving);

  const [animFrame, setAnimFrame] = React.useState(0);

  useEffect(() => {
    const timer = setInterval(() => setAnimFrame((f) => (f + 1) % 2), 400);
    return () => clearInterval(timer);
  }, []);

  if (board.length === 0) return <div className="font-mono text-cozy-text p-4 text-[10px]">LOADING BOARD...</div>;

  const rows = board.length;
  const cols = board[0].length;
  const tileWidthPercent = 100 / cols;
  const tileHeightPercent = 100 / rows;

  return (
    <div
      className="relative w-full border border-[#FFB000] bg-[#0a0a0a] select-none overflow-hidden rounded-sm"
      style={{ aspectRatio: `${cols} / ${rows}` }}
    >
      {/* ── Render Static Tiles ── */}
      {board.map((row, y) =>
        row.map((cell, x) => {
          if (cell === TileType.EMPTY) return null;
          const isTarget = cell === TileType.TARGET;

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
                <div className="w-full h-full bg-[#1a1200] border border-[#FFB000]/40 flex items-center justify-center">
                  <div className="w-1/2 h-1/2 border border-[#FFB000]/20 rotate-45" />
                </div>
              )}
              {cell === TileType.FLOOR && (
                <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
                  <div className="w-[1px] h-[1px] bg-[#FFB000]/10 rounded-full" />
                </div>
              )}
              {isTarget && (
                <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
                  <div
                    className="w-2/5 h-2/5 rounded-full border border-[#FFB000]/70 bg-[#FFB000]/10"
                    style={{
                      animation: "targetPulse 1.5s ease-in-out infinite",
                      boxShadow: "0 0 6px rgba(255, 176, 0, 0.2)",
                    }}
                  />
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ── Boxes ── */}
      {boxes.map((box) => {
        const isOnTarget = board[box.y]?.[box.x] === TileType.TARGET;
        const isDeadlocked = deadlockedBoxIds.includes(box.id);

        return (
          <div
            key={box.id}
            className="absolute p-[1.5px] z-10"
            style={{
              left: `${box.x * tileWidthPercent}%`,
              top: `${box.y * tileHeightPercent}%`,
              width: `${tileWidthPercent}%`,
              height: `${tileHeightPercent}%`,
              transition: "left 100ms ease-out, top 100ms ease-out",
            }}
          >
            <div
              className={`w-full h-full flex items-center justify-center font-press text-[7px] relative
                ${isOnTarget
                  ? "bg-[#805800] text-black border border-[#FFB000]/80"
                  : "bg-[#1a1400] text-[#FFB000] border border-[#FFB000]/50"
                }
                ${isDeadlocked ? "opacity-50 border-dashed" : ""}
              `}
              style={{
                clipPath: "polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)",
              }}
            >
              {/* Cross pattern on crate */}
              <div className="absolute inset-[3px] border border-[#FFB000]/20 pointer-events-none" />
              <div className="absolute left-1/2 top-1/4 w-[1px] h-1/2 bg-[#FFB000]/20 -translate-x-1/2" />
              <div className="absolute top-1/2 left-1/4 h-[1px] w-1/2 bg-[#FFB000]/20 -translate-y-1/2" />
              {isDeadlocked && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#FF4444] text-black text-[5px] w-2.5 h-2.5 flex items-center justify-center rounded-full font-bold leading-none" style={{ fontSize: "5px" }}>
                  !
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* ── Player (PetSprite) ── */}
      <div
        className="absolute z-20"
        style={{
          left: `${player.x * tileWidthPercent}%`,
          top: `${player.y * tileHeightPercent}%`,
          width: `${tileWidthPercent}%`,
          height: `${tileHeightPercent}%`,
          transition: "left 80ms ease-out, top 80ms ease-out",
        }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <PetSprite
            size={Math.min(tileWidthPercent * cols / 100 * 16, 16)}
            status={isMoving ? "moving" : "idle"}
            direction={lastDirection}
            animationFrame={animFrame}
            className="drop-shadow-[0_0_4px_rgba(255,176,0,0.3)]"
          />
        </div>
      </div>

      <style>{`
        @keyframes targetPulse {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
