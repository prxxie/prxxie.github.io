import { Marked } from 'marked';
import prismjs from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';

const marked = new Marked({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    code(code, infostring, escaped) {
      const lang = (infostring || '').match(/^\S*/)?.[0];
      if (lang && prismjs.languages[lang]) {
        try {
          const highlighted = prismjs.highlight(code, prismjs.languages[lang], lang);
          return `<pre class="language-${lang}"><code class="language-${lang}">${highlighted}</code></pre>`;
        } catch (e) {
          console.error('Prism highlighting failed:', e);
        }
      }
      // Fallback escape helper
      const escape = (str) => str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[m]));
      return `<pre><code>${escaped ? code : escape(code)}</code></pre>`;
    }
  }
});

// Frontmatter parser utility
export function parsePost(mdText) {
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

// Render markdown string to HTML asynchronously
export async function renderMarkdown(markdownStr) {
  return await marked.parse(markdownStr);
}
