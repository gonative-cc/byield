import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		globals: true, // Enable global test APIs (describe, it, expect, etc.)
		// setting jsdom environment is needed for DOM-related tests. But it breaks test setup -
		// it throws assertion error when we try to setup Miniflare.
		// environment: "jsdom",
		setupFiles: "app/vitest.setup.ts",
		poolOptions: {
			workers: {
				wrangler: { configPath: "./wrangler.jsonc" },
			},
			// we can add more bindings, see https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/
			// miniflare: {
			// 	d1Databases: { DBTest: "TestAuctionDB" },
			// 	d1Persist: false,
			// },
		},
	},
	resolve: {
		alias: {
			"~": path.resolve(__dirname, "app"),
		},
	},
});
