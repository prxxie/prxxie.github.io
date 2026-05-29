import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ command }) => {
  const isProd = command === 'build';
  const aboutUrl = isProd
    ? '/mfe/about/assets/remoteEntry.js'
    : 'http://localhost:3001/assets/remoteEntry.js';
  const postsUrl = isProd
    ? '/mfe/posts/assets/remoteEntry.js'
    : 'http://localhost:3002/assets/remoteEntry.js';
  const petsUrl = isProd
    ? '/mfe/pets/assets/remoteEntry.js'
    : 'http://localhost:3003/assets/remoteEntry.js';
  const shikakuUrl = isProd
    ? '/mfe/shikaku/assets/remoteEntry.js'
    : 'http://localhost:3004/assets/remoteEntry.js';

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
          pets: petsUrl,
          shikaku: shikakuUrl
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
