import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("renders standard and GFM markdown", async () => {
    const html = await renderMarkdown("# Header\nThis is **bold** text.");

    expect(html).toContain("<h1>Header</h1>");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("highlights fenced code blocks with Prism", async () => {
    const html = await renderMarkdown("```javascript\nconst a = 12;\n```");

    expect(html).toContain('<pre class="language-javascript">');
    expect(html).toContain('class="token keyword"');
  });
});
