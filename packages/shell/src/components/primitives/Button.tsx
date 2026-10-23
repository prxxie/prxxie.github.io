import React from "react";
import { cn } from "./cn";

export type ButtonVariant = "primary" | "secondary";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** `primary` is the one action colour on a view; every other button is secondary. */
  variant?: ButtonVariant;
}

/**
 * The button recipe from docs/02-reference/design-system.md: default, hover, active,
 * disabled and focus all come from `.btn` in `packages/shell/src/index.css`.
 */
export default function Button({
  variant = "secondary",
  className,
  type = "button",
  ...rest
}: ButtonProps): React.ReactElement {
  return <button type={type} className={cn("btn", variant === "primary" && "btn-primary", className)} {...rest} />;
}
