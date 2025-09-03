import { reactRouter } from "@react-router/dev/vite";
import { cloudflareDevProxy } from "@react-router/dev/vite/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
	plugins: [
		tailwindcss(),
		cloudflareDevProxy(),
		reactRouter(),
		tsconfigPaths(),
		nodePolyfills({
			globals: {
				Buffer: true,
			},
		}),
	],
	build: {
		minify: true,
	},
});
