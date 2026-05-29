import React, { useEffect, useRef } from "react";
import { useShikakuStore } from "../store/useShikakuStore";
import Cell from "./Cell";
import { synth } from "../engine/synth";
import { motion, AnimatePresence } from "framer-motion";
import type { Clue, Region } from "../types";

interface DragRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function Board(): React.ReactElement | null {
  const puzzle = useShikakuStore((state) => state.puzzle);
  const regions = useShikakuStore((state) => state.regions);
  const dragStart = useShikakuStore((state) => state.dragStart);
  const dragEnd = useShikakuStore((state) => state.dragEnd);
  const startDrag = useShikakuStore((state) => state.startDrag);
  const updateDrag = useShikakuStore((state) => state.updateDrag);
  const commitDrag = useShikakuStore((state) => state.commitDrag);
  const cancelDrag = useShikakuStore((state) => state.cancelDrag);
  const removeRegionAt = useShikakuStore((state) => state.removeRegionAt);
  const isWon = useShikakuStore((state) => state.isWon);

  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalPointerUp = (): void => {
      if (dragStart) {
        const res = commitDrag();
        if (res && res.success) {
          synth.playPlace();
        } else if (res && !res.success) {
          synth.playError();
          if (boardRef.current) {
            boardRef.current.classList.add("animate-shake");
            setTimeout(
              () => boardRef.current?.classList.remove("animate-shake"),
              300
            );
          }
        }
      }
    };

    const handleGlobalPointerCancel = (): void => {
      cancelDrag();
    };

    window.addEventListener("pointerup", handleGlobalPointerUp);
    window.addEventListener("pointercancel", handleGlobalPointerCancel);
    return () => {
      window.removeEventListener("pointerup", handleGlobalPointerUp);
      window.removeEventListener("pointercancel", handleGlobalPointerCancel);
    };
  }, [dragStart, commitDrag, cancelDrag]);

  if (!puzzle) return null;

  let dragRect: DragRect | null = null;
  if (dragStart && dragEnd) {
    const x = Math.min(dragStart.x, dragEnd.x);
    const y = Math.min(dragStart.y, dragEnd.y);
    const width = Math.abs(dragStart.x - dragEnd.x) + 1;
    const height = Math.abs(dragStart.y - dragEnd.y) + 1;
    dragRect = { x, y, width, height };
  }

  const cells: React.ReactNode[] = [];
  for (let y = 0; y < puzzle.height; y++) {
    for (let x = 0; x < puzzle.width; x++) {
      const clueObj: Clue | undefined = puzzle.clues.find(
        (c) => c.x === x && c.y === y
      );
      const isCovered = regions.some(
        (r) =>
          x >= r.x &&
          x < r.x + r.width &&
          y >= r.y &&
          y < r.y + r.height
      );
      cells.push(
        <Cell
          key={`${x}-${y}`}
          x={x}
          y={y}
          clue={clueObj?.value}
          isCovered={isCovered}
          onPointerDown={startDrag}
          onPointerEnter={updateDrag}
        />
      );
    }
  }

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 2;
        }
      `}</style>
      <div
        ref={boardRef}
        className="relative border-4 border-[#2b4c3f] bg-[#2b4c3f] overflow-hidden select-none touch-none w-full aspect-square mx-auto transition-transform"
        style={{
          maxWidth: "min(85vw, 60vh, 400px)",
          maxHeight: "min(85vw, 60vh, 400px)",
        }}
      >
        <div
          className="grid gap-[1px] h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${puzzle.width}, 1fr)`,
            gridTemplateRows: `repeat(${puzzle.height}, 1fr)`,
          }}
        >
          {cells}
        </div>

        <AnimatePresence>
          {regions.map((r: Region) => (
            <motion.div
              key={r.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => {
                synth.playClick();
                removeRegionAt(r.x, r.y);
              }}
              className="absolute border-2 border-[#2b4c3f] cursor-pointer flex items-center justify-center font-press text-[8px] text-[#2b4c3f] select-none shadow-inner hover:brightness-95 active:scale-95"
              style={{
                left: `calc((${r.x} / ${puzzle.width}) * 100%)`,
                top: `calc((${r.y} / ${puzzle.height}) * 100%)`,
                width: `calc((${r.width} / ${puzzle.width}) * 100%)`,
                height: `calc((${r.height} / ${puzzle.height}) * 100%)`,
                backgroundColor: r.color,
              }}
            >
              <span>{r.width * r.height}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {dragRect && (
          <div
            className="absolute border-2 border-dashed border-[#2b4c3f] bg-[#2b4c3f]/20 pointer-events-none"
            style={{
              left: `calc((${dragRect.x} / ${puzzle.width}) * 100%)`,
              top: `calc((${dragRect.y} / ${puzzle.height}) * 100%)`,
              width: `calc((${dragRect.width} / ${puzzle.width}) * 100%)`,
              height: `calc((${dragRect.height} / ${puzzle.height}) * 100%)`,
            }}
          />
        )}

        {isWon && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-[#e2f4e5]/90 flex flex-col items-center justify-center font-press text-[#2b4c3f] gap-4"
          >
            <h3 className="text-sm animate-bounce">BOARD SOLVED!</h3>
            <p className="text-[8px]">TAP HINT OR BACK TO REPLAY</p>
          </motion.div>
        )}
      </div>
    </>
  );
}
