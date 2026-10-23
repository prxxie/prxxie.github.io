import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import PetWidget, { cooldownMinutes, levelGlyph, nextStageHint, stageName } from "./PetWidget";
import type { ProgressServiceContextType } from "../hooks/useProgressService";

const service: Omit<ProgressServiceContextType, "state"> & { state: ProgressServiceContextType["state"] } = {
  state: { completedLevels: [], foodConsumed: 0, pet: { xp: 4, stage: 1, lastFedAt: 0, happiness: 60, lastPlayedAt: 0, isSleeping: false } },
  isHungry: true,
  foodAvailable: 2,
  hungryLevel: 3,
  happiness: 60,
  isSleeping: false,
  feedPet: vi.fn().mockResolvedValue(undefined),
  playWithPet: vi.fn().mockResolvedValue(undefined),
  toggleSleep: vi.fn().mockResolvedValue(undefined),
};

vi.mock("../hooks/useProgressService", () => ({
  useProgressService: () => service,
}));

function resetService() {
  service.state = {
    completedLevels: [],
    foodConsumed: 0,
    pet: { xp: 4, stage: 1, lastFedAt: 0, happiness: 60, lastPlayedAt: 0, isSleeping: false },
  };
  service.isSleeping = false;
  service.foodAvailable = 2;
  service.hungryLevel = 3;
  service.happiness = 60;
}

beforeEach(() => {
  resetService();
  vi.clearAllMocks();
});

describe("the pet widget (US-PET-001)", () => {
  it("names the stage, the hunger and the happiness in text", () => {
    render(<PetWidget />);

    expect(screen.getByText("Egg")).toBeInTheDocument();
    expect(screen.getByText(/hunger 3\/5/)).toBeInTheDocument();
    expect(screen.getByText(/happiness 60%/)).toBeInTheDocument();
  });

  it("keeps the sprite decorative so the words are the source", () => {
    const { container } = render(<PetWidget />);

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("offers feed, play and sleep, and spends one star on feed", () => {
    render(<PetWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Feed" }));

    expect(service.feedPet).toHaveBeenCalledOnce();
    expect(service.playWithPet).not.toHaveBeenCalled();
  });

  it("disables play while the pet sleeps and says why", () => {
    service.isSleeping = true;
    service.state.pet.isSleeping = true;
    render(<PetWidget />);

    expect(screen.getByRole("button", { name: "Play" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Wake" })).toBeEnabled();
    expect(screen.getByText(/Sleeping: play is paused/)).toBeInTheDocument();
  });

  it("disables feed with a reason when no star is left", () => {
    service.foodAvailable = 0;
    render(<PetWidget />);

    expect(screen.getByRole("button", { name: "Feed" })).toBeDisabled();
    expect(screen.getByText(/No stars to spend/)).toBeInTheDocument();
  });

  it("renders nothing rather than failing when the stored pet is missing", () => {
    // @ts-expect-error — a missing pet is a valid state to be defensive about
    service.state = { completedLevels: [], foodConsumed: 0, pet: undefined };
    const { container } = render(<PetWidget />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the food as a share of the stars earned, and the cost of one feed", () => {
    service.state = {
      completedLevels: [
        { module: "shikaku", levelId: "1", completedAt: 0, stars: 3 },
        { module: "sokoban", levelId: "2", completedAt: 0, stars: 2 },
      ],
      foodConsumed: 2,
      pet: { xp: 4, stage: 1, lastFedAt: 0, happiness: 60, lastPlayedAt: 0, isSleeping: false },
    };
    render(<PetWidget />);

    expect(screen.getByText("2 of 5 stars")).toBeInTheDocument();
    expect(screen.getByText(/Feed costs one star/)).toBeInTheDocument();
  });

  it("disables feeding inside the cooldown and states the wait in minutes", () => {
    service.state.pet.lastFedAt = Date.now();
    render(<PetWidget />);

    expect(screen.getByRole("button", { name: "Feed" })).toBeDisabled();
    expect(screen.getByText(/Feed again in 10 min/)).toBeInTheDocument();
  });

  it("counts the cooldown in whole minutes and stops at zero", () => {
    const cooldown = 10 * 60 * 1000;

    expect(cooldownMinutes(0, 0, cooldown)).toBe(10);
    expect(cooldownMinutes(0, 9.5 * 60 * 1000, cooldown)).toBe(1);
    expect(cooldownMinutes(0, 10 * 60 * 1000, cooldown)).toBe(0);
    expect(cooldownMinutes(0, 11 * 60 * 1000, cooldown)).toBe(0);
  });

  it("draws a five-step glyph for hunger and happiness", () => {
    expect(levelGlyph(3)).toBe("●●●○○");
    expect(levelGlyph(0)).toBe("○○○○○");
    expect(levelGlyph(9)).toBe("●●●●●");
  });

  it("names every stage and how far the next one is", () => {
    expect([1, 2, 3, 4, 5].map(stageName)).toEqual(["Egg", "Sprout", "Budreptile", "Florasaur", "Mega Florasaur"]);
    expect(nextStageHint(0)).toBe("10 XP to the next stage");
    expect(nextStageHint(35)).toBe("25 XP to the next stage");
    expect(nextStageHint(100)).toBe("Fully evolved");
  });
});
