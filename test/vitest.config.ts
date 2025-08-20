import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
	test: {
		globals: true, // Enable global test APIs (describe, it, expect, etc.)
		environment: "node",
		name: { label: "systest", color: "cyan" },
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
			"~": path.resolve(__dirname, "../app"),
		},
	},
});
