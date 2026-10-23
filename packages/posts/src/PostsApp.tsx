import React, { useEffect, useState } from "react";
import { PixelBackIcon } from "./Icons";
import { loadPosts } from "./content/loadPosts";
import { renderMarkdown } from "./utils/markdown";

const posts = loadPosts();

export default function PostsApp(): React.ReactElement {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const selected = posts.find((post) => post.slug === selectedSlug) ?? null;

  useEffect(() => {
    setHtml(null);
    setFailed(false);
    if (!selected) return;

    let cancelled = false;
    renderMarkdown(selected.body)
      .then((rendered) => {
        if (!cancelled) setHtml(rendered);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  return (
    <div className="flex flex-col h-full gap-4 overflow-y-auto">
      <div className="text-sm text-muted">
        guest@prxxie:~$ <span className="text-ink">ls -l blog/posts/</span>
      </div>

      {selected === null ? (
        <div className="flex flex-col gap-2 pt-2">
          {posts.length === 0 && <p className="text-sm text-muted">No posts yet.</p>}
          {posts.map((post) => (
            <button
              key={post.slug}
              onClick={() => setSelectedSlug(post.slug)}
              className="text-left text-sm py-1 flex flex-col gap-1 text-ink hover:text-primary"
            >
              <span className="flex justify-between items-center w-full">
                <span>{post.title}</span>
                <span className="text-xs text-muted ml-4">[{post.date}]</span>
              </span>
              <span className="text-xs text-muted font-body">{post.summary}</span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedSlug(null)}
            className="btn btn-primary btn-sm h-10 px-5 mb-2"
          >
            <PixelBackIcon className="w-3.5 h-3.5 mr-1" /> BACK
          </button>
          {html === null && !failed && (
            <div className="text-xs pt-4 text-center">LOADING POST CONTENT...</div>
          )}
          {failed && <div className="text-error text-sm">Failed to load post.</div>}
          {html !== null && (
            <div className="card bg-surface-dark text-on-dark p-6 min-h-[300px]">
              <h3 className="font-bold border-b border-hairline pb-2 mb-2 text-md uppercase">
                {selected.title}
              </h3>
              <p className="text-xs text-on-dark-soft mb-4">DATE: {selected.date}</p>
              <div className="text-sm leading-relaxed font-body" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
