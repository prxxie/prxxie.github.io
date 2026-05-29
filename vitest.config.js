import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      'about/AboutApp': path.resolve(__dirname, './packages/shell/src/components/MockMfe.jsx'),
      'posts/PostsApp': path.resolve(__dirname, './packages/shell/src/components/MockMfe.jsx'),
      'pets/PetsApp': path.resolve(__dirname, './packages/shell/src/components/MockMfe.jsx'),
    }
  }
});
