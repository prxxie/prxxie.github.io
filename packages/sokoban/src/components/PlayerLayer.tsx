import React from "react";
import PetSprite, { type PetDirection, type PetStatus } from "./PetSprite";

interface PlayerLayerProps {
  x: number;
  y: number;
  tileWidthPercent: number;
  tileHeightPercent: number;
  status: PetStatus;
  direction: PetDirection;
}

function PlayerLayer({ x, y, tileWidthPercent, tileHeightPercent, status, direction }: PlayerLayerProps) {
  return (
    <div
      className="absolute z-20"
      style={{
        left: `${x * tileWidthPercent}%`,
        top: `${y * tileHeightPercent}%`,
        width: `${tileWidthPercent}%`,
        height: `${tileHeightPercent}%`,
        transition: "left 80ms ease-out, top 80ms ease-out",
      }}
    >
      <div className="w-full h-full flex items-center justify-center">
        <PetSprite
          status={status}
          direction={direction}
          className="drop-shadow-[0_0_4px_rgba(255,176,0,0.3)]"
        />
      </div>
    </div>
  );
}

export default React.memo(PlayerLayer);
