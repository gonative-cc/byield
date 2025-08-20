import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		globals: true, // Enable global test APIs (describe, it, expect, etc.)
		environment: "node",
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "../"),
		},
	},
});
