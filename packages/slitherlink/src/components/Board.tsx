import React from "react";
import { useSlitherlinkStore } from "../store/useSlitherlinkStore";
import { getCellLineCount } from "../engine/validation";

export default function Board(): React.ReactElement | null {
  const level = useSlitherlinkStore((state) => state.level);
  const hEdges = useSlitherlinkStore((state) => state.hEdges);
  const vEdges = useSlitherlinkStore((state) => state.vEdges);
  const toggleEdge = useSlitherlinkStore((state) => state.toggleEdge);
  const cellErrors = useSlitherlinkStore((state) => state.cellErrors);

  if (!level || hEdges.length === 0 || vEdges.length === 0) return null;

  const W = level.width;
  const H = level.height;
  const cellSize = 42; // Size of each cell in pixels
  const offset = 12; // Padding offset inside container

  const boardWidth = W * cellSize + offset * 2;
  const boardHeight = H * cellSize + offset * 2;

  return (
    <div 
      className="relative select-none"
      style={{ width: `${boardWidth}px`, height: `${boardHeight}px` }}
    >
      {/* Render clues inside cells */}
      {Array.from({ length: H }).map((_, y) =>
        Array.from({ length: W }).map((_, x) => {
          const clueKey = `${x},${y}`;
          if (!(clueKey in level.clues)) return null;
          const target = level.clues[clueKey];
          const current = getCellLineCount(x, y, hEdges, vEdges);
          const isError = cellErrors[clueKey];
          const isSatisfied = current === target;

          let textColor = "text-cozy-muted"; // Under
          if (isError) textColor = "text-red-500 [text-shadow:0_0_4px_#ff0000]";
          else if (isSatisfied) textColor = "text-cozy-text [text-shadow:0_0_6px_#ffb000] font-bold";

          return (
            <div
              key={`cell-${clueKey}`}
              className={`absolute flex items-center justify-center font-press text-[12px] font-mono transition-colors ${textColor}`}
              style={{
                left: `${offset + x * cellSize}px`,
                top: `${offset + y * cellSize}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
              }}
            >
              {target}
            </div>
          );
        })
      )}

      {/* Render horizontal edges */}
      {hEdges.map((row, y) =>
        row.map((state, x) => {
          const isLine = state === "line";
          const isCross = state === "cross";

          return (
            <div
              key={`hedge-${x}-${y}`}
              className="absolute cursor-pointer flex items-center justify-center group"
              style={{
                left: `${offset + x * cellSize}px`,
                top: `${offset + y * cellSize - 7}px`,
                width: `${cellSize}px`,
                height: "14px",
                zIndex: 20
              }}
              onClick={() => toggleEdge("h", x, y)}
            >
              {/* Visual Line */}
              <div
                className={`w-full transition-all duration-75 ${
                  isLine 
                    ? "bg-cozy-text shadow-[0_0_8px_#ffb000] h-[3px]" 
                    : "bg-transparent h-[1px] group-hover:bg-cozy-muted/40 group-hover:h-[2px]"
                }`}
              />
              {/* Visual Cross 'x' */}
              {isCross && (
                <span className="absolute text-[8px] font-mono text-cozy-muted leading-none">x</span>
              )}
            </div>
          );
        })
      )}

      {/* Render vertical edges */}
      {vEdges.map((row, y) =>
        row.map((state, x) => {
          const isLine = state === "line";
          const isCross = state === "cross";

          return (
            <div
              key={`vedge-${x}-${y}`}
              className="absolute cursor-pointer flex items-center justify-center group"
              style={{
                left: `${offset + x * cellSize - 7}px`,
                top: `${offset + y * cellSize}px`,
                width: "14px",
                height: `${cellSize}px`,
                zIndex: 20
              }}
              onClick={() => toggleEdge("v", x, y)}
            >
              {/* Visual Line */}
              <div
                className={`h-full transition-all duration-75 ${
                  isLine 
                    ? "bg-cozy-text shadow-[0_0_8px_#ffb000] w-[3px]" 
                    : "bg-transparent w-[1px] group-hover:bg-cozy-muted/40 group-hover:w-[2px]"
                }`}
              />
              {/* Visual Cross 'x' */}
              {isCross && (
                <span className="absolute text-[8px] font-mono text-cozy-muted leading-none">x</span>
              )}
            </div>
          );
        })
      )}

      {/* Render dots grid */}
      {Array.from({ length: H + 1 }).map((_, y) =>
        Array.from({ length: W + 1 }).map((_, x) => (
          <div
            key={`dot-${x}-${y}`}
            className="absolute bg-cozy-text rounded-full shadow-[0_0_3px_#ffb000]"
            style={{
              left: `${offset + x * cellSize - 3}px`,
              top: `${offset + y * cellSize - 3}px`,
              width: "6px",
              height: "6px",
              zIndex: 30
            }}
          />
        ))
      )}
    </div>
  );
}
