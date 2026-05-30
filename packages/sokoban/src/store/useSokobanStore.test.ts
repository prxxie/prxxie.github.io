import { describe, it, expect, beforeEach } from "vitest";
import { useSokobanStore } from "./useSokobanStore";
import { TileType } from "../types";

describe("Sokoban Game Store", () => {
  beforeEach(() => {
    // Re-initialize state
    useSokobanStore.setState({
      currentLevelIdx: 0,
      board: [],
      player: { x: 0, y: 0 },
      boxes: [],
      moves: 0,
      history: [],
      isWon: false,
      isMuted: false,
      deadlockedBoxIds: new Set(),
      lastDirection: "down",
      isMoving: false,
    });
  });

  it("should load the level configuration correctly", () => {
    const store = useSokobanStore.getState();
    store.loadLevel(1); // Microban #2

    const updated = useSokobanStore.getState();
    expect(updated.player).toEqual({ x: 1, y: 1 });
    expect(updated.boxes.length).toBe(1);
    expect(updated.board[3][2]).toBe(TileType.TARGET);
    expect(updated.isWon).toBe(false);
  });

  it("should allow player steps to empty space", () => {
    const store = useSokobanStore.getState();
    store.loadLevel(1); // player starts at (1,1). Down is empty (1,2)

    store.move(0, 1); // Down
    const updated = useSokobanStore.getState();
    expect(updated.player).toEqual({ x: 1, y: 2 });
    expect(updated.moves).toBe(1);
    expect(updated.history.length).toBe(1);
  });

  it("should block movement into walls", () => {
    const store = useSokobanStore.getState();
    store.loadLevel(1); // (1,1). Left (0,1) is wall

    store.move(-1, 0); // Left
    const updated = useSokobanStore.getState();
    expect(updated.player).toEqual({ x: 1, y: 1 }); // Unchanged
    expect(updated.moves).toBe(0);
  });

  it("should allow pushing a box into empty space and winning when solved", () => {
    // Reload
    useSokobanStore.getState().loadLevel(1);
    // Move player Right: (1,1) -> (2,1)
    useSokobanStore.getState().move(1, 0);
    // Push box Down: player at (2,1) pushes box at (2,2) to (2,3)
    useSokobanStore.getState().move(0, 1);
    
    const state = useSokobanStore.getState();
    expect(state.player).toEqual({ x: 2, y: 2 });
    expect(state.boxes[0].x).toBe(2);
    expect(state.boxes[0].y).toBe(3);
    expect(state.isWon).toBe(true);
  });

  it("should support undo action", () => {
    const store = useSokobanStore.getState();
    store.loadLevel(1);
    
    store.move(1, 0); // Move Right to (2,1)
    expect(useSokobanStore.getState().player).toEqual({ x: 2, y: 1 });
    
    store.undo();
    expect(useSokobanStore.getState().player).toEqual({ x: 1, y: 1 });
    expect(useSokobanStore.getState().moves).toBe(0);
  });

  it("should support restart action", () => {
    const store = useSokobanStore.getState();
    store.loadLevel(1);
    
    store.move(1, 0); // Move to (2,1)
    expect(useSokobanStore.getState().player).toEqual({ x: 2, y: 1 });
    expect(useSokobanStore.getState().moves).toBe(1);
    
    store.restart();
    expect(useSokobanStore.getState().player).toEqual({ x: 1, y: 1 });
    expect(useSokobanStore.getState().moves).toBe(0);
  });

  it("should support nextLevel action", () => {
    const store = useSokobanStore.getState();
    store.loadLevel(0);
    expect(useSokobanStore.getState().currentLevelIdx).toBe(0);
    
    store.nextLevel();
    expect(useSokobanStore.getState().currentLevelIdx).toBe(1);
  });

  it("should support setMuted action", () => {
    const store = useSokobanStore.getState();
    expect(useSokobanStore.getState().isMuted).toBe(false);
    
    store.setMuted(true);
    expect(useSokobanStore.getState().isMuted).toBe(true);
  });

  it("should detect corner deadlocks for boxes in corners that are not targets", () => {
    const store = useSokobanStore.getState();
    store.loadLevel(1); // Microban 2: player starts at (1,1), box at (2,2)
    
    // Move player down: (1,1) -> (1,2)
    store.move(0, 1);
    // Push box Right: player at (1,2) pushes box at (2,2) to (3,2). Player moves to (2,2)
    store.move(1, 0);
    // Move player Up: (2,2) -> (2,1)
    store.move(0, -1);
    // Move player Right: (2,1) -> (3,1)
    store.move(1, 0);
    // Push box Down: player at (3,1) pushes box at (3,2) to (3,3). Player moves to (3,2)
    store.move(0, 1);
    
    const state = useSokobanStore.getState();
    const box = state.boxes[0];
    expect(box.x).toBe(3);
    expect(box.y).toBe(3);
    
    // (3,3) is a corner: Right is WALL (3,4) and Down is WALL (4,3), and it is not a target.
    expect(state.deadlockedBoxIds.has(box.id)).toBe(true);
  });
});
