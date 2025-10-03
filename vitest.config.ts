import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	test: {
		globals: true, // Enable global test APIs (describe, it, expect, etc.)
		projects: ['app/vitest.config.ts', 'app/server/vitest.config.ts', 'test/vitest.config.ts'],
	},
	resolve: {
		alias: {
			'~': path.resolve(__dirname, 'app'),
		},
	},
});
