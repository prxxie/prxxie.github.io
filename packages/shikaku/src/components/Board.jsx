import React, { useEffect, useRef } from 'react';
import { useShikakuStore } from '../store/useShikakuStore';
import Cell from './Cell';
import { synth } from '../engine/synth';
import { motion, AnimatePresence } from 'framer-motion';

export default function Board() {
  const {
    puzzle,
    regions,
    dragStart,
    dragEnd,
    startDrag,
    updateDrag,
    commitDrag,
    cancelDrag,
    removeRegionAt,
    isWon
  } = useShikakuStore();

  const boardRef = useRef(null);

  useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (dragStart) {
        const res = commitDrag();
        if (res && res.success) {
          synth.playPlace();
        } else if (res && !res.success) {
          synth.playError();
          // Trigger board shake
          if (boardRef.current) {
            boardRef.current.classList.add('animate-shake');
            setTimeout(() => boardRef.current?.classList.remove('animate-shake'), 300);
          }
        }
      }
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    return () => window.removeEventListener('pointerup', handleGlobalPointerUp);
  }, [dragStart, commitDrag]);

  if (!puzzle) return null;

  // Track active drag rectangle
  let dragRect = null;
  if (dragStart && dragEnd) {
    const x = Math.min(dragStart.x, dragEnd.x);
    const y = Math.min(dragStart.y, dragEnd.y);
    const width = Math.abs(dragStart.x - dragEnd.x) + 1;
    const height = Math.abs(dragStart.y - dragEnd.y) + 1;
    dragRect = { x, y, width, height };
  }

  const cells = [];
  for (let y = 0; y < puzzle.height; y++) {
    for (let x = 0; x < puzzle.width; x++) {
      const clueObj = puzzle.clues.find(c => c.x === x && c.y === y);
      const isCovered = regions.some(
        r => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height
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
          onPointerUp={commitDrag}
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
        className="relative border-4 border-[#2b4c3f] bg-[#2b4c3f] overflow-hidden select-none touch-none w-full max-w-[400px] aspect-square mx-auto transition-transform"
        style={{ touchAction: 'none' }}
      >
        {/* CSS Grid Layer */}
        <div
          className="grid gap-[1px] h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${puzzle.width}, 1fr)`,
            gridTemplateRows: `repeat(${puzzle.height}, 1fr)`
          }}
        >
          {cells}
        </div>

        {/* Placed Regions Layer */}
        <AnimatePresence>
          {regions.map(r => (
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

        {/* Drag Preview Layer */}
        {dragRect && (
          <div
            className="absolute border-2 border-dashed border-[#2b4c3f] bg-[#2b4c3f]/20 pointer-events-none"
            style={{
              left: `calc((${dragRect.x} / ${puzzle.width}) * 100%)`,
              top: `calc((${dragRect.y} / ${puzzle.height}) * 100%)`,
              width: `calc((${dragRect.width} / ${puzzle.width}) * 100%)`,
              height: `calc((${dragRect.height} / ${puzzle.height}) * 100%)`
            }}
          />
        )}

        {/* Win Overlay */}
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
