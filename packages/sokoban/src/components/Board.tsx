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
      className="relative w-full border border-[#FFB000] bg-[#050505] select-none overflow-hidden rounded-sm"
      style={{ aspectRatio: `${cols} / ${rows}` }}
    >
      {/* ── Render Static Tiles ── */}
      {board.map((row, y) =>
        row.map((cell, x) => {
          if (cell === TileType.EMPTY) return null;
          const isTarget = cell === TileType.TARGET;
          const isWall = cell === TileType.WALL;

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
              {/* ── Floor (all non-empty tiles) ── */}
              <div className="w-full h-full bg-[#080703]">
                {/* Subtle floor grid dots at intersections */}
                <div
                  className="absolute bottom-0 right-0 w-[1px] h-[1px] bg-[#FFB000]/8"
                  style={{ boxShadow: "-1px -1px 0 0 rgba(255,176,0,0.04)" }}
                />
              </div>

              {/* ── WALL: Stone brick ── */}
              {isWall && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Base stone block */}
                  <div className="w-[85%] h-[85%] bg-gradient-to-br from-[#1a1410] via-[#15100a] to-[#0f0b06] border border-[#FFB000]/25 rounded-[1px] relative overflow-hidden">
                    {/* Brick pattern — horizontal mortar line */}
                    <div className="absolute inset-x-[15%] top-1/2 h-[1px] bg-[#FFB000]/8 -translate-y-1/2" />
                    {/* Brick pattern — vertical mortar line (offset for staggered look) */}
                    <div
                      className="absolute top-0 bottom-1/2 w-[1px] bg-[#FFB000]/8 left-1/3"
                    />
                    <div
                      className="absolute top-1/2 bottom-0 w-[1px] bg-[#FFB000]/8 left-2/3"
                    />
                    {/* Stone highlight (top edge) */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-b from-[#FFB000]/15 to-transparent" />
                    {/* Stone shadow (bottom edge) */}
                    <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-t from-black/60 to-transparent" />
                    {/* Surface grain */}
                    <div className="absolute inset-[15%] opacity-[0.04]">
                      <div className="w-full h-full" style={{
                        backgroundImage:
                          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,176,0,0.3) 2px, rgba(255,176,0,0.3) 3px)",
                      }} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── TARGET / GOAL: Glowing landing pad ── */}
              {isTarget && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* Outer glow ring */}
                  <div
                    className="absolute w-3/5 h-3/5 rounded-full opacity-40"
                    style={{
                      background: "radial-gradient(circle, rgba(255,176,0,0.5) 0%, transparent 70%)",
                      animation: "targetPulse 2s ease-in-out infinite",
                    }}
                  />
                  {/* Diamond target indicator */}
                  <div className="relative flex items-center justify-center">
                    {/* Diamond outer */}
                    <div
                      className="w-[40%] h-[40%] rotate-45 border border-[#FFB000]/60"
                      style={{
                        background: "linear-gradient(135deg, rgba(255,176,0,0.15), rgba(255,176,0,0.05))",
                        boxShadow: "inset 0 0 6px rgba(255,176,0,0.1)",
                      }}
                    >
                      {/* Diamond inner */}
                      <div className="w-[60%] h-[60%] m-[20%] rotate-45 border border-[#FFB000]/30 bg-[#FFB000]/5" />
                    </div>
                    {/* Center dot */}
                    <div className="absolute w-[6px] h-[6px] rounded-full bg-[#FFB000]/40" />
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ── Boxes: Wooden crate ── */}
      {boxes.map((box) => {
        const isOnTarget = board[box.y]?.[box.x] === TileType.TARGET;
        const isDeadlocked = deadlockedBoxIds.includes(box.id);

        return (
          <div
            key={box.id}
            className="absolute p-[2px] z-10"
            style={{
              left: `${box.x * tileWidthPercent}%`,
              top: `${box.y * tileHeightPercent}%`,
              width: `${tileWidthPercent}%`,
              height: `${tileHeightPercent}%`,
              transition: "left 100ms ease-out, top 100ms ease-out",
            }}
          >
            <div
              className={`w-full h-full relative overflow-hidden
                ${isDeadlocked ? "opacity-60" : ""}
              `}
            >
              {/* Crate body */}
              <div
                className={`w-full h-full rounded-[1px] relative overflow-hidden
                  ${isOnTarget
                    ? "bg-gradient-to-br from-[#3a2a00] via-[#2a1a00] to-[#1a0e00] border border-[#FFB000]/70"
                    : "bg-gradient-to-br from-[#2a1a0a] via-[#1f1205] to-[#150d03] border border-[#FFB000]/35"
                  }
                `}
                style={{
                  boxShadow: isOnTarget
                    ? "inset 0 0 10px rgba(255,176,0,0.12), 0 0 6px rgba(255,176,0,0.08)"
                    : "inset 0 1px 0 rgba(255,176,0,0.08), inset 0 -1px 0 rgba(0,0,0,0.3)",
                }}
              >
                {/* Wood plank lines (horizontal) */}
                <div className="absolute inset-x-[8%] top-[30%] h-[1px] bg-[#FFB000]/10" />
                <div className="absolute inset-x-[8%] top-[55%] h-[1px] bg-[#FFB000]/10" />
                <div className="absolute inset-x-[8%] top-[80%] h-[1px] bg-[#FFB000]/10" />

                {/* Wood grain stripes */}
                <div className="absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,176,0,0.5) 3px, rgba(255,176,0,0.5) 4px)",
                  }}
                />

                {/* Cross bracing (diagonal) */}
                <div
                  className="absolute top-0 left-0 w-[35%] h-[1px] bg-[#FFB000]/10"
                  style={{ transform: "rotate(35deg)", transformOrigin: "top left" }}
                />
                <div
                  className="absolute bottom-0 right-0 w-[35%] h-[1px] bg-[#FFB000]/10"
                  style={{ transform: "rotate(35deg)", transformOrigin: "bottom right" }}
                />
                <div
                  className="absolute top-0 right-0 w-[35%] h-[1px] bg-[#FFB000]/10"
                  style={{ transform: "rotate(-35deg)", transformOrigin: "top right" }}
                />
                <div
                  className="absolute bottom-0 left-0 w-[35%] h-[1px] bg-[#FFB000]/10"
                  style={{ transform: "rotate(-35deg)", transformOrigin: "bottom left" }}
                />

                {/* Metal corner brackets */}
                <div className="absolute top-[2px] left-[2px] w-[5px] h-[5px] border-l-[1.5px] border-t-[1.5px] border-[#FFB000]/25 rounded-tl-[1px]" />
                <div className="absolute top-[2px] right-[2px] w-[5px] h-[5px] border-r-[1.5px] border-t-[1.5px] border-[#FFB000]/25 rounded-tr-[1px]" />
                <div className="absolute bottom-[2px] left-[2px] w-[5px] h-[5px] border-l-[1.5px] border-b-[1.5px] border-[#FFB000]/25 rounded-bl-[1px]" />
                <div className="absolute bottom-[2px] right-[2px] w-[5px] h-[5px] border-r-[1.5px] border-b-[1.5px] border-[#FFB000]/25 rounded-br-[1px]" />

                {/* Top highlight */}
                <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-b from-[#FFB000]/10 to-transparent" />

                {/* On-target golden glow overlay */}
                {isOnTarget && (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "radial-gradient(circle at 50% 50%, rgba(255,176,0,0.08), transparent 70%)",
                      animation: "targetPulse 2s ease-in-out infinite",
                    }}
                  />
                )}

                {/* Deadlocked indicator */}
                {isDeadlocked && (
                  <div className="absolute inset-0 bg-[#FF4444]/10 flex items-center justify-center">
                    <span
                      className="text-[#FF4444] font-bold leading-none select-none"
                      style={{
                        fontSize: "clamp(4px, 30%, 10px)",
                        textShadow: "0 0 4px rgba(255,68,68,0.5)",
                      }}
                    >
                      ✗
                    </span>
                  </div>
                )}
              </div>
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
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
