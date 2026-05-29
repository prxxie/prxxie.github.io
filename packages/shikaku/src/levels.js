export const SHIKAKU_LEVELS = [
  // --- EASY LEVELS (4x4 to 6x6) ---
  {
    id: 'easy-1',
    difficulty: 'Easy',
    width: 4,
    height: 4,
    clues: [
      { x: 0, y: 0, value: 4 },
      { x: 2, y: 0, value: 4 },
      { x: 0, y: 2, value: 4 },
      { x: 2, y: 2, value: 4 }
    ],
    targets: { threeStars: 10, twoStars: 20, oneStar: 40 }
  },
  {
    id: 'easy-2',
    difficulty: 'Easy',
    width: 5,
    height: 5,
    clues: [
      { x: 0, y: 0, value: 5 },
      { x: 1, y: 1, value: 5 },
      { x: 2, y: 2, value: 5 },
      { x: 3, y: 3, value: 5 },
      { x: 4, y: 4, value: 5 }
    ],
    targets: { threeStars: 15, twoStars: 30, oneStar: 60 }
  },
  {
    id: 'easy-3',
    difficulty: 'Easy',
    width: 6,
    height: 6,
    clues: [
      { x: 1, y: 1, value: 9 },
      { x: 4, y: 1, value: 9 },
      { x: 1, y: 4, value: 9 },
      { x: 4, y: 4, value: 9 }
    ],
    targets: { threeStars: 20, twoStars: 40, oneStar: 80 }
  },
  {
    id: 'easy-4',
    difficulty: 'Easy',
    width: 6,
    height: 6,
    clues: [
      { x: 0, y: 0, value: 6 },
      { x: 3, y: 0, value: 6 },
      { x: 5, y: 0, value: 6 },
      { x: 0, y: 5, value: 6 },
      { x: 3, y: 5, value: 6 },
      { x: 5, y: 5, value: 6 }
    ],
    targets: { threeStars: 20, twoStars: 40, oneStar: 80 }
  },
  {
    id: 'easy-5',
    difficulty: 'Easy',
    width: 6,
    height: 6,
    clues: [
      { x: 0, y: 0, value: 4 },
      { x: 3, y: 1, value: 8 },
      { x: 5, y: 2, value: 12 },
      { x: 0, y: 2, value: 4 },
      { x: 2, y: 5, value: 8 }
    ],
    targets: { threeStars: 25, twoStars: 50, oneStar: 100 }
  },
  {
    id: 'easy-6',
    difficulty: 'Easy',
    width: 6,
    height: 6,
    clues: [
      { x: 0, y: 0, value: 4 },
      { x: 0, y: 4, value: 2 },
      { x: 1, y: 2, value: 6 },
      { x: 3, y: 2, value: 6 },
      { x: 5, y: 0, value: 4 },
      { x: 5, y: 4, value: 2 },
      { x: 2, y: 5, value: 6 },
      { x: 4, y: 5, value: 6 }
    ],
    targets: { threeStars: 25, twoStars: 50, oneStar: 100 }
  },

  // --- MEDIUM LEVELS (8x8) ---
  {
    id: 'medium-1',
    difficulty: 'Medium',
    width: 8,
    height: 8,
    clues: [
      { x: 0, y: 1, value: 8 },
      { x: 3, y: 2, value: 8 },
      { x: 5, y: 1, value: 8 },
      { x: 6, y: 3, value: 8 },
      { x: 1, y: 5, value: 8 },
      { x: 0, y: 6, value: 4 },
      { x: 3, y: 7, value: 4 },
      { x: 4, y: 5, value: 8 },
      { x: 6, y: 4, value: 4 },
      { x: 7, y: 7, value: 4 }
    ],
    targets: { threeStars: 45, twoStars: 90, oneStar: 180 }
  },
  {
    id: 'medium-2',
    difficulty: 'Medium',
    width: 8,
    height: 8,
    clues: [
      { x: 0, y: 3, value: 8 },
      { x: 7, y: 4, value: 8 },
      { x: 3, y: 0, value: 12 },
      { x: 2, y: 3, value: 8 },
      { x: 4, y: 4, value: 8 },
      { x: 5, y: 2, value: 8 },
      { x: 2, y: 7, value: 12 }
    ],
    targets: { threeStars: 45, twoStars: 90, oneStar: 180 }
  },
  {
    id: 'medium-3',
    difficulty: 'Medium',
    width: 8,
    height: 8,
    clues: [
      { x: 1, y: 1, value: 9 },
      { x: 5, y: 2, value: 15 },
      { x: 2, y: 5, value: 15 },
      { x: 3, y: 4, value: 5 },
      { x: 5, y: 3, value: 4 },
      { x: 4, y: 5, value: 4 },
      { x: 7, y: 4, value: 4 },
      { x: 5, y: 6, value: 4 },
      { x: 6, y: 7, value: 4 }
    ],
    targets: { threeStars: 45, twoStars: 90, oneStar: 180 }
  },
  {
    id: 'medium-4',
    difficulty: 'Medium',
    width: 8,
    height: 8,
    clues: [
      { x: 4, y: 0, value: 8 },
      { x: 0, y: 3, value: 7 },
      { x: 5, y: 7, value: 7 },
      { x: 7, y: 2, value: 6 },
      { x: 2, y: 1, value: 6 },
      { x: 5, y: 2, value: 6 },
      { x: 1, y: 5, value: 8 },
      { x: 4, y: 3, value: 8 },
      { x: 6, y: 6, value: 8 }
    ],
    targets: { threeStars: 45, twoStars: 90, oneStar: 180 }
  },
  {
    id: 'medium-5',
    difficulty: 'Medium',
    width: 8,
    height: 8,
    clues: [
      { x: 1, y: 1, value: 8 },
      { x: 0, y: 6, value: 8 },
      { x: 3, y: 1, value: 6 },
      { x: 6, y: 0, value: 6 },
      { x: 2, y: 4, value: 8 },
      { x: 5, y: 3, value: 8 },
      { x: 6, y: 4, value: 8 },
      { x: 4, y: 6, value: 6 },
      { x: 5, y: 7, value: 6 }
    ],
    targets: { threeStars: 45, twoStars: 90, oneStar: 180 }
  },
  {
    id: 'medium-6',
    difficulty: 'Medium',
    width: 8,
    height: 8,
    clues: [
      { x: 2, y: 0, value: 8 },
      { x: 5, y: 1, value: 8 },
      { x: 1, y: 3, value: 8 },
      { x: 6, y: 4, value: 8 },
      { x: 2, y: 2, value: 4 },
      { x: 5, y: 3, value: 4 },
      { x: 3, y: 4, value: 4 },
      { x: 4, y: 5, value: 4 },
      { x: 1, y: 7, value: 8 },
      { x: 6, y: 6, value: 8 }
    ],
    targets: { threeStars: 45, twoStars: 90, oneStar: 180 }
  },
  {
    id: 'medium-7',
    difficulty: 'Medium',
    width: 8,
    height: 8,
    clues: [
      { x: 0, y: 0, value: 9 },
      { x: 4, y: 1, value: 15 },
      { x: 1, y: 4, value: 15 },
      { x: 4, y: 3, value: 5 },
      { x: 3, y: 6, value: 4 },
      { x: 6, y: 5, value: 8 },
      { x: 5, y: 7, value: 4 },
      { x: 7, y: 6, value: 4 }
    ],
    targets: { threeStars: 45, twoStars: 90, oneStar: 180 }
  },
  {
    id: 'medium-8',
    difficulty: 'Medium',
    width: 8,
    height: 8,
    clues: [
      { x: 3, y: 5, value: 8 },
      { x: 4, y: 2, value: 8 },
      { x: 1, y: 1, value: 9 },
      { x: 0, y: 3, value: 3 },
      { x: 2, y: 4, value: 6 },
      { x: 1, y: 7, value: 6 },
      { x: 6, y: 0, value: 9 },
      { x: 7, y: 3, value: 3 },
      { x: 5, y: 5, value: 6 },
      { x: 6, y: 6, value: 6 }
    ],
    targets: { threeStars: 45, twoStars: 90, oneStar: 180 }
  },

  // --- HARD LEVELS (10x10) ---
  {
    id: 'hard-1',
    difficulty: 'Hard',
    width: 10,
    height: 10,
    clues: [
      { x: 1, y: 0, value: 5 },
      { x: 0, y: 2, value: 4 },
      { x: 2, y: 1, value: 4 },
      { x: 3, y: 2, value: 4 },
      { x: 1, y: 4, value: 4 },
      { x: 4, y: 3, value: 4 },
      { x: 7, y: 3, value: 25 },
      { x: 2, y: 7, value: 25 },
      { x: 6, y: 5, value: 5 },
      { x: 5, y: 8, value: 4 },
      { x: 7, y: 6, value: 4 },
      { x: 8, y: 7, value: 4 },
      { x: 6, y: 9, value: 4 },
      { x: 9, y: 8, value: 4 }
    ],
    targets: { threeStars: 90, twoStars: 180, oneStar: 360 }
  },
  {
    id: 'hard-2',
    difficulty: 'Hard',
    width: 10,
    height: 10,
    clues: [
      { x: 5, y: 0, value: 10 },
      { x: 4, y: 9, value: 10 },
      { x: 0, y: 4, value: 8 },
      { x: 9, y: 5, value: 8 },
      { x: 1, y: 3, value: 8 },
      { x: 4, y: 2, value: 8 },
      { x: 6, y: 1, value: 8 },
      { x: 7, y: 4, value: 8 },
      { x: 2, y: 6, value: 8 },
      { x: 3, y: 7, value: 8 },
      { x: 5, y: 8, value: 8 },
      { x: 8, y: 7, value: 8 }
    ],
    targets: { threeStars: 90, twoStars: 180, oneStar: 360 }
  },
  {
    id: 'hard-3',
    difficulty: 'Hard',
    width: 10,
    height: 10,
    clues: [
      { x: 0, y: 0, value: 10 },
      { x: 9, y: 5, value: 9 },
      { x: 4, y: 9, value: 9 },
      { x: 0, y: 7, value: 8 },
      { x: 2, y: 1, value: 8 },
      { x: 7, y: 2, value: 8 },
      { x: 1, y: 4, value: 8 },
      { x: 8, y: 5, value: 8 },
      { x: 3, y: 3, value: 4 },
      { x: 6, y: 4, value: 4 },
      { x: 4, y: 5, value: 4 },
      { x: 5, y: 6, value: 4 },
      { x: 3, y: 8, value: 8 },
      { x: 6, y: 7, value: 8 }
    ],
    targets: { threeStars: 90, twoStars: 180, oneStar: 360 }
  },
  {
    id: 'hard-4',
    difficulty: 'Hard',
    width: 10,
    height: 10,
    clues: [
      { x: 2, y: 1, value: 10 },
      { x: 7, y: 0, value: 10 },
      { x: 0, y: 4, value: 8 },
      { x: 1, y: 8, value: 8 },
      { x: 9, y: 3, value: 8 },
      { x: 8, y: 7, value: 8 },
      { x: 3, y: 2, value: 6 },
      { x: 6, y: 3, value: 6 },
      { x: 2, y: 5, value: 8 },
      { x: 5, y: 6, value: 8 },
      { x: 7, y: 4, value: 8 },
      { x: 4, y: 9, value: 6 },
      { x: 5, y: 8, value: 6 }
    ],
    targets: { threeStars: 90, twoStars: 180, oneStar: 360 }
  },
  {
    id: 'hard-5',
    difficulty: 'Hard',
    width: 10,
    height: 10,
    clues: [
      { x: 4, y: 0, value: 10 },
      { x: 6, y: 1, value: 10 },
      { x: 3, y: 8, value: 10 },
      { x: 5, y: 9, value: 10 },
      { x: 0, y: 4, value: 6 },
      { x: 9, y: 3, value: 6 },
      { x: 2, y: 3, value: 6 },
      { x: 3, y: 2, value: 6 },
      { x: 6, y: 2, value: 4 },
      { x: 7, y: 4, value: 8 },
      { x: 2, y: 5, value: 8 },
      { x: 3, y: 7, value: 4 },
      { x: 6, y: 6, value: 6 },
      { x: 8, y: 5, value: 6 }
    ],
    targets: { threeStars: 90, twoStars: 180, oneStar: 360 }
  },
  {
    id: 'hard-6',
    difficulty: 'Hard',
    width: 10,
    height: 10,
    clues: [
      { x: 1, y: 2, value: 16 },
      { x: 5, y: 0, value: 6 },
      { x: 8, y: 1, value: 6 },
      { x: 4, y: 3, value: 6 },
      { x: 9, y: 2, value: 6 },
      { x: 0, y: 6, value: 6 },
      { x: 1, y: 7, value: 6 },
      { x: 3, y: 5, value: 6 },
      { x: 2, y: 8, value: 6 },
      { x: 5, y: 4, value: 6 },
      { x: 7, y: 5, value: 6 },
      { x: 4, y: 7, value: 8 },
      { x: 8, y: 6, value: 8 },
      { x: 7, y: 9, value: 8 }
    ],
    targets: { threeStars: 90, twoStars: 180, oneStar: 360 }
  }
];
