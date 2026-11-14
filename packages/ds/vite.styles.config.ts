import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [tailwindcss()],
  base: "./",
  publicDir: false,
  build: {
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        styles: path.resolve(import.meta.dirname, "src/styles/package.css"),
        preflight: path.resolve(import.meta.dirname, "src/styles/preflight.css"),
        preset: path.resolve(import.meta.dirname, "src/styles/preset.css"),
      },
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name?.endsWith(".css")
            ? "[name].css"
            : "assets/[name]-[hash][extname]",
      },
    },
  },
});
