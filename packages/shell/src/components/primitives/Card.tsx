import React from "react";
import { cn } from "./cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `dark` is the puzzle frame: a board on cream loses its edge (OQ-11). */
  tone?: "light" | "dark";
}

/** A surface card. Shares the `.panel` recipe with every raised surface on the site. */
export default function Card({ tone = "light", className, children, ...rest }: CardProps): React.ReactElement {
  return (
    <div className={cn("panel flex-col gap-2 p-4", tone === "dark" && "panel-dark", className)} {...rest}>
      {children}
    </div>
  );
}
