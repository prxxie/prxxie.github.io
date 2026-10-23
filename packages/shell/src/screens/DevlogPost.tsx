import React, { lazy, Suspense } from "react";
import { useParams } from "react-router";

const PostsApp = lazy(() => import("posts/PostsApp"));

/**
 * Placeholder until US-DEVLOG-003 gives a post its own page: the slug is the
 * headline so the prerendered document is never empty (US-SITE-003 AC2).
 */
export default function DevlogPost(): React.ReactElement {
  const { slug = "" } = useParams();

  return (
    <article className="flex flex-col gap-4">
      <p className="font-code text-[12px] text-muted">devlog/{slug}</p>
      <h1 className="font-display text-[32px] leading-tight text-ink">{slug.replace(/-/g, " ")}</h1>
      {import.meta.env.SSR ? (
        <p className="text-body">This note renders in the browser. Its reading copy is part of the post collection.</p>
      ) : (
        <Suspense fallback={<p className="text-muted">Loading the post…</p>}>
          <PostsApp />
        </Suspense>
      )}
    </article>
  );
}
