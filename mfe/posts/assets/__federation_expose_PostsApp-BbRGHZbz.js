import { importShared } from './__federation_fn_import-Ms9HzHFY.js';
import { j as jsxRuntimeExports } from './jsx-runtime-CyoIsdjr.js';

const React = await importShared('react');
const {useState} = React;

const {useQuery} = await importShared('@tanstack/react-query');

function parsePost(mdText) {
  const regex = /^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/;
  const match = regex.exec(mdText);
  if (!match) return { title: "Untitled Post", date: "", content: mdText };
  const frontmatter = match[1];
  const content = match[2];
  const metadata = {};
  frontmatter.split("\n").forEach((line) => {
    const parts = line.split(":");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(":").replace(/"/g, "").trim();
      metadata[key] = value;
    }
  });
  return { ...metadata, content };
}
function PostsApp() {
  const [selectedPost, setSelectedPost] = useState(null);
  const postsList = [
    { id: "first-post", title: "Hello, Retro World!", date: "2026-05-28" }
  ];
  const { data: postContent, isLoading, isError } = useQuery({
    queryKey: ["post", selectedPost],
    queryFn: async () => {
      if (!selectedPost) return null;
      const res = await fetch(`./posts/${selectedPost}.md`);
      if (!res.ok) throw new Error("Post not found");
      const text = await res.text();
      return parsePost(text);
    },
    enabled: !!selectedPost
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full gap-2 overflow-y-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-press text-[12px] border-b-2 border-dashed border-cozy-border pb-1", children: "📚 BLOG CATALOG" }),
    selectedPost === null ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2 pt-2", children: postsList.map((post) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => setSelectedPost(post.id),
        className: "border-2 border-cozy-border p-2 bg-white cursor-pointer hover:bg-cozy-accent hover:text-white flex justify-between items-center text-sm",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "📜 ",
            post.title
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500 font-mono", children: post.date })
        ]
      },
      post.id
    )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedPost(null), className: "pixel-btn text-[8px] py-1 px-2 mb-2", children: "🔙 BACK" }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-press text-[8px] pt-4 text-center", children: "LOADING POST CONTENT..." }),
      isError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-red-500 text-sm", children: "Failed to load post." }),
      postContent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-cozy-border p-3 bg-white text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold border-b border-cozy-border pb-1 mb-2 text-md", children: postContent.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mb-4", children: [
          "Date: ",
          postContent.date,
          " | Author: ",
          postContent.author || "prxxie"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "whitespace-pre-wrap leading-relaxed", children: postContent.content })
      ] })
    ] })
  ] });
}

export { PostsApp as default };
