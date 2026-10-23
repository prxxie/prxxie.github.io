import React from "react";
import { cn } from "./cn";

export interface StarRatingProps {
  earned: number;
  /** The site awards three stars per level; the total is never inferred from the glyphs. */
  total?: number;
  className?: string;
}

const GLYPH = { earned: "★", unearned: "☆" } as const;

/**
 * The star count as text, the glyphs as decoration: a screen reader reads
 * "1 of 3 stars" once, and no meaning lives in a shape alone (AC6, NFR-12).
 */
export default function StarRating({ earned, total = 3, className }: StarRatingProps): React.ReactElement {
  const earnedClamped = Math.max(0, Math.min(earned, total));
  const label = `${earnedClamped} of ${total} stars`;

  return (
    <span className={cn("inline-flex items-center gap-1", className)} aria-label={label} role="img">
      <span aria-hidden="true" className="font-code text-[12px] tracking-[0.1em] text-accent-amber">
        {GLYPH.earned.repeat(earnedClamped)}
        {GLYPH.unearned.repeat(total - earnedClamped)}
      </span>
      <span className="font-code text-[11px] text-muted">
        {earnedClamped}/{total}
      </span>
    </span>
  );
}
