import { describe, it, expect, beforeEach, vi } from "vitest";
import { useShikakuStore } from "./useShikakuStore";
import type { Puzzle } from "../types";

const mockPuzzle: Puzzle = {
  id: "test-1",
  difficulty: "Easy",
  width: 2,
  height: 2,
  clues: [
    { x: 0, y: 0, value: 2 },
    { x: 0, y: 1, value: 2 },
  ],
  targets: { threeStars: 10, twoStars: 20, oneStar: 30 },
};

const levelsListMock: Puzzle[] = [mockPuzzle];

describe("Shikaku Game State Store", () => {
  beforeEach(() => {
    useShikakuStore.setState({
      levels: [],
      currentLevelIndex: 0,
      puzzle: null,
      regions: [],
      history: [],
      dragStart: null,
      dragEnd: null,
      elapsedTime: 0,
      timerActive: false,
      isWon: false,
      starsAchieved: 0,
      completedLevels: {},
    });
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it("should handle loadLevel correctly", () => {
    useShikakuStore.getState().loadLevel(levelsListMock, 0);

    const state = useShikakuStore.getState();
    expect(state.puzzle).toEqual(mockPuzzle);
    expect(state.currentLevelIndex).toBe(0);
    expect(state.regions).toEqual([]);
    expect(state.history).toEqual([]);
    expect(state.elapsedTime).toBe(0);
    expect(state.timerActive).toBe(true);
    expect(state.isWon).toBe(false);
  });

  it("should handle startDrag, updateDrag, and cancelDrag correctly", () => {
    const store = useShikakuStore.getState();

    store.startDrag(0, 0);
    expect(useShikakuStore.getState().dragStart).toEqual({ x: 0, y: 0 });
    expect(useShikakuStore.getState().dragEnd).toEqual({ x: 0, y: 0 });

    useShikakuStore.getState().updateDrag(1, 0);
    expect(useShikakuStore.getState().dragEnd).toEqual({ x: 1, y: 0 });

    useShikakuStore.getState().cancelDrag();
    expect(useShikakuStore.getState().dragStart).toBeNull();
    expect(useShikakuStore.getState().dragEnd).toBeNull();
  });

  it("should handle region commits correctly and update saveProgress when won", () => {
    useShikakuStore.getState().loadLevel(levelsListMock, 0);

    useShikakuStore.setState({
      dragStart: { x: 0, y: 0 },
      dragEnd: { x: 1, y: 0 },
    });
    const commit1 = useShikakuStore.getState().commitDrag();

    expect(commit1!.success).toBe(true);
    let state = useShikakuStore.getState();
    expect(state.regions.length).toBe(1);
    expect(state.regions[0].width).toBe(2);
    expect(state.regions[0].height).toBe(1);
    expect(state.regions[0].clueX).toBe(0);
    expect(state.regions[0].clueY).toBe(0);
    expect(state.isWon).toBe(false);
    expect(state.timerActive).toBe(true);

    useShikakuStore.setState({
      dragStart: { x: 0, y: 1 },
      dragEnd: { x: 1, y: 1 },
    });
    const commit2 = useShikakuStore.getState().commitDrag();

    expect(commit2!.success).toBe(true);
    state = useShikakuStore.getState();
    expect(state.regions.length).toBe(2);
    expect(state.isWon).toBe(true);
    expect(state.timerActive).toBe(false);
    expect(state.starsAchieved).toBe(3);

    expect(state.completedLevels["test-1"]).toEqual({
      stars: 3,
      bestTime: 0,
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const stored: { completed: Record<string, { stars: number; bestTime: number }> } = JSON.parse(
      localStorage.getItem("cozy_os_shikaku_save") ?? "{}"
    );
    expect(stored.completed["test-1"]).toEqual({ stars: 3, bestTime: 0 });
  });

  it("should fail to commit invalid region", () => {
    useShikakuStore.getState().loadLevel(levelsListMock, 0);

    useShikakuStore.setState({
      dragStart: { x: 0, y: 0 },
      dragEnd: { x: 0, y: 0 },
    });
    const result = useShikakuStore.getState().commitDrag();

    expect(result!.success).toBe(false);
    expect(result!.reason).toBe("WRONG_AREA");
    const state = useShikakuStore.getState();
    expect(state.regions.length).toBe(0);
    expect(state.dragStart).toBeNull();
    expect(state.dragEnd).toBeNull();
  });

  it("should support undo moves", () => {
    useShikakuStore.getState().loadLevel(levelsListMock, 0);

    useShikakuStore.setState({
      dragStart: { x: 0, y: 0 },
      dragEnd: { x: 1, y: 0 },
    });
    useShikakuStore.getState().commitDrag();

    expect(useShikakuStore.getState().regions.length).toBe(1);
    expect(useShikakuStore.getState().history.length).toBe(1);

    useShikakuStore.getState().undo();

    expect(useShikakuStore.getState().regions.length).toBe(0);
    expect(useShikakuStore.getState().history.length).toBe(0);
  });

  it("should support removing a region at coordinate", () => {
    useShikakuStore.getState().loadLevel(levelsListMock, 0);

    useShikakuStore.setState({
      dragStart: { x: 0, y: 0 },
      dragEnd: { x: 1, y: 0 },
    });
    useShikakuStore.getState().commitDrag();

    expect(useShikakuStore.getState().regions.length).toBe(1);

    useShikakuStore.getState().removeRegionAt(0, 1);
    expect(useShikakuStore.getState().regions.length).toBe(1);

    useShikakuStore.getState().removeRegionAt(1, 0);
    expect(useShikakuStore.getState().regions.length).toBe(0);
    expect(useShikakuStore.getState().history.length).toBe(2);
  });

  it("should support resetLevel", () => {
    useShikakuStore.getState().loadLevel(levelsListMock, 0);
    useShikakuStore.setState({
      dragStart: { x: 0, y: 0 },
      dragEnd: { x: 1, y: 0 },
    });
    useShikakuStore.getState().commitDrag();
    useShikakuStore.setState({ elapsedTime: 15 });

    useShikakuStore.getState().resetLevel();

    const state = useShikakuStore.getState();
    expect(state.regions.length).toBe(0);
    expect(state.history.length).toBe(0);
    expect(state.elapsedTime).toBe(0);
    expect(state.timerActive).toBe(true);
    expect(state.isWon).toBe(false);
  });

  it("should tick timer when active", () => {
    useShikakuStore.setState({ elapsedTime: 5, timerActive: true });
    useShikakuStore.getState().tickTimer();
    expect(useShikakuStore.getState().elapsedTime).toBe(6);

    useShikakuStore.setState({ timerActive: false });
    useShikakuStore.getState().tickTimer();
    expect(useShikakuStore.getState().elapsedTime).toBe(6);
  });

  it("should load save state from localStorage", () => {
    localStorage.setItem(
      "cozy_os_shikaku_save",
      JSON.stringify({
        completed: { "test-1": { stars: 2, bestTime: 18 } },
      })
    );

    useShikakuStore.getState().loadSave();
    expect(useShikakuStore.getState().completedLevels["test-1"]).toEqual({
      stars: 2,
      bestTime: 18,
    });
  });

  it("should support getHint", () => {
    useShikakuStore.getState().loadLevel(levelsListMock, 0);

    useShikakuStore.getState().getHint();

    const state = useShikakuStore.getState();
    expect(state.regions.length).toBe(1);
    expect(state.regions[0].color).toBe("rgba(16, 185, 129, 0.4)");
    expect(state.regions[0].id).toContain("hint-");
  });
});
