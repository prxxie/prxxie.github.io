import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// Minimal frontmatter parser
function parsePost(mdText) {
  const regex = /^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/;
  const match = regex.exec(mdText);
  if (!match) return { title: 'Untitled Post', date: '', content: mdText };

  const frontmatter = match[1];
  const content = match[2];
  const metadata = {};
  frontmatter.split('\n').forEach((line) => {
    const parts = line.split(':');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(':').replace(/"/g, '').trim();
      metadata[key] = value;
    }
  });
  return { ...metadata, content };
}

export default function PostsApp() {
  const [selectedPost, setSelectedPost] = useState(null);

  // Static posts catalog index
  const postsList = [
    { id: 'first-post', title: 'Hello, Retro World!', date: '2026-05-28' }
  ];

  const { data: postContent, isLoading, isError } = useQuery({
    queryKey: ['post', selectedPost],
    queryFn: async () => {
      if (!selectedPost) return null;
      // Fetching post from central public path
      const res = await fetch(`./posts/${selectedPost}.md`);
      if (!res.ok) throw new Error('Post not found');
      const text = await res.text();
      return parsePost(text);
    },
    enabled: !!selectedPost
  });

  return (
    <div className="flex flex-col h-full gap-2 overflow-y-auto">
      <h2 className="font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1">📚 BLOG CATALOG</h2>

      {selectedPost === null ? (
        <div className="flex flex-col gap-2 pt-2">
          {postsList.map((post) => (
            <div 
              key={post.id}
              onClick={() => setSelectedPost(post.id)}
              className="border-2 border-cozy-border p-2 bg-[#f0f9f2] cursor-pointer hover:bg-[#d5eedb] flex justify-between items-center text-sm"
            >
              <span>📜 {post.title}</span>
              <span className="text-xs text-gray-500 font-mono">{post.date}</span>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelectedPost(null)} className="pixel-btn text-[8px] py-1 px-2 mb-2">🔙 BACK</button>
          {isLoading && <div className="font-press text-[8px] pt-4 text-center">LOADING POST CONTENT...</div>}
          {isError && <div className="text-red-500 text-sm">Failed to load post.</div>}
          {postContent && (
            <div className="border-2 border-cozy-border p-3 bg-white text-sm">
              <h3 className="font-bold border-b border-cozy-border pb-1 mb-2 text-md">{postContent.title}</h3>
              <p className="text-xs text-gray-500 mb-4">Date: {postContent.date} | Author: {postContent.author || 'prxxie'}</p>
              <div className="whitespace-pre-wrap leading-relaxed">{postContent.content}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
