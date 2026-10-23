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

/**
 * The same conversion without the promise, for a caller that already runs during
 * the build (the prerender step and the devlog pages). No async extension is
 * installed, so `marked` answers synchronously; the cast is the narrowest way to
 * say that.
 */
export function renderMarkdownSync(markdownStr: string): string {
  return marked.parse(markdownStr, { async: false }) as string;
}

/**
 * The shape a post body takes inside a page: the body's own `#` becomes an `h2`,
 * so the page keeps exactly one `h1` (the post title), and every heading carries
 * an anchor id generated here — at build time — so a link to a section survives.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const pageMarked = new Marked({ gfm: true, breaks: true });

pageMarked.use({
  renderer: {
    heading(this: { parser: { parseInline: (tokens: unknown[]) => string } }, text: string, level: number): string {
      const demoted = Math.min(level + 1, 6);
      const id = slugifyHeading(text);
      return `<h${demoted} id="${id}">${text}</h${demoted}>\n`;
    },
  },
});

/** Converts a post body for a page, synchronously — used by the prerender step. */
export function renderPostBody(markdownStr: string): string {
  const html = pageMarked.parse(markdownStr, { async: false }) as string;

  // A GFM task list renders a bare checkbox, which has no accessible name; the
  // accessibility gate fails the build for it (US-FND-006).
  return html.replace(/<input ([^>]*type="checkbox"[^>]*)>/g, '<input $1 aria-label="Task">');
}
