import React from "react";
import { cn } from "./cn";

export interface PetWidgetFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The line of copy under the sprite, e.g. "Nipper is hungry". */
  caption?: React.ReactNode;
}

/**
 * The card the pet widget mounts in: sprite, one line of copy, actions beside it
 * (design-system.md § component recipes). US-PET-001 supplies the sprite and the
 * actions; the frame stays in the shell so every surface looks the same.
 */
export default function PetWidgetFrame({
  caption,
  className,
  children,
  ...rest
}: PetWidgetFrameProps): React.ReactElement {
  return (
    <div className={cn("panel items-center gap-4 p-4", className)} {...rest}>
      <div className="flex shrink-0 items-center justify-center">{children}</div>
      {caption !== undefined && <p className="text-sm text-body">{caption}</p>}
    </div>
  );
}
