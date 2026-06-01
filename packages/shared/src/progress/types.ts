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
};

export type ProgressState = {
  completedLevels: CompletedLevel[];
  foodConsumed: number;
  pet: PetState;
};
