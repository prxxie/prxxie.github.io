export interface SiteNavItem {
  to: string;
  label: string;
  end?: boolean;
}

/** The whole site in three words: what it is, what it plays, how it was made. */
export const NAV_ITEMS: SiteNavItem[] = [
  { to: "/", label: "Home", end: true },
  { to: "/games", label: "Games" },
  { to: "/devlog", label: "Devlog" },
];
