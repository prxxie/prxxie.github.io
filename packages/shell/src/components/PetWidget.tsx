import React, { useCallback, useState } from "react";
import PetSprite from "./PetSprite";
import PetWidgetFrame from "./primitives/PetWidgetFrame";
import Tag from "./primitives/Tag";
import Button from "./primitives/Button";
import { useProgressService } from "../hooks/useProgressService";
import { EVOLUTION_THRESHOLDS } from "shared";

/**
 * US-PET-001: the pet, at footer size. Everything it shows comes from
 * `ProgressService` through the shell hook — the widget owns no state beyond the
 * moment a button was pressed, and it never touches storage.
 *
 * The three figures are rendered as text first: a reader who cannot see the sprite
 * still learns the stage, how hungry the pet is and how happy it is.
 */

const STAGE_NAMES = ["Egg", "Sprout", "Budreptile", "Florasaur", "Mega Florasaur"] as const;

export function stageName(stage: number): string {
  return STAGE_NAMES[stage - 1] ?? "Egg";
}

/** Brightness by feel: five steps, so hunger reads at a glance without colour alone. */
export function levelGlyph(level: number, filled = "●", empty = "○"): string {
  const steps = 5;
  const clamped = Math.max(0, Math.min(steps, Math.round(level)));
  return `${filled.repeat(clamped)}${empty.repeat(steps - clamped)}`;
}

/** How many stars until the next stage, and what happens at the top one. */
export function nextStageHint(xp: number): string {
  const next = EVOLUTION_THRESHOLDS.find((threshold) => threshold > xp);

  return next === undefined ? "Fully evolved" : `${next - xp} XP to the next stage`;
}

export default function PetWidget(): React.ReactElement | null {
  const { state, hungryLevel, foodAvailable, happiness, isSleeping, feedPet, playWithPet, toggleSleep } =
    useProgressService();
  const [busy, setBusy] = useState<"feed" | "play" | null>(null);

  const act = useCallback(
    async (which: "feed" | "play") => {
      setBusy(which);
      try {
        await (which === "feed" ? feedPet() : playWithPet());
      } catch {
        // The service logs the reason; the widget stays usable.
      } finally {
        setBusy(null);
      }
    },
    [feedPet, playWithPet],
  );

  if (!state.pet) return null;

  const canFeed = hungryLevel > 0 && foodAvailable > 0 && !isSleeping && busy === null;
  const canPlay = !isSleeping && happiness < 100 && busy === null;
  const status = isSleeping ? "Asleep" : hungryLevel > 0 ? "Hungry" : "Content";

  return (
    <PetWidgetFrame
      className="mt-2 flex-col sm:flex-row sm:items-center"
      caption={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-medium text-ink">{stageName(state.pet.stage)}</span>
          <span>{status}</span>
          <Tag>{`${state.pet.xp} XP`}</Tag>
          <Tag>{`${foodAvailable} star${foodAvailable === 1 ? "" : "s"}`}</Tag>
          <span className="text-muted">{nextStageHint(state.pet.xp)}</span>
        </span>
      }
    >
      <div className="flex flex-col items-center gap-1">
        <span aria-hidden="true" className={isSleeping ? "opacity-70" : ""}>
          <PetSprite
            size={48}
            stage={state.pet.stage}
            status={isSleeping ? "sleeping" : busy === "feed" ? "eating" : busy === "play" ? "playing" : "idle"}
            isSleeping={isSleeping}
            isHungry={hungryLevel > 0}
          />
        </span>
        <dl className="flex flex-col gap-[2px] font-code text-[11px] text-muted">
          <div className="flex gap-2">
            <dt className="sr-only">Hunger</dt>
            <dd>
              <span aria-hidden="true">{levelGlyph(hungryLevel)}</span>{" "}
              <span className="whitespace-nowrap">hunger {hungryLevel}/5</span>
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="sr-only">Happiness</dt>
            <dd>
              <span aria-hidden="true">{levelGlyph(happiness / 20)}</span>{" "}
              <span className="whitespace-nowrap">happiness {happiness}%</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-0">
        <Button variant="primary" disabled={!canFeed} onClick={() => void act("feed")}>
          Feed
        </Button>
        <Button disabled={!canPlay} onClick={() => void act("play")}>
          Play
        </Button>
        <Button onClick={() => void toggleSleep()}>{isSleeping ? "Wake" : "Sleep"}</Button>
        <span className="font-code text-[11px] text-muted">
          {isSleeping
            ? "Sleeping: play is paused until the pet wakes."
            : hungryLevel === 0
              ? "Not hungry yet."
              : foodAvailable === 0
                ? "No stars to spend — finish a level to earn one."
                : "Feed costs one star."}
        </span>
      </div>
    </PetWidgetFrame>
  );
}
