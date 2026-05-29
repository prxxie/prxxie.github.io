import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
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
    },
  },
});
