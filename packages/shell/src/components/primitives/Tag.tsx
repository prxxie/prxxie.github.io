import React from "react";
import { cn } from "./cn";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** `action` tints the tag with the action colour; use it only for the one per view. */
  tone?: "neutral" | "action";
}

/** A small pill for topics, level ids and engine names. */
export default function Tag({ tone = "neutral", className, children, ...rest }: TagProps): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill border border-hairline px-2 py-[2px] font-code text-[11px] uppercase tracking-wide",
        tone === "action" ? "bg-primary text-canvas" : "text-muted",
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
