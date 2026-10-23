import { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * The old site addressed pages as `#about`, `#posts`, `#shikaku`… Those links are
 * still in the wild, so they are mapped once on mount — a replace navigation, so
 * the back button has nothing extra to step through (US-SITE-005).
 */
export const LEGACY_HASH_ROUTES: Record<string, string> = {
  "": "/",
  "about": "/",
  "posts": "/devlog",
  "pets": "/",
  "shikaku": "/games/shikaku",
  "sokoban": "/games/sokoban",
  "slitherlink": "/games/slitherlink",
};

/**
 * The path an old fragment lands on. A fragment nobody mapped keeps its own name,
 * so it meets the catch-all route and the not-found screen — never a redirect loop.
 */
export function legacyPathFor(hash: string): string | null {
  if (hash === "" || hash === "#") return null;

  const fragment = hash.replace(/^#\/?/, "").replace(/\/$/, "").toLowerCase();

  return LEGACY_HASH_ROUTES[fragment] ?? `/${fragment}`;
}

export function useLegacyHashRedirect(): void {
  const navigate = useNavigate();

  useEffect(() => {
    const target = legacyPathFor(window.location.hash);

    if (target === null) return;

    void navigate(target, { replace: true });
  }, [navigate]);
}
