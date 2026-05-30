import { defineConfig, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import federation from "@originjs/vite-plugin-federation";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sirv from "sirv";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => {
  const isProd = command === "build";

  // Use /mfe/ path for both dev and prod
  // In dev: served from sibling package dist folders via sirv middleware
  // In prod: served from deployed static files
  const mfePath = "/mfe";
  const mfePackages = ["about", "posts", "pets", "shikaku", "sokoban"];

  return {
    publicDir: "../../public",
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: "shell",
        remotes: Object.fromEntries(
          mfePackages.map((name) => [
            name,
            `${mfePath}/${name}/assets/remoteEntry.js`,
          ])
        ),
        shared: ["react", "react-dom", "zustand", "@tanstack/react-query"],
      }),
      // Serve MFE dist folders in dev mode
      !isProd && {
        name: "serve-mfe-dist",
        configureServer(server: ViteDevServer) {
          // Mount each MFE's dist folder at /mfe/<name>
          for (const name of mfePackages) {
            const distPath = resolve(__dirname, "..", name, "dist");
            server.middlewares.use(`/mfe/${name}`, sirv(distPath, { dev: true }));
          }
        },
      },
    ].filter(Boolean),
    build: {
      target: "esnext",
      minify: false,
      cssCodeSplit: false,
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
    },
  };
});
