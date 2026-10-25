import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["@testing-library/jest-dom"],
  },
  resolve: {
    alias: {
      "about/AboutApp": path.resolve(
        __dirname,
        "./packages/shell/src/components/MockMfe.tsx"
      ),
      "posts/PostsApp": path.resolve(
        __dirname,
        "./packages/shell/src/components/MockMfe.tsx"
      ),
      "pets/PetsApp": path.resolve(
        __dirname,
        "./packages/shell/src/components/MockMfe.tsx"
      ),
      "shikaku/ShikakuApp": path.resolve(
        __dirname,
        "./packages/shell/src/components/MockMfe.tsx"
      ),
      "sokoban/SokobanApp": path.resolve(
        __dirname,
        "./packages/shell/src/components/MockMfe.tsx"
      ),
      "slitherlink/SlitherlinkApp": path.resolve(
        __dirname,
        "./packages/shell/src/components/MockMfe.tsx"
      ),
      "@devlog/content": path.resolve(
        __dirname,
        "./packages/posts/src/content/loadPosts.ts"
      ),
      "@devlog/markdown": path.resolve(
        __dirname,
        "./packages/posts/src/utils/markdown.ts"
      ),
      "shared": path.resolve(
        __dirname,
        "./packages/shared/src/index.ts"
      ),
    },
  },
});
