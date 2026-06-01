import React, { useEffect, useState } from "react";

export type PetStatus = "idle" | "eating" | "playing" | "sleeping" | "moving";
export type PetDirection = "down" | "up" | "left" | "right";

interface PetSpriteProps {
  size?: number | string;
  stage?: number;
  status?: PetStatus;
  isSleeping?: boolean;
  isHungry?: boolean;
  direction?: PetDirection;
  className?: string;
}

function PetSprite({
  size = "100%",
  stage = 1,
  status = "idle",
  isSleeping = false,
  isHungry = false,
  className = "",
}: PetSpriteProps) {
  const [animFrame, setAnimFrame] = useState(0);

  useEffect(() => {
    if (status === "moving" || status === "playing") {
      const timer = setInterval(() => setAnimFrame((f) => (f + 1) % 2), 400);
      return () => clearInterval(timer);
    }
    setAnimFrame(0);
  }, [status]);

  const isEating = status === "eating";
  const isPlaying = status === "playing";
  const isMoving = status === "moving";

  const bounceClass = isPlaying || isMoving ? "animate-bounce" : "";
  const wiggleStyle =
    isMoving || (status === "idle" && animFrame === 1)
      ? { transform: "rotate(3deg)", transformOrigin: "bottom center" }
      : {};

  const renderStageSprite = () => {
    switch (stage) {
      case 1: // POKEMON EGG
        return (
          <>
            <rect x="5" y="3" width="6" height="10" rx="3" fill="#eeeecc" />
            <rect x="4" y="5" width="8" height="7" rx="2" fill="#eeeecc" />
            <rect x={isEating && animFrame === 0 ? "7" : "6"} y="5" width="2" height="2" fill="#44aa44" />
            <rect x={isEating && animFrame === 0 ? "8" : "9"} y="8" width="2" height="2" fill="#44aa44" />
            <rect x="5" y="10" width="2" height="1" fill="#44aa44" />
          </>
        );

      case 2: {
        const leafColor = isHungry ? "#cccc33" : "#33aa33";
        return (
          <>
            <rect x="3" y={animFrame === 0 ? "10" : "9"} width="2" height="2" fill="#88cc88" />
            <rect x="5" y="7" width="7" height="6" rx="2" fill="#88cc88" />
            <rect x="4" y="9" width="9" height="3" fill="#88cc88" />
            <rect x={isMoving && animFrame === 0 ? "4" : "5"} y="13" width="2" height="1" fill="#448844" />
            <rect x={isMoving && animFrame === 1 ? "11" : "10"} y="13" width="2" height="1" fill="#448844" />
            <rect x="8" y={animFrame === 0 ? "5" : "6"} width="2" height="2" fill={leafColor} />
            <rect x="9" y={animFrame === 0 ? "4" : "5"} width="2" height="2" fill={leafColor} />
            <rect x="8" y="7" width="1" height="1" fill="#448844" />
            {!isSleeping ? (
              <>
                <rect x="6" y="8" width="2" height="2" fill="#ffffff" />
                <rect x="6.5" y="8.5" width="1" height="1" fill="#ff4444" />
                <rect x="10" y="8" width="2" height="2" fill="#ffffff" />
                <rect x="10.5" y="8.5" width="1" height="1" fill="#ff4444" />
                <rect x="8" y="11" width="2" height="1" fill="#448844" />
              </>
            ) : (
              <>
                <rect x="6" y="9" width="2" height="1" fill="#448844" />
                <rect x="10" y="9" width="2" height="1" fill="#448844" />
              </>
            )}
          </>
        );
      }

      case 3:
        return (
          <>
            <rect x="7" y={isEating && animFrame === 0 ? "2" : "3"} width="3" height="3" rx="1" fill="#ff66aa" />
            <rect x="6" y="5" width="5" height="1" fill="#338833" />
            <rect x="4" y="6" width="9" height="7" rx="2" fill="#55aaaa" />
            <rect x="3" y="8" width="11" height="4" fill="#55aaaa" />
            <rect x={isMoving && animFrame === 0 ? "3" : "4"} y="13" width="2" height="1" fill="#227777" />
            <rect x={isMoving && animFrame === 1 ? "12" : "11"} y="13" width="2" height="1" fill="#227777" />
            <rect x="1" y="9" width="3" height="2" fill="#55aaaa" />
            {!isSleeping ? (
              <>
                <rect x="8" y="7" width="2" height="2" fill="#ffffff" />
                <rect x="9" y="7.5" width="1" height="1" fill="#ff2222" />
                <rect x="5" y="7" width="2" height="2" fill="#ffffff" />
                <rect x="5" y="7.5" width="1" height="1" fill="#ff2222" />
                <rect x="7" y="10" width="3" height="1" fill="#227777" />
              </>
            ) : (
              <>
                <rect x="5" y="8" width="2" height="1" fill="#227777" />
                <rect x="9" y="8" width="2" height="1" fill="#227777" />
              </>
            )}
          </>
        );

      case 4:
        return (
          <>
            <rect x="4" y="5" width="9" height="1" fill="#226622" />
            <rect x="5" y={animFrame === 0 ? "2" : "3"} width="7" height="3" fill="#ff4488" />
            <rect x="7" y={animFrame === 0 ? "1" : "2"} width="3" height="1" fill="#ffcc00" />
            <rect x="3" y="6" width="11" height="7" rx="2" fill="#2d6a6a" />
            <rect x="13" y="8" width="2" height="2" fill="#2d6a6a" />
            <rect x="14" y={isPlaying && animFrame === 0 ? "5" : "6"} width="2" height="2" fill="#226622" />
            <rect x="4" y="13" width="2" height="1" fill="#124a4a" />
            <rect x="11" y="13" width="2" height="1" fill="#124a4a" />
            {!isSleeping ? (
              <>
                <rect x="5" y="8" width="2" height="2" fill="#ffffff" />
                <rect x="5" y="8" width="1" height="1" fill="#ff0000" />
                <rect x="10" y="8" width="2" height="2" fill="#ffffff" />
                <rect x="11" y="8" width="1" height="1" fill="#ff0000" />
                <rect x="7" y="11" width="3" height="1" fill="#124a4a" />
              </>
            ) : (
              <>
                <rect x="5" y="9" width="2" height="1" fill="#124a4a" />
                <rect x="10" y="9" width="2" height="1" fill="#124a4a" />
              </>
            )}
          </>
        );

      case 5: {
        const floatOffset = animFrame === 0 ? -1 : 1;
        return (
          <g style={{ transform: `translateY(${floatOffset}px)` }}>
            <rect x="2" y="11" width="1" height="1" fill="#ffff99" opacity={animFrame === 0 ? 0.3 : 0.8} />
            <rect x="14" y="4" width="1" height="1" fill="#ffff99" opacity={animFrame === 0 ? 0.8 : 0.3} />
            <rect x="13" y="11" width="1" height="1" fill="#ffff99" opacity={animFrame === 0 ? 0.4 : 0.9} />
            <path d={animFrame === 0 ? "M 3,6 L 0,2 L 1,7 Z" : "M 3,6 L 0,4 L 1,8 Z"} fill="#33aa33" />
            <path d={animFrame === 0 ? "M 13,6 L 16,2 L 15,7 Z" : "M 13,6 L 16,4 L 15,8 Z"} fill="#33aa33" />
            <rect x="6" y="0" width="5" height="2" fill="#ffff33" />
            <rect x="4" y="4" width="9" height="1" fill="#226622" />
            <rect x="5" y="2" width="7" height="2" fill="#ff0066" />
            <rect x="7" y="1" width="3" height="1" fill="#ffff33" />
            <rect x="3" y="5" width="11" height="7" rx="2" fill="#2d6a6a" />
            {!isSleeping ? (
              <>
                <rect x="5" y="7" width="2" height="2" fill="#ffffff" />
                <rect x="5" y="7" width="1" height="1" fill="#ff0000" />
                <rect x="10" y="7" width="2" height="2" fill="#ffffff" />
                <rect x="11" y="7" width="1" height="1" fill="#ff0000" />
              </>
            ) : (
              <>
                <rect x="5" y="8" width="2" height="1" fill="#124a4a" />
                <rect x="10" y="8" width="2" height="1" fill="#124a4a" />
              </>
            )}
          </g>
        );
      }

      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 16 16"
      className={`${bounceClass} ${className}`}
      style={{ width: size, height: size, ...wiggleStyle }}
    >
      {renderStageSprite()}
      {isSleeping && (
        <g className="animate-pulse" style={{ fill: "var(--color-cozy-border)", opacity: 0.8 }}>
          <text x="11" y="4" style={{ fontSize: "4px", fontFamily: "monospace" }}>Z</text>
          <text x="13" y="2" style={{ fontSize: "3px", fontFamily: "monospace" }}>z</text>
        </g>
      )}
    </svg>
  );
}

export default React.memo(PetSprite);
