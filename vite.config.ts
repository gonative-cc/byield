import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		reactRouter(),
		tailwindcss(),
		tsconfigPaths(),
	],
	build: {
		minify: true,
	},
	// Removed NodeGlobalsPolyfillPlugin since bitcoinjs-lib now uses dynamic imports
	// This prevents global scope pollution during SSR
});
