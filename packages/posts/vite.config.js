import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ command }) => {
  return {
    base: command === 'build' ? '/mfe/posts/' : '/',
    publicDir: '../../public',
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'posts',
        filename: 'remoteEntry.js',
        exposes: {
          './PostsApp': './src/PostsApp.jsx'
        },
        shared: ['react', 'react-dom', '@tanstack/react-query']
      })
    ],
    build: {
      target: 'esnext',
      minify: false,
      cssCodeSplit: false
    }
  };
});
