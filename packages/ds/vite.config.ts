/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: { include: ['@base-ui/react/navigation-menu'] },
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${path.resolve(import.meta.dirname, './src')}/` },
      { find: /^#\//, replacement: `${path.resolve(import.meta.dirname, './src')}/` },
    ],
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(import.meta.dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }, {
      extends: true,
      test: {
        // Behavior that needs a browser condition a story cannot change: viewport size and
        // media preferences such as reduced motion.
        name: 'browser',
        include: ['src/**/*.browser.test.tsx'],
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }],
          commands: {
              pointerAt: async (context, selector: string, action: "move" | "click", dx = 0, dy = 0) => {
                for (const frame of context.page.frames()) {
                  const locator = frame.locator(selector).first();
                  if (!(await locator.count())) continue;
                  const box = await locator.boundingBox();
                  if (!box) throw new Error(`Element is not visible: ${selector}`);
                  const x = box.x + box.width / 2 + dx;
                  const y = box.y + box.height / 2 + dy;
                  if (action === "click") await context.page.mouse.click(x, y);
                  else await context.page.mouse.move(x, y);
                  return;
                }
                throw new Error(`Element not found: ${selector}`);
              },
            emulateReducedMotion: async (context, value: 'reduce' | 'no-preference') => {
              await context.page.emulateMedia({ reducedMotion: value });
            }
          }
        }
      }
    }]
  }
});
