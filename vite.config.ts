import { nodePolyfills } from "vite-plugin-node-polyfills";
import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths(), nodePolyfills(), cloudflare()],
	ssr: {
		resolve: {
			conditions: ["workerd", "worker", "browser"],
		},
	},
	resolve: {
		mainFields: ["browser", "module", "main"],
	},
	build: {
		minify: true,
	},
});
