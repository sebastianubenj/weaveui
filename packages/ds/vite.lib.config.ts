import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const externalPackages = [
  "react",
  "react-dom",
  "@base-ui/react",
  "class-variance-authority",
  "clsx",
  "lucide-react",
  "tailwind-merge",
];

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  resolve: {
    alias: [
      { find: /^#\//, replacement: `${path.resolve(import.meta.dirname, "./src")}/` },
    ],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: path.resolve(import.meta.dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      external: (id) => externalPackages.some((name) => id === name || id.startsWith(`${name}/`)),
    },
  },
});
