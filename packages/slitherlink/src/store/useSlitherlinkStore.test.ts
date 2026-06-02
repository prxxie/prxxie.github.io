import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSlitherlinkStore } from "./useSlitherlinkStore";
import type { Level } from "../types";

const mockLevel: Level = {
  id: "test-sl",
  difficulty: "Easy",
  width: 1,
  height: 1,
  clues: {
    "0,0": 4,
  },
  targets: { threeStars: 10, twoStars: 20 },
};

describe("Slitherlink Game State Store", () => {
  beforeEach(() => {
    useSlitherlinkStore.setState({
      level: null,
      hEdges: [],
      vEdges: [],
      history: [],
      elapsedTime: 0,
      timerActive: false,
      isWon: false,
      starsAchieved: 0,
      cellErrors: {},
      vertexErrors: {},
      isMuted: false,
    });
    vi.restoreAllMocks();
  });

  it("should handle loadLevel correctly", () => {
    useSlitherlinkStore.getState().loadLevel(mockLevel);

    const state = useSlitherlinkStore.getState();
    expect(state.level).toEqual(mockLevel);
    expect(state.hEdges.length).toBe(2); // height + 1
    expect(state.vEdges.length).toBe(1); // height
    expect(state.hEdges[0].length).toBe(1); // width
    expect(state.vEdges[0].length).toBe(2); // width + 1
    expect(state.history).toEqual([]);
    expect(state.elapsedTime).toBe(0);
    expect(state.timerActive).toBe(true);
    expect(state.isWon).toBe(false);
  });

  it("should handle toggleEdge correctly", () => {
    useSlitherlinkStore.getState().loadLevel(mockLevel);

    // Toggle horizontal edge [0][0] from none to line
    useSlitherlinkStore.getState().toggleEdge("h", 0, 0);
    let state = useSlitherlinkStore.getState();
    expect(state.hEdges[0][0]).toBe("line");
    expect(state.history.length).toBe(1);

    // Toggle same horizontal edge from line to cross
    useSlitherlinkStore.getState().toggleEdge("h", 0, 0);
    state = useSlitherlinkStore.getState();
    expect(state.hEdges[0][0]).toBe("cross");
    expect(state.history.length).toBe(2);

    // Toggle same horizontal edge from cross to none
    useSlitherlinkStore.getState().toggleEdge("h", 0, 0);
    state = useSlitherlinkStore.getState();
    expect(state.hEdges[0][0]).toBe("none");
    expect(state.history.length).toBe(3);
  });

  it("should solve a 1x1 level and win when all four edges are placed", () => {
    useSlitherlinkStore.getState().loadLevel(mockLevel);

    useSlitherlinkStore.getState().toggleEdge("h", 0, 0);
    useSlitherlinkStore.getState().toggleEdge("h", 0, 1);
    useSlitherlinkStore.getState().toggleEdge("v", 0, 0);
    useSlitherlinkStore.getState().toggleEdge("v", 1, 0);

    const state = useSlitherlinkStore.getState();
    expect(state.isWon).toBe(true);
    expect(state.starsAchieved).toBe(3);
  });

  it("should handle undo correctly", () => {
    useSlitherlinkStore.getState().loadLevel(mockLevel);

    useSlitherlinkStore.getState().toggleEdge("h", 0, 0);
    expect(useSlitherlinkStore.getState().hEdges[0][0]).toBe("line");
    expect(useSlitherlinkStore.getState().history.length).toBe(1);

    useSlitherlinkStore.getState().undo();
    expect(useSlitherlinkStore.getState().hEdges[0][0]).toBe("none");
    expect(useSlitherlinkStore.getState().history.length).toBe(0);
  });

  it("should handle resetLevel correctly", () => {
    useSlitherlinkStore.getState().loadLevel(mockLevel);
    useSlitherlinkStore.getState().toggleEdge("h", 0, 0);

    useSlitherlinkStore.getState().resetLevel();
    const state = useSlitherlinkStore.getState();
    expect(state.hEdges[0][0]).toBe("none");
    expect(state.history.length).toBe(0);
    expect(state.isWon).toBe(false);
  });

  it("should tick timer when active", () => {
    useSlitherlinkStore.setState({ elapsedTime: 5, timerActive: true });
    useSlitherlinkStore.getState().tickTimer();
    expect(useSlitherlinkStore.getState().elapsedTime).toBe(6);

    useSlitherlinkStore.setState({ timerActive: false });
    useSlitherlinkStore.getState().tickTimer();
    expect(useSlitherlinkStore.getState().elapsedTime).toBe(6);
  });

  it("should handle setMuted correctly", () => {
    useSlitherlinkStore.getState().setMuted(true);
    expect(useSlitherlinkStore.getState().isMuted).toBe(true);

    useSlitherlinkStore.getState().setMuted(false);
    expect(useSlitherlinkStore.getState().isMuted).toBe(false);
  });
});
