/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: { include: ["react-router-dom"] },
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${path.resolve(import.meta.dirname, "./src")}/` },
    ],
  },
  server: {
    fs: {
      allow: [path.resolve(import.meta.dirname, "../..")],
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["src/lib/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(import.meta.dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        extends: true,
        test: {
          name: "browser",
          include: ["src/**/*.browser.test.tsx"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: "chromium" }],
            commands: {
              emulateReducedMotion: async (context, value: "reduce" | "no-preference") => {
                await context.page.emulateMedia({ reducedMotion: value });
              },
            },
          },
        },
      },
    ],
  },
});
