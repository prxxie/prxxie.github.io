import { Marked } from "marked";
import prismjs from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-css";

const marked = new Marked({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    code(
      code: string,
      infostring: string | undefined,
      escaped: boolean
    ): string {
      const lang = (infostring || "").match(/^\S*/)?.[0];
      if (lang && lang in prismjs.languages) {
        try {
          const highlighted = prismjs.highlight(
            code,
            prismjs.languages[lang],
            lang
          );
          return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
        } catch (e) {
          console.error("Prism highlighting failed:", e);
        }
      }
      const escape = (str: string): string =>
        str.replace(/[&<>"']/g, (m) => {
          const map: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          };
          return map[m];
        });
      return `<pre><code>${escaped ? code : escape(code)}</code></pre>`;
    },
  },
});

export interface ParsedPost {
  title: string;
  date: string;
  content: string;
}

export function parsePost(
  mdText: string
): ParsedPost & Record<string, string> {
  const regex = /^---\r?\n([\s\S]+?)\r?\n---\r?\n([\s\S]*)$/;
  const match = regex.exec(mdText);
  if (!match) {
    const defaultPost: ParsedPost & Record<string, string> = {
      title: "Untitled Post",
      date: "",
      author: "",
      content: mdText,
    };
    return defaultPost;
  }

  const frontmatter = match[1];
  const content = match[2];
  const metadata: Record<string, string> = {};
  frontmatter.split("\n").forEach((line) => {
    const parts = line.split(":");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join(":").replace(/"/g, "").trim();
      metadata[key] = value;
    }
  });
  return {
    title: metadata.title || "Untitled Post",
    date: metadata.date || "",
    author: metadata.author || "",
    ...metadata,
    content,
  };
}

export async function renderMarkdown(markdownStr: string): Promise<string> {
  return await marked.parse(markdownStr);
}
