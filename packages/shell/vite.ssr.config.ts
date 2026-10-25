import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The build-time renderer for `scripts/prerender.mjs` (US-SITE-003). It carries no
 * federation plugin: the build renders placeholders where the remote boards go, and
 * a remote import is aliased to a stub so the bundle can be produced offline.
 */
export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      "shared": path.resolve(__dirname, "../shared/src/index.ts"),
      "shikaku/ShikakuApp": path.resolve(__dirname, "src/screens/game/RemoteStub.tsx"),
      "sokoban/SokobanApp": path.resolve(__dirname, "src/screens/game/RemoteStub.tsx"),
      "slitherlink/SlitherlinkApp": path.resolve(__dirname, "src/screens/game/RemoteStub.tsx"),
      "posts/PostsApp": path.resolve(__dirname, "../posts/src/PostsApp.tsx"),
      "@devlog/content": path.resolve(__dirname, "../posts/src/content/loadPosts.ts"),
      "@devlog/markdown": path.resolve(__dirname, "../posts/src/utils/markdown.ts"),
      "pets/PetsApp": path.resolve(__dirname, "src/screens/game/RemoteStub.tsx"),
      "about/AboutApp": path.resolve(__dirname, "src/screens/game/RemoteStub.tsx"),
    },
  },
  ssr: { noExternal: ["shared"] },
  build: {
    ssr: "src/entry-server.tsx",
    outDir: ".prerender",
    emptyOutDir: true,
    rollupOptions: { output: { format: "es", entryFileNames: "entry-server.js" } },
  },
});
