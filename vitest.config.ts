import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		globals: true, // Enable global test APIs (describe, it, expect, etc.)
		environment: "jsdom", // Use jsdom for DOM-related tests
		setupFiles: "vitest.setup.ts", // Optional setup file for custom configuration
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "app"),
		},
	},
});
