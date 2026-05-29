import React, { useState } from "react";
import { PixelBookIcon, PixelScrollIcon, PixelBackIcon } from "./Icons";
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
      <h2 className="font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1 flex items-center gap-1">
        <PixelBookIcon className="w-4 h-4 text-cozy-accent" /> BLOG CATALOG
      </h2>

      {selectedPost === null ? (
        <div className="flex flex-col gap-2 pt-2">
          {postsList.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPost(post.id)}
              className="border-2 border-cozy-border p-2 bg-white cursor-pointer hover:bg-cozy-accent hover:text-white flex justify-between items-center text-sm"
            >
              <span className="flex items-center"><PixelScrollIcon className="w-4 h-4 mr-2" /> {post.title}</span>
              <span className="text-xs text-gray-500 font-mono">
                {post.date}
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
            <div className="notebook-paper p-6 relative min-h-[300px]">
              <div className="notebook-margin"></div>
              <div className="notebook-content relative z-10 pl-6">
                <h3 className="font-bold border-b border-cozy-border pb-1 mb-2 text-md text-[#5c3c24]">
                  {postContent.title}
                </h3>
                <p className="text-[10px] text-gray-500 mb-4 font-mono">
                  Date: {postContent.date} | Author:{" "}
                  {postContent.author || "prxxie"}
                </p>
                <div
                  className="markdown-body text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: postContent.htmlContent,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
