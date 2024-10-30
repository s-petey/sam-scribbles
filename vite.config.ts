import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],

	server: {
		fs: {
			// TODO: See if I can filter it to only `posts`
			// Allow serving files from project root
			allow: ['..']
		}
	},

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
