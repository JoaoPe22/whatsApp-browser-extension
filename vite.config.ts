import { defineConfig } from "vite";
import { resolve } from "node:path";

const rootDir = __dirname;

const config = defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(rootDir, "src/popup/popup.html"),
        background: resolve(rootDir, "src/background/service-worker.ts"),
        content: resolve(rootDir, "src/content/content.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});

export default config;
