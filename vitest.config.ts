import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    retry: 2,
    projects: [
      {
        // Client-side tests (Svelte components)
        extends: './vite.config.ts',
        test: {
          name: 'client',
          environment: 'browser',
          // Timeout for browser tests - prevent hanging on element lookups
          testTimeout: process.env.CI === 'true' ? 4000 : 2000,
          browser: {
            enabled: true,
            provider: 'playwright',
            // Multiple browser instances for better performance
            // Uses single Vite server with shared caching
            instances: [
              { browser: 'chromium' },
              // { browser: 'firefox' },
              // { browser: 'webkit' },
            ],
          },
          include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
          exclude: ['src/lib/server/**', 'src/**/*.ssr.{test,spec}.{js,ts}'],
          setupFiles: ['./src/vitest-setup.ts', './src/vitest-setup-client.ts'],
        },
      },
      {
        // SSR tests (Server-side rendering)
        extends: './vite.config.ts',
        test: {
          name: 'ssr',
          environment: 'node',
          include: ['src/**/*.ssr.{test,spec}.{js,ts}'],
          setupFiles: ['./src/vitest-setup.ts'],
        },
      },
      {
        // Server-side tests (Node.js utilities)
        extends: './vite.config.ts',
        test: {
          name: 'server',
          environment: 'node',
          include: ['src/**/*.{test,spec}.{js,ts}'],
          exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/**/*.ssr.{test,spec}.{js,ts}'],
          setupFiles: ['./src/vitest-setup.ts'],
        },
      },
    ],
  },
});
