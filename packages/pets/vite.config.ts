import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ command }) => {
  return {
    base: command === "build" ? "/mfe/pets/" : "/",
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: "pets",
        filename: "remoteEntry.js",
        exposes: {
          "./PetsApp": "./src/PetsApp.tsx",
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
