import React, { lazy, Suspense } from "react";
import { useParams } from "react-router";

const PostsApp = lazy(() => import("posts/PostsApp"));

export default function DevlogPost(): React.ReactElement {
  const { slug = "" } = useParams();

  return (
    <article className="flex flex-col gap-4">
      <p className="font-code text-[12px] text-muted">devlog/{slug}</p>
      <Suspense fallback={<p className="text-muted">Loading the post…</p>}>
        <PostsApp />
      </Suspense>
    </article>
  );
}
