import { shallow } from "zustand/shallow";
import { useSokobanStore } from "../store/useSokobanStore";
import Tile from "./Tile";
import BoxTile from "./Box";
import PlayerLayer from "./PlayerLayer";

export default function Board() {
  const { board, player, boxes, deadlockedBoxIds, lastDirection, isMoving } =
    useSokobanStore(
      (s) => ({
        board: s.board,
        player: s.player,
        boxes: s.boxes,
        deadlockedBoxIds: s.deadlockedBoxIds,
        lastDirection: s.lastDirection,
        isMoving: s.isMoving,
      }),
      shallow
    );

  if (board.length === 0)
    return <div className="font-mono text-cozy-text p-4 text-[10px]">LOADING BOARD...</div>;

  const rows = board.length;
  const cols = board[0].length;
  const tw = 100 / cols;
  const th = 100 / rows;

  return (
    <div
      className="relative w-full border border-[#FFB000] bg-[#050505] select-none overflow-hidden rounded-sm"
      style={{ aspectRatio: `${cols} / ${rows}` }}
      role="grid"
      aria-label="Sokoban game board"
      tabIndex={0}
    >
      {board.map((row, y) =>
        row.map((cell, x) => (
          <Tile key={`tile-${x}-${y}`} cell={cell} x={x} y={y} widthPercent={tw} heightPercent={th} />
        ))
      )}
      {boxes.map((box) => (
        <BoxTile
          key={box.id}
          box={box}
          board={board}
          isDeadlocked={deadlockedBoxIds.has(box.id)}
          tileWidthPercent={tw}
          tileHeightPercent={th}
        />
      ))}
      <PlayerLayer
        x={player.x}
        y={player.y}
        tileWidthPercent={tw}
        tileHeightPercent={th}
        status={isMoving ? "moving" : "idle"}
        direction={lastDirection}
      />
    </div>
  );
}
