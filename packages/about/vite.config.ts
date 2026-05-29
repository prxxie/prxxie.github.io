import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig(({ command }) => {
  return {
    base: command === "build" ? "/mfe/about/" : "/",
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: "about",
        filename: "remoteEntry.js",
        exposes: {
          "./AboutApp": "./src/AboutApp.tsx",
        },
        shared: ["react", "react-dom"],
      }),
    ],
    build: {
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
  };
});
