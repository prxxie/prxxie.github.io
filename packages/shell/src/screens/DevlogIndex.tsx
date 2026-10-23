import React, { lazy, Suspense } from "react";

const PostsApp = lazy(() => import("posts/PostsApp"));

/**
 * Placeholder until US-DEVLOG-002 lists the posts: the build emits this headline
 * so `/devlog` is a readable document without JavaScript (US-SITE-003 AC2).
 */
export default function DevlogIndex(): React.ReactElement {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="font-display text-[32px] leading-tight text-ink">Devlog</h1>
      {import.meta.env.SSR ? (
        <p className="text-body">Notes on what was built, what broke and what it cost. The list loads in the browser.</p>
      ) : (
        <Suspense fallback={<p className="text-muted">Loading the devlog…</p>}>
          <PostsApp />
        </Suspense>
      )}
    </section>
  );
}
