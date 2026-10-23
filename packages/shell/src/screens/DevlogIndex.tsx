import React, { lazy, Suspense } from "react";

const PostsApp = lazy(() => import("posts/PostsApp"));

export default function DevlogIndex(): React.ReactElement {
  return (
    <Suspense fallback={<p className="text-muted">Loading the devlog…</p>}>
      <PostsApp />
    </Suspense>
  );
}
