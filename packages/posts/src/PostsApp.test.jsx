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

    // Verify markdown heading is parsed as an HTML heading
    const heading = screen.getByRole('heading', { level: 1, name: 'Heading 1' });
    expect(heading).toBeInTheDocument();

    // Verify bold text is rendered as strong element
    const boldWord = screen.getByText('bold');
    expect(boldWord.tagName.toLowerCase()).toBe('strong');
  });
});
