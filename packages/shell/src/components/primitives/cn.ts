/** Joins class names, dropping empty ones. The primitives ship no styling library. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
