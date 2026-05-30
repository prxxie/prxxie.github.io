import React from "react";
import { TileType, type Box as BoxType } from "../types";

interface BoxProps {
  box: BoxType;
  board: TileType[][];
  isDeadlocked: boolean;
  tileWidthPercent: number;
  tileHeightPercent: number;
}

function Box({ box, board, isDeadlocked, tileWidthPercent, tileHeightPercent }: BoxProps) {
  const isOnTarget = board[box.y]?.[box.x] === TileType.TARGET;

  return (
    <div
      className="absolute p-[2px] z-10"
      style={{
        left: `${box.x * tileWidthPercent}%`,
        top: `${box.y * tileHeightPercent}%`,
        width: `${tileWidthPercent}%`,
        height: `${tileHeightPercent}%`,
        transition: "left 100ms ease-out, top 100ms ease-out",
      }}
    >
      <div className={`w-full h-full relative overflow-hidden ${isDeadlocked ? "opacity-60" : ""}`}>
        <div
          className={`w-full h-full rounded-[1px] relative overflow-hidden ${
            isOnTarget
              ? "bg-gradient-to-br from-[#3a2a00] via-[#2a1a00] to-[#1a0e00] border border-[#FFB000]/70"
              : "bg-gradient-to-br from-[#2a1a0a] via-[#1f1205] to-[#150d03] border border-[#FFB000]/35"
          }`}
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
          <div
            className="absolute inset-0 opacity-[0.06]"
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
}

export default React.memo(Box);
