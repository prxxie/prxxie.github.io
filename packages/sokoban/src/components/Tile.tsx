import React from "react";
import { TileType } from "../types";

interface TileProps {
  cell: TileType;
  x: number;
  y: number;
  widthPercent: number;
  heightPercent: number;
}

function Tile({ cell, x, y, widthPercent, heightPercent }: TileProps) {
  if (cell === TileType.EMPTY) return null;

  const isTarget = cell === TileType.TARGET;
  const isWall = cell === TileType.WALL;

  return (
    <div
      className="absolute"
      style={{
        left: `${x * widthPercent}%`,
        top: `${y * heightPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
      }}
    >
      {/* Floor (all non-empty tiles) */}
      <div className="w-full h-full bg-[#080703]">
        <div
          className="absolute bottom-0 right-0 w-[1px] h-[1px] bg-[#FFB000]/8"
          style={{ boxShadow: "-1px -1px 0 0 rgba(255,176,0,0.04)" }}
        />
      </div>

      {/* WALL: Stone brick */}
      {isWall && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[85%] h-[85%] bg-gradient-to-br from-[#1a1410] via-[#15100a] to-[#0f0b06] border border-[#FFB000]/25 rounded-[1px] relative overflow-hidden">
            <div className="absolute inset-x-[15%] top-1/2 h-[1px] bg-[#FFB000]/8 -translate-y-1/2" />
            <div className="absolute top-0 bottom-1/2 w-[1px] bg-[#FFB000]/8 left-1/3" />
            <div className="absolute top-1/2 bottom-0 w-[1px] bg-[#FFB000]/8 left-2/3" />
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-b from-[#FFB000]/15 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-[15%] opacity-[0.04]">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,176,0,0.3) 2px, rgba(255,176,0,0.3) 3px)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* TARGET: Glowing landing pad */}
      {isTarget && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute w-3/5 h-3/5 rounded-full opacity-40"
            style={{
              background: "radial-gradient(circle, rgba(255,176,0,0.5) 0%, transparent 70%)",
              animation: "targetPulse 2s ease-in-out infinite",
            }}
          />
          <div className="relative flex items-center justify-center">
            <div
              className="w-[40%] h-[40%] rotate-45 border border-[#FFB000]/60"
              style={{
                background: "linear-gradient(135deg, rgba(255,176,0,0.15), rgba(255,176,0,0.05))",
                boxShadow: "inset 0 0 6px rgba(255,176,0,0.1)",
              }}
            >
              <div className="w-[60%] h-[60%] m-[20%] rotate-45 border border-[#FFB000]/30 bg-[#FFB000]/5" />
            </div>
            <div className="absolute w-[6px] h-[6px] rounded-full bg-[#FFB000]/40" />
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(Tile);
