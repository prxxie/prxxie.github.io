import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'shell',
      filename: 'remoteEntry.js',
      exposes: {
        './petStore': './src/store/petStore.js'
      },
      remotes: {
        about: 'http://localhost:3001/assets/remoteEntry.js',
        posts: 'http://localhost:3002/assets/remoteEntry.js',
        pets: 'http://localhost:3003/assets/remoteEntry.js'
      },
      shared: ['react', 'react-dom', 'zustand', '@tanstack/react-query']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});

