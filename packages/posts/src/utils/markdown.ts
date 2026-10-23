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

export async function renderMarkdown(markdownStr: string): Promise<string> {
  return await marked.parse(markdownStr);
}
