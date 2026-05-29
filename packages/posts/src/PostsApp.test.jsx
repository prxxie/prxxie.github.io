import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostsApp from './PostsApp';
import { parsePost, renderMarkdown } from './utils/markdown';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

afterEach(() => {
  vi.restoreAllMocks();
});

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

describe('Markdown Utility functions', () => {
  it('parsePost correctly parses frontmatter and extracts raw markdown content', () => {
    const rawMarkdown = `---
title: "Custom Title"
date: "2026-05-30"
author: "alice"
---
This is standard text.`;
    const parsed = parsePost(rawMarkdown);
    expect(parsed.title).toBe('Custom Title');
    expect(parsed.date).toBe('2026-05-30');
    expect(parsed.author).toBe('alice');
    expect(parsed.content.trim()).toBe('This is standard text.');
  });

  it('renderMarkdown parses standard and rich markdown features including GFM', async () => {
    const html = await renderMarkdown('# Header\nThis is **bold** text.');
    expect(html).toContain('<h1>Header</h1>');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('renderMarkdown parses code blocks and applies syntax highlighting classes via PrismJS', async () => {
    const codeBlock = '```javascript\nconst a = 12;\n```';
    const html = await renderMarkdown(codeBlock);
    expect(html).toContain('<pre class="language-javascript">');
    expect(html).toContain('<code class="language-javascript">');
    expect(html).toContain('class="token keyword"'); // Prism keyword token class
  });
});

describe('PostsApp MFE Integration', () => {
  it('correctly integrates utility and renders markdown component on post click', async () => {
    const mockMarkdown = `---
title: "Integrated Test Post"
date: "2026-05-29"
author: "testauthor"
---
# Heading 1
This is a **bold** word.
`;

    render(<PostsApp />, { wrapper: createWrapper() });

    const postItem = screen.getByText(/Hello, Retro World!/i);
    expect(postItem).toBeInTheDocument();

    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockMarkdown),
    });

    fireEvent.click(postItem);

    await waitFor(() => {
      expect(screen.getByText('Integrated Test Post')).toBeInTheDocument();
    });
    expect(screen.getByText(/Date: 2026-05-29 | Author: testauthor/i)).toBeInTheDocument();

    // Verify markdown heading is parsed as an HTML heading
    const heading = screen.getByRole('heading', { level: 1, name: 'Heading 1' });
    expect(heading).toBeInTheDocument();

    // Verify bold text is rendered as strong element
    const boldWord = screen.getByText('bold');
    expect(boldWord.tagName.toLowerCase()).toBe('strong');
  });
});
