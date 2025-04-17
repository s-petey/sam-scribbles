import { sveltekit } from '@sveltejs/kit/vite';
import { kitRoutes } from 'vite-plugin-kit-routes';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import velite from '@velite/plugin-vite';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const veliteDir = path.resolve(__dirname, '.velite');

console.log('veliteDir: ', veliteDir);
export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), kitRoutes(), velite()],

  server: {
    fs: {
      // TODO: See if I can filter it to only `posts`
      // Allow serving files from project root
      allow: ['..'],
    },
  },

  resolve: {
    alias: {
      $velite: veliteDir,
    },
  },

  test: { include: ['src/**/*.{test,spec}.{js,ts}'] },
});
