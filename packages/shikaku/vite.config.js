import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ command }) => {
  return {
    base: command === 'build' ? '/mfe/shikaku/' : '/',
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'shikaku',
        filename: 'remoteEntry.js',
        exposes: {
          './ShikakuApp': './src/ShikakuApp.jsx'
        },
        shared: ['react', 'react-dom', 'zustand']
      })
    ],
    build: {
      target: 'esnext',
      minify: false,
      cssCodeSplit: false
    }
  };
});
