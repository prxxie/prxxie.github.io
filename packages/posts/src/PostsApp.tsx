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
    <div className="flex flex-col h-full gap-2 overflow-y-auto">
      <div className="font-mono text-xs text-cozy-muted mb-2">
        guest@prxxie:~$ <span className="text-cozy-text">ls -l blog/posts/</span>
      </div>

      {selectedPost === null ? (
        <div className="flex flex-col gap-2 pt-2">
          {postsList.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post.id)}
              className="group font-mono text-sm py-1 cursor-pointer flex justify-between items-center text-cozy-text hover:text-white"
            >
              <span className="flex items-center group-hover:blink-cursor">
                &gt; {post.title.toUpperCase().replace(/[\s,]+/g, "_").replace(/[!]+/g, "")}.MD
              </span>
              <span className="text-xs text-cozy-muted font-mono ml-4">
                [{post.date}]
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedPost(null)}
            className="pixel-btn text-[8px] py-1 px-2 mb-2"
          >
            <PixelBackIcon className="w-3.5 h-3.5 mr-1" /> BACK
          </button>
          {isLoading && (
            <div className="font-press text-[8px] pt-4 text-center">
              LOADING POST CONTENT...
            </div>
          )}
          {isError && (
            <div className="text-red-500 text-sm">Failed to load post.</div>
          )}
          {postContent && (
            <div className="bg-[#050505] border border-cozy-border p-6 min-h-[300px] font-mono text-cozy-text relative">
              <h3 className="font-bold border-b border-cozy-border pb-2 mb-2 text-md text-cozy-text uppercase">
                {postContent.title}
              </h3>
              <p className="text-[10px] text-cozy-muted mb-4 font-mono">
                DATE: {postContent.date} | AUTHOR: {postContent.author?.toUpperCase() || "PRXXIE"}
              </p>
              <div
                className="markdown-body text-sm leading-relaxed"
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
