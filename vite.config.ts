import { sveltekit } from '@sveltejs/kit/vite';
import { kitRoutes } from 'vite-plugin-kit-routes';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    tailwindcss(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    sveltekit(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Icons({
      compiler: 'svelte',
    }),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
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
