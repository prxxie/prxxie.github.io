import React, { useEffect, useRef } from "react";
import { useSokobanStore } from "../store/useSokobanStore";

export default function Controls(): React.ReactElement {
  const move = useSokobanStore((state) => state.move);
  const isWon = useSokobanStore((state) => state.isWon);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (isWon) return;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          move(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          move(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          move(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          move(1, 0);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [move, isWon]);

  // Touch Swipe Handlers
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent): void => {
      if (e.touches.length === 1) {
        touchStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent): void => {
      if (!touchStart.current || e.changedTouches.length !== 1) return;
      
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      
      const minSwipeDistance = 30;

      if (Math.max(absX, absY) > minSwipeDistance) {
        if (absX > absY) {
          move(dx > 0 ? 1 : -1, 0);
        } else {
          move(0, dy > 0 ? 1 : -1);
        }
      }
      touchStart.current = null;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [move]);

  return (
    <div className="w-full flex flex-col items-center select-none font-press text-[8px] text-cozy-text mt-4">
      <div className="grid grid-cols-3 gap-1.5 w-28 h-28 my-2">
        <div />
        <button
          onClick={() => move(0, -1)}
          className="pixel-btn flex items-center justify-center text-[10px]"
          aria-label="Move Up"
        >
          ▲
        </button>
        <div />
        <button
          onClick={() => move(-1, 0)}
          className="pixel-btn flex items-center justify-center text-[10px]"
          aria-label="Move Left"
        >
          ◀
        </button>
        <div className="bg-cozy-border border border-cozy-border opacity-10" />
        <button
          onClick={() => move(1, 0)}
          className="pixel-btn flex items-center justify-center text-[10px]"
          aria-label="Move Right"
        >
          ▶
        </button>
        <div />
        <button
          onClick={() => move(0, 1)}
          className="pixel-btn flex items-center justify-center text-[10px]"
          aria-label="Move Down"
        >
          ▼
        </button>
      </div>
      <p className="text-[6.5px] opacity-75 mt-1 text-center">
        SWIPE GRID OR TAP KEYS / ARROWS TO NAVIGATE
      </p>
    </div>
  );
}
