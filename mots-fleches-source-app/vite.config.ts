/// <reference types="vitest" />
import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    globals: true,
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: "mots-fleches.js",
        chunkFileNames: "mots-fleches-[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) return "mots-fleches.css";
          return assetInfo.name ?? "asset";
        },
      },
    },
  },
});
