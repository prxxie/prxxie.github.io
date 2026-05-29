import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ command }) => {
  return {
    base: command === "build" ? "/mfe/sokoban/" : "/",
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: "sokoban",
        filename: "remoteEntry.js",
        exposes: {
          "./SokobanApp": "./src/SokobanApp.tsx",
        },
        shared: ["react", "react-dom", "zustand"],
      }),
    ],
    build: {
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
  };
});
