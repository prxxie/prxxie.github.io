import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'pets',
      filename: 'remoteEntry.js',
      remotes: {
        shell: 'http://localhost:3000/assets/remoteEntry.js'
      },
      exposes: {
        './PetsApp': './src/PetsApp.jsx'
      },
      shared: ['react', 'react-dom', 'zustand']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: './src/PetsApp.jsx'
    }
  }
});

