import React, { useState } from "react";
import { PixelBackIcon } from "./Icons";
import { useQuery } from "@tanstack/react-query";
import { parsePost, renderMarkdown } from "./utils/markdown";

interface PostCatalogItem {
  id: string;
  title: string;
  date: string;
}

interface ParsedPost {
  title: string;
  date: string;
  author?: string;
  content: string;
}

interface PostWithHtml extends ParsedPost {
  htmlContent: string;
}

export default function PostsApp(): React.ReactElement {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  const postsList: PostCatalogItem[] = [
    { id: "first-post", title: "Hello, Retro World!", date: "2026-05-28" },
    {
      id: "markdown-test",
      title: "Markdown Verification",
      date: "2026-05-29",
    },
  ];

  const {
    data: postContent,
    isLoading,
    isError,
  } = useQuery<PostWithHtml | null>({
    queryKey: ["post", selectedPost],
    queryFn: async () => {
      if (!selectedPost) return null;
      const res = await fetch(`./posts/${selectedPost}.md`);
      if (!res.ok) throw new Error("Post not found");
      const text = await res.text();
      const parsed = parsePost(text);
      const htmlContent = await renderMarkdown(parsed.content);
      return { ...parsed, htmlContent };
    },
    enabled: !!selectedPost,
  });

  return (
    <div className="flex flex-col h-full gap-4 overflow-y-auto">
      <div className="text-sm text-muted">
        guest@prxxie:~$ <span className="text-ink">ls -l blog/posts/</span>
      </div>

      {selectedPost === null ? (
        <div className="flex flex-col gap-2 pt-2">
          {postsList.map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPost(post.id)}
              className="text-left text-sm py-1 flex justify-between items-center text-ink hover:text-primary"
            >
              <span>
                &gt; {post.title.toUpperCase().replace(/[\s,]+/g, "_").replace(/[!]+/g, "")}.MD
              </span>
              <span className="text-xs text-muted ml-4">
                [{post.date}]
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedPost(null)}
            className="btn btn-primary btn-sm h-10 px-5 mb-2"
          >
            <PixelBackIcon className="w-3.5 h-3.5 mr-1" /> BACK
          </button>
          {isLoading && (
            <div className="text-xs pt-4 text-center">
              LOADING POST CONTENT...
            </div>
          )}
          {isError && (
            <div className="text-error text-sm">Failed to load post.</div>
          )}
          {postContent && (
            <div className="card bg-surface-dark text-on-dark p-6 min-h-[300px]">
              <h3 className="font-bold border-b border-hairline pb-2 mb-2 text-md uppercase">
                {postContent.title}
              </h3>
              <p className="text-xs text-on-dark-soft mb-4">
                DATE: {postContent.date} | AUTHOR: {postContent.author?.toUpperCase() || "PRXXIE"}
              </p>
              <div
                className="text-sm leading-relaxed font-body"
                dangerouslySetInnerHTML={{
                  __html: postContent.htmlContent,
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
