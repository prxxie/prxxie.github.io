import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import PetsApp from "./PetsApp";

describe("PetsApp MFE", () => {
  it("renders in standalone mode when progressState is not provided", () => {
    render(<PetsApp />);
    expect(screen.getByText("STANDALONE MODE")).toBeInTheDocument();
    expect(screen.getByText("NOT HUNGRY")).toBeDisabled();
  });

  it("renders state when pet is hungry and feed button is enabled and clickable", async () => {
    const feedPetMock = vi.fn().mockResolvedValue(undefined);
    const mockProgressState = {
      state: {
        pet: {
          xp: 15,
          stage: 2,
          lastFedAt: Date.now(),
          happiness: 60,
        },
        completedLevels: [],
        foodConsumed: 3,
      },
      isHungry: true,
      foodAvailable: 5,
      hungryLevel: 3,
      happiness: 60,
      isSleeping: false,
      feedPet: feedPetMock,
    };

    render(<PetsApp progressState={mockProgressState} />);

    expect(screen.getByText("SYSTEM SYNC: ACTIVE")).toBeInTheDocument();
    expect(screen.getByText("LEAFY SPROUT")).toBeInTheDocument();
    expect(screen.getByText("AVAILABLE FOOD:")).toBeInTheDocument();
    expect(screen.getByText("★ x 5")).toBeInTheDocument();

    const feedBtn = screen.getByRole("button", { name: /FEED STAR-FOOD/i });
    expect(feedBtn).toBeEnabled();

    await act(async () => {
      fireEvent.click(feedBtn);
      // Flush microtasks
      await Promise.resolve();
    });

    expect(feedPetMock).toHaveBeenCalledTimes(1);
  });

  it("disables feed button when pet is sleeping", () => {
    const feedPetMock = vi.fn();
    const mockProgressState = {
      state: {
        pet: {
          xp: 15,
          stage: 2,
          lastFedAt: Date.now(),
          happiness: 60,
        },
        completedLevels: [],
        foodConsumed: 3,
      },
      isHungry: true,
      foodAvailable: 5,
      hungryLevel: 3,
      happiness: 60,
      isSleeping: true,
      feedPet: feedPetMock,
    };

    render(<PetsApp progressState={mockProgressState} />);

    // Since pet is sleeping, canFeed should be false, and the button should be disabled
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("NO STAR-FOOD");

    // Check if PetSprite displays the Zzz's when isSleeping is true
    expect(screen.getByText("Z")).toBeInTheDocument();
    expect(screen.getByText("z")).toBeInTheDocument();
  });
});
