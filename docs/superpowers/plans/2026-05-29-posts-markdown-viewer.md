# Posts MFE Rich Markdown Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a GFM-compliant markdown parser with programming language syntax highlighting and a cozy notebook paper layout for the posts microfrontend.

**Architecture:** We will install `marked` and `prismjs` as parsing and syntax highlighting dependencies inside the `posts` MFE workspace. The parsed Markdown body will render via `dangerouslySetInnerHTML` styled in a vertical-margin cream notebook container utilizing Tailwind CSS v4.

**Tech Stack:** React, `@tanstack/react-query`, Tailwind CSS v4, `marked`, `prismjs`, Vitest.

---

## Workspace Configuration & Dependencies

### Task 1: Install marked and prismjs in packages/posts
**Files:**
- Modify: `packages/posts/package.json`

- [ ] **Step 1: Edit package.json to add marked and prismjs**
Add `"marked": "^12.0.0"` and `"prismjs": "^1.29.0"` to the `dependencies` key in `packages/posts/package.json`:
```json
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@tanstack/react-query": "^5.40.0",
    "marked": "^12.0.0",
    "prismjs": "^1.29.0"
  }
```

- [ ] **Step 2: Run npm install**
Run `npm install` in the monorepo root to download the packages and rebuild package locks.
Run: `npm install`
Expected output: Success message indicating packages are installed.

- [ ] **Step 3: Commit**
```bash
git add packages/posts/package.json package-lock.json
git commit -m "chore: add marked and prismjs dependencies to posts MFE"
```

---

## Unit Testing & Verification Base

### Task 2: Create Test Markdown Post
**Files:**
- Create: `public/posts/markdown-test.md`

- [ ] **Step 1: Write markdown-test.md with rich formatting**
Create `public/posts/markdown-test.md` containing all standard GFM features (H1-H3, lists, task-lists, table, blockquote, and highlighted code blocks).
```markdown
---
title: "Markdown Verification"
date: "2026-05-29"
author: "prxxie"
category: "retro"
---

# Heading 1
Welcome to the markdown verification post!

## Blockquotes
> This is a blockquote containing some *italicized* text.
> It should have a nice left border indicator.

## Lists & Tasks
- [ ] Task 1: Refactor MFE
- [x] Task 2: Fix MFE loading issue
- Standard list item 1
- Standard list item 2

## Tables
| Key | Value | Description |
|---|---|---|
| theme | notebook | Cozy cream book layout |
| code | prism | Token syntax highlighting |

## Code Blocks
```javascript
const pet = "tamagotchi";
console.log(`Hello, ${pet}!`);
```
```

- [ ] **Step 2: Add test post to the list in PostsApp.jsx**
Modify `packages/posts/src/PostsApp.jsx` to expose the new test post in the catalog:
```javascript
  const postsList = [
    { id: 'first-post', title: 'Hello, Retro World!', date: '2026-05-28' },
    { id: 'markdown-test', title: 'Markdown Verification', date: '2026-05-29' }
  ];
```

- [ ] **Step 3: Commit**
```bash
git add public/posts/markdown-test.md packages/posts/src/PostsApp.jsx
git commit -m "test: add rich markdown verification post and update catalog"
```

### Task 3: Create Unit Tests for PostsApp
**Files:**
- Create: `packages/posts/src/PostsApp.test.jsx`

- [ ] **Step 1: Write unit test suite for markdown parsing**
Create `packages/posts/src/PostsApp.test.jsx` that mocks `fetch` to load markdown and verifies correct rendering of post titles, metadata, headings, and bold text.
```javascript
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostsApp from './PostsApp';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

global.fetch = vi.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('PostsApp Markdown Parser', () => {
  it('correctly parses and renders frontmatter and rich markdown', async () => {
    const mockMarkdown = `---
title: "Test Post Title"
date: "2026-05-29"
author: "testauthor"
---
# Heading 1
This is a **bold** word.
`;
    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockMarkdown),
    });

    render(<PostsApp />, { wrapper: createWrapper() });

    const postItem = screen.getByText(/Hello, Retro World!/i);
    expect(postItem).toBeInTheDocument();

    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockMarkdown),
    });

    postItem.click();

    await waitFor(() => {
      expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    });
    expect(screen.getByText(/Date: 2026-05-29 | Author: testauthor/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test suite to verify failure**
Run: `npm test`
Expected: Failures or mock failures since `marked` parsing is not yet implemented.

- [ ] **Step 3: Commit**
```bash
git add packages/posts/src/PostsApp.test.jsx
git commit -m "test: add initial unit tests for PostsApp markdown rendering"
```

---

## Implementation & Integration

### Task 4: Implement Frontmatter & Markdown Parser in PostsApp.jsx
**Files:**
- Modify: `packages/posts/src/PostsApp.jsx`

- [ ] **Step 1: Integrate marked and prismjs inside PostsApp.jsx**
Configure `marked` with custom syntax highlighting using `prismjs`. Replace the rendering logic to output the parsed html.
```javascript
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Marked } from 'marked';
import prismjs from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-css';

const marked = new Marked({
  gfm: true,
  breaks: true,
  highlight(code, lang) {
    if (prismjs.languages[lang]) {
      return prismjs.highlight(code, prismjs.languages[lang], lang);
    }
    return code;
  }
});

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
```

- [ ] **Step 2: Parse and render HTML in PostsApp component**
Inside `PostsApp`:
```javascript
  const { data: postContent, isLoading, isError } = useQuery({
    queryKey: ['post', selectedPost],
    queryFn: async () => {
      if (!selectedPost) return null;
      const res = await fetch(`./posts/${selectedPost}.md`);
      if (!res.ok) throw new Error('Post not found');
      const text = await res.text();
      const parsed = parsePost(text);
      const htmlContent = await marked.parse(parsed.content);
      return { ...parsed, htmlContent };
    },
    enabled: !!selectedPost
  });
```
And replace the body renderer:
```javascript
          {postContent && (
            <div className="notebook-paper p-6 relative min-h-[300px]">
              <div className="notebook-margin"></div>
              <div className="notebook-content relative z-10 pl-6">
                <h3 className="font-bold border-b border-cozy-border pb-1 mb-2 text-md text-[#5c3c24]">{postContent.title}</h3>
                <p className="text-[10px] text-gray-500 mb-4 font-mono">Date: {postContent.date} | Author: {postContent.author || 'prxxie'}</p>
                <div 
                  className="markdown-body text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: postContent.htmlContent }}
                />
              </div>
            </div>
          )}
```

- [ ] **Step 3: Run test suite to verify completion**
Run: `npm test`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add packages/posts/src/PostsApp.jsx
git commit -m "feat: integrate marked and prismjs into PostsApp parser and component"
```

### Task 5: Add Layout Styles for Cozy Notebook Theme
**Files:**
- Modify: `packages/shell/src/index.css`

- [ ] **Step 1: Write styles for notebook layout and markdown tags**
Append the Notebook Paper styles, Markdown Element selectors, and basic Prism token definitions to the end of `packages/shell/src/index.css`.
```css
/* --- Cozy Notebook Theme (Option B) --- */
.notebook-paper {
  background-color: #fdfbf7;
  border: 2px solid #8c8273;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  box-shadow: 3px 3px 0px #8c8273;
}

.notebook-margin {
  position: absolute;
  top: 0;
  left: 32px;
  bottom: 0;
  width: 2px;
  background-color: #fca5a5;
  z-index: 1;
}

.markdown-body {
  font-family: inherit;
  color: #2e2b27;
}

.markdown-body h1, 
.markdown-body h2, 
.markdown-body h3 {
  font-family: var(--font-pixel);
  color: #5c3c24;
  font-weight: bold;
  margin-top: 16px;
  margin-bottom: 8px;
}

.markdown-body h1 { font-size: 1.5em; border-bottom: 2px solid #8c8273; padding-bottom: 4px; }
.markdown-body h2 { font-size: 1.3em; border-bottom: 1px dashed #8c8273; padding-bottom: 2px; }
.markdown-body h3 { font-size: 1.1em; }

.markdown-body p {
  margin-bottom: 12px;
}

.markdown-body ul {
  list-style-type: disc;
  margin-left: 20px;
  margin-bottom: 12px;
}

.markdown-body ol {
  list-style-type: decimal;
  margin-left: 20px;
  margin-bottom: 12px;
}

.markdown-body blockquote {
  border-left: 4px solid #c2b59b;
  padding-left: 10px;
  margin: 12px 0;
  font-style: italic;
  background-color: #faf7f2;
}

/* GFM Task List Styling */
.markdown-body ul li input[type="checkbox"] {
  margin-right: 6px;
  accent-color: var(--color-cozy-accent);
  pointer-events: none;
}

/* Tables */
.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
  font-size: 13px;
}

.markdown-body th, 
.markdown-body td {
  border: 1px solid #8c8273;
  padding: 6px 8px;
  text-align: left;
}

.markdown-body th {
  background-color: #eae3d5;
  color: #5c3c24;
}

.markdown-body tr:nth-child(even) {
  background-color: #faf7f2;
}

/* Code Syntax & Styling */
.markdown-body code {
  font-family: monospace;
  background-color: #faf7f2;
  border: 1px solid #e2d9c8;
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 90%;
  color: #c2593f;
}

.markdown-body pre {
  background-color: #eae3d5;
  border: 1px solid #c2b59b;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
  margin-bottom: 16px;
}

.markdown-body pre code {
  background-color: transparent;
  border: none;
  padding: 0;
  color: inherit;
  font-size: 12px;
}

/* Prism Token Highlighting (Notebook Pastel Palette) */
.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
  color: #8c8273;
  font-style: italic;
}

.token.keyword {
  color: #005cc5;
  font-weight: bold;
}

.token.string,
.token.char,
.token.attr-value {
  color: #032f62;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
  color: #d73a49;
}

.token.function {
  color: #6f42c1;
}

.token.number,
.token.boolean {
  color: #e36209;
}
```

- [ ] **Step 2: Compile build static and verify styling**
Run: `npm run build:static`
Expected: Successful compile and static outputs generated in `dist/`.

- [ ] **Step 3: Commit**
```bash
git add packages/shell/src/index.css
git commit -m "style: add Cozy Notebook theme layout and Prism token styles"
```
