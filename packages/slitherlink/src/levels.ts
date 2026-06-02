import type { Level } from "./types";

export const SLITHERLINK_LEVELS: Level[] = [
  {
    id: "sl-easy-1",
    difficulty: "Easy",
    width: 5,
    height: 5,
    clues: {
      "0,0": 3, "2,0": 1, "4,0": 3,
      "1,1": 1, "3,1": 2,
      "2,2": 2,
      "1,3": 2, "3,3": 1,
      "0,4": 3, "2,4": 3, "4,4": 3
    },
    targets: { threeStars: 60, twoStars: 120 }
  },
  {
    id: "sl-easy-2",
    difficulty: "Easy",
    width: 5,
    height: 5,
    clues: {
      "0,1": 2, "1,0": 3, "2,1": 1, "3,0": 3, "4,1": 2,
      "2,2": 3,
      "0,3": 2, "2,3": 2, "4,3": 2,
      "1,4": 3, "3,4": 3
    },
    targets: { threeStars: 90, twoStars: 180 }
  },
  {
    id: "sl-easy-3",
    difficulty: "Easy",
    width: 5,
    height: 5,
    clues: {
      "1,1": 2, "2,1": 0, "3,1": 2,
      "2,2": 1,
      "1,3": 2, "2,3": 2, "3,3": 2
    },
    targets: { threeStars: 75, twoStars: 150 }
  },
  {
    id: "sl-easy-4",
    difficulty: "Easy",
    width: 5,
    height: 5,
    clues: {
      "0,0": 2, "1,0": 2, "3,0": 3,
      "0,2": 3, "2,2": 2, "4,2": 1,
      "3,4": 2, "4,4": 2
    },
    targets: { threeStars: 80, twoStars: 160 }
  },
  {
    id: "sl-easy-5",
    difficulty: "Easy",
    width: 5,
    height: 5,
    clues: {
      "1,1": 3, "3,1": 3,
      "2,2": 2,
      "1,3": 1, "3,3": 1
    },
    targets: { threeStars: 50, twoStars: 100 }
  },
  {
    id: "sl-med-1",
    difficulty: "Medium",
    width: 6,
    height: 6,
    clues: {
      "0,0": 3, "2,0": 2, "4,0": 2,
      "1,1": 3, "3,1": 1, "5,1": 2,
      "0,2": 1, "2,2": 2, "4,2": 2,
      "1,3": 2, "3,3": 3, "5,3": 1,
      "0,4": 2, "2,4": 1, "4,4": 2,
      "1,5": 3, "3,5": 2, "5,5": 3
    },
    targets: { threeStars: 150, twoStars: 300 }
  },
  {
    id: "sl-med-2",
    difficulty: "Medium",
    width: 6,
    height: 6,
    clues: {
      "0,1": 2, "2,1": 3, "4,1": 2,
      "1,2": 1, "3,2": 2, "5,2": 1,
      "0,3": 3, "2,3": 0, "4,3": 3,
      "1,4": 2, "3,4": 2, "5,4": 2
    },
    targets: { threeStars: 180, twoStars: 360 }
  },
  {
    id: "sl-med-3",
    difficulty: "Medium",
    width: 6,
    height: 6,
    clues: {
      "1,0": 3, "3,0": 3,
      "1,2": 2, "2,2": 2, "3,2": 2, "4,2": 2,
      "1,4": 1, "2,4": 3, "3,4": 3, "4,4": 1
    },
    targets: { threeStars: 200, twoStars: 400 }
  },
  {
    id: "sl-med-4",
    difficulty: "Medium",
    width: 6,
    height: 6,
    clues: {
      "0,0": 2, "5,0": 2,
      "1,1": 2, "4,1": 2,
      "2,2": 3, "3,2": 3,
      "2,3": 1, "3,3": 1,
      "1,4": 3, "4,4": 3,
      "0,5": 2, "5,5": 2
    },
    targets: { threeStars: 160, twoStars: 320 }
  },
  {
    id: "sl-med-5",
    difficulty: "Medium",
    width: 6,
    height: 6,
    clues: {
      "0,0": 3, "1,0": 2, "4,0": 2, "5,0": 3,
      "2,2": 1, "3,2": 1,
      "2,3": 2, "3,3": 2,
      "0,5": 3, "1,5": 1, "4,5": 1, "5,5": 3
    },
    targets: { threeStars: 170, twoStars: 340 }
  }
];
