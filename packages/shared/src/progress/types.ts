export type CompletedLevel = {
  module: string;
  levelId: string;
  completedAt: number;
  stars: number;
};

export type PetState = {
  xp: number;
  stage: number;
  lastFedAt: number;
  happiness: number;     // 0 - 100
  lastPlayedAt: number;  // timestamp
  isSleeping: boolean;
};

export type ProgressState = {
  completedLevels: CompletedLevel[];
  foodConsumed: number;
  pet: PetState;
};
