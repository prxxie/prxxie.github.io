import React, { useCallback, useState } from "react";
import PetSprite from "./PetSprite";
import PetWidgetFrame from "./primitives/PetWidgetFrame";
import Tag from "./primitives/Tag";
import Button from "./primitives/Button";
import { useProgressService } from "../hooks/useProgressService";
import { EVOLUTION_THRESHOLDS, HUNGER_COOLDOWN } from "shared";

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

/** Whole minutes left on the feed cooldown, so the wait is stated, not guessed. */
export function cooldownMinutes(lastFedAt: number, now: number, cooldownMs: number = HUNGER_COOLDOWN): number {
  const remaining = lastFedAt + cooldownMs - now;

  return remaining <= 0 ? 0 : Math.ceil(remaining / 60_000);
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
  const [failure, setFailure] = useState<string | null>(null);

  const act = useCallback(
    async (which: "feed" | "play") => {
      setBusy(which);
      try {
        await (which === "feed" ? feedPet() : playWithPet());
      } catch (error) {
        // The service logs the reason; say it once, in the reader's line of sight.
        setFailure(error instanceof Error ? error.message : "That did not work. Try again.");
      } finally {
        setFailure(null);
      setBusy(null);
      }
    },
    [feedPet, playWithPet],
  );

  if (!state.pet) return null;

  const starsEarned = state.completedLevels.reduce((total, level) => total + (level.stars ?? 0), 0);
  const waitMinutes = cooldownMinutes(state.pet.lastFedAt, Date.now());
  const canFeed = hungryLevel > 0 && foodAvailable > 0 && waitMinutes === 0 && !isSleeping && busy === null;
  const canPlay = !isSleeping && happiness < 100 && busy === null;
  const status = isSleeping ? "Asleep" : hungryLevel > 0 ? "Hungry" : "Content";
  const statusTone = isSleeping ? "text-muted" : hungryLevel > 0 ? "text-warning" : "text-success";

  return (
    <PetWidgetFrame
      className="mt-2 flex-col sm:flex-row sm:items-center"
      caption={
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-medium text-ink">{stageName(state.pet.stage)}</span>
          <span className={statusTone}>{status}</span>
          <Tag>{`${state.pet.xp} XP`}</Tag>
          <Tag>{`${foodAvailable} of ${starsEarned} stars`}</Tag>
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
        {failure !== null && (
          <span role="status" className="font-code text-[11px] text-error">
            {failure}
          </span>
        )}
        <span className="font-code text-[11px] text-muted">
          {isSleeping
            ? "Sleeping: play is paused until the pet wakes."
            : hungryLevel === 0
              ? "Not hungry yet."
              : foodAvailable === 0
                ? "No stars to spend — finish a level to earn one."
                : waitMinutes > 0
                  ? `Feed again in ${waitMinutes} min (one feed every 10 min).`
                  : "Feed costs one star."}
        </span>
      </div>
    </PetWidgetFrame>
  );
}
