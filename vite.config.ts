import { sveltekit } from '@sveltejs/kit/vite';
import { kitRoutes } from 'vite-plugin-kit-routes';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    // @ts-expect-error - Ignoring because this is a vite issue?
    tailwindcss(),
    // @ts-expect-error - Ignoring because this is a vite issue?
    sveltekit(),
    // @ts-expect-error - Ignoring because this is a vite issue?
    Icons({
      compiler: 'svelte',
    }),
    // @ts-expect-error - Ignoring because this is a vite issue?
    kitRoutes(),
  ],

  server: {
    fs: {
      // TODO: See if I can filter it to only `posts`
      // Allow serving files from project root
      allow: ['..'],
    },
  },

  test: { include: ['src/**/*.{test,spec}.{js,ts}'] },
});
