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
      deadlockedBoxIds: []
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
});
