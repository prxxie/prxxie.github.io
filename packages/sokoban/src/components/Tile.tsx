import React from "react";
import { TileType } from "../types";

interface TileProps {
  cell: TileType;
  x: number;
  y: number;
  widthPercent: number;
  heightPercent: number;
}

function Tile({
  cell,
  x,
  y,
  widthPercent,
  heightPercent,
}: TileProps) {
  if (cell === TileType.EMPTY) return null;

  const tileStyle: React.CSSProperties = {
    left: `${x * widthPercent}%`,
    top: `${y * heightPercent}%`,
    width: `${widthPercent}%`,
    height: `${heightPercent}%`,
  };

  return (
    <div className="absolute" style={tileStyle}>
      {/* Network Floor */}
      <div className="absolute inset-0 bg-[#080808]">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,176,0,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,176,0,0.15) 1px, transparent 1px)
            `,
            backgroundSize: "6px 6px",
          }}
        />
      </div>

      {cell === TileType.WALL && <FirewallTile />}

      {cell === TileType.TARGET && <SignalPortTile />}
    </div>
  );
}

function FirewallTile() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-[88%] h-[88%] overflow-hidden border border-[#FFB000]/30 bg-gradient-to-b from-[#161616] to-[#0D0D0D]">

        {/* Scanline texture */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent, transparent 2px, rgba(255,176,0,0.5) 2px, rgba(255,176,0,0.5) 3px)",
          }}
        />

        {/* Top status light */}
        <div className="absolute top-[2px] left-[2px] w-[3px] h-[3px] rounded-full bg-[#FFB000]/60" />

        {/* Firewall label */}
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[8px] font-bold tracking-tight text-[#FFB000]/75">
          FW
        </div>

        {/* Edge glow */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-[#FFB000]/20" />
      </div>
    </div>
  );
}

function SignalPortTile() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Signal pulse */}
      <div
        className="absolute w-[70%] h-[70%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(0,255,153,0.25), transparent 70%)",
          animation: "signalPulse 2s ease-in-out infinite",
        }}
      />

      {/* Port body */}
      <div className="relative flex items-center justify-center w-[55%] h-[55%] border border-[#00FF99]/50 bg-[#07110D]">
        <span className="font-mono text-[7px] font-bold text-[#00FF99]/80">
          RX
        </span>

        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-[#00FF99]/30" />
      </div>
    </div>
  );
}

export default React.memo(Tile);