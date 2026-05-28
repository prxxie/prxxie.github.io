import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock dynamic federated imports so Vitest doesn't fail resolving them
vi.mock('about/AboutApp', () => ({
  default: () => <div>Mocked About App</div>
}));
vi.mock('posts/PostsApp', () => ({
  default: () => <div>Mocked Posts App</div>
}));
vi.mock('pets/PetsApp', () => ({
  default: () => <div>Mocked Pets App</div>
}));

import App from './App';

describe('Shell Host App', () => {
  it('renders welcoming header text', () => {
    render(<App />);
    expect(screen.getByText('WELCOME HOME')).toBeDefined();
  });
});
