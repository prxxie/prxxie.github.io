export type { CompletedLevel, PetState, ProgressState } from "./progress/types";
export type { ProgressRepository } from "./repository/ProgressRepository";
export { LocalProgressRepository, STORAGE_KEY } from "./repository/LocalProgressRepository";
export { ProgressService, HUNGER_COOLDOWN } from "./progress/service";
export { getEvolutionStage, EVOLUTION_THRESHOLDS } from "./pet/evolution";
