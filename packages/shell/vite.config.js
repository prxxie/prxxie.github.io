import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ command }) => {
  const isProd = command === 'build';
  const aboutUrl = isProd
    ? 'https://prxxie.github.io/mfe/about/assets/remoteEntry.js'
    : 'http://localhost:3001/assets/remoteEntry.js';
  const postsUrl = isProd
    ? 'https://prxxie.github.io/mfe/posts/assets/remoteEntry.js'
    : 'http://localhost:3002/assets/remoteEntry.js';
  const petsUrl = isProd
    ? 'https://prxxie.github.io/mfe/pets/assets/remoteEntry.js'
    : 'http://localhost:3003/assets/remoteEntry.js';

  return {
    publicDir: '../../public',
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'shell',
        remotes: {
          about: aboutUrl,
          posts: postsUrl,
          pets: petsUrl
        },
        shared: ['react', 'react-dom', 'zustand', '@tanstack/react-query']
      })
    ],
    build: {
      target: 'esnext',
      minify: false,
      cssCodeSplit: false
    }
  };
});
