import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true, // Enable global test APIs (describe, it, expect, etc.)
		// setting jsdom environment is needed for DOM-related tests. But it breaks test setup -
		// it throws assertion error when we try to setup Miniflare.
		environment: 'jsdom',
		setupFiles: './vitest.setup.ts',
		exclude: ['server'],
	},
	resolve: {
		alias: {
			'~': path.resolve(__dirname),
		},
	},
});
