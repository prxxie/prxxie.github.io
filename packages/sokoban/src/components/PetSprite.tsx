import React from "react";

export type PetStatus = "idle" | "eating" | "playing" | "sleeping" | "moving";
export type PetDirection = "down" | "up" | "left" | "right";

interface PetSpriteProps {
  size?: number;
  status?: PetStatus;
  isSleeping?: boolean;
  direction?: PetDirection;
  animationFrame?: number;
  className?: string;
}

function getBodyColor(status: PetStatus, isSleeping: boolean): string {
  if (isSleeping) return "#779988";
  if (status === "eating") return "#CC6666";
  if (status === "playing") return "#CC6666";
  if (status === "moving") return "#CC9966";
  return "#A0785A"; // idle — warm brown
}

function getEyeOffset(direction: PetDirection): { ex: number; ey: number } {
  const baseX = direction === "left" ? -0.5 : direction === "right" ? 0.5 : 0;
  const baseY = direction === "up" ? -0.5 : direction === "down" ? 0.5 : 0;
  return { ex: baseX, ey: baseY };
}

export default function PetSprite({
  size = 16,
  status = "idle",
  isSleeping = false,
  direction = "down",
  animationFrame = 0,
  className = "",
}: PetSpriteProps): React.ReactElement {
  const bodyColor = getBodyColor(status, isSleeping);
  const { ex, ey } = getEyeOffset(direction);
  const bounceClass = status === "playing" || status === "moving" ? "animate-bounce" : "";

  const legOffset = status === "moving" ? (animationFrame === 0 ? 0 : 1) : 0;

  return (
    <svg
      viewBox="0 0 16 16"
      className={`${bounceClass} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Body */}
      <rect x="3" y="3" width="10" height="10" rx="2" ry="2" fill={bodyColor} />
      <rect x="4" y="4" width="8" height="8" fill={bodyColor} />

      {/* Legs */}
      {status === "moving" ? (
        <>
          <rect x="4" y={11 + legOffset} width="2" height="2" fill="var(--color-cozy-border)" />
          <rect x="10" y={11 + (1 - legOffset)} width="2" height="2" fill="var(--color-cozy-border)" />
        </>
      ) : (
        <rect x="4" y="11" width="8" height="2" fill="var(--color-cozy-border)" />
      )}

      {/* Tail */}
      {status === "playing" && (
        <rect x="13" y={animationFrame === 0 ? "4" : "6"} width="2" height="2" fill={bodyColor} />
      )}

      {/* Sleeping ZZZ */}
      {isSleeping && (
        <>
          <rect x="11" y="1" width="2" height="2" fill="var(--color-cozy-border)" opacity="0.6" />
          <rect x="12" y="3" width="2" height="1" fill="var(--color-cozy-border)" opacity="0.4" />
        </>
      )}

      {/* Eyes */}
      {!isSleeping ? (
        <>
          <rect x={5 + ex} y={6 + ey} width="2" height="2" fill="#FFFFFF" rx="0.5" />
          <rect x={5.5 + ex} y={6.5 + ey} width="1" height="1" fill="#000000" />
          <rect x={9 + ex} y={6 + ey} width="2" height="2" fill="#FFFFFF" rx="0.5" />
          <rect x={9.5 + ex} y={6.5 + ey} width="1" height="1" fill="#000000" />
        </>
      ) : (
        <>
          <rect x="5" y="7" width="3" height="1" fill="var(--color-cozy-border)" />
          <rect x="9" y="7" width="3" height="1" fill="var(--color-cozy-border)" />
        </>
      )}

      {/* Mouth */}
      {!isSleeping && status !== "eating" && (
        <rect x="6" y="9" width="4" height="1" fill="var(--color-cozy-border)" />
      )}
      {!isSleeping && status === "eating" && (
        <rect x="7" y="9" width="2" height="2" fill="var(--color-cozy-border)" />
      )}

      {/* Blush cheeks */}
      {status === "playing" && (
        <>
          <rect x="3" y="8" width="1.5" height="1" fill="#FF8888" opacity="0.5" rx="0.5" />
          <rect x="11.5" y="8" width="1.5" height="1" fill="#FF8888" opacity="0.5" rx="0.5" />
        </>
      )}
    </svg>
  );
}
