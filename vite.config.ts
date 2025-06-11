import { defineConfig } from "vite";
import { vitePlugin as remix, cloudflareDevProxyVitePlugin } from "@remix-run/dev";
import tsconfigPaths from "vite-tsconfig-paths";
import { getLoadContext } from "./load-context";
import { nodePolyfills } from "vite-plugin-node-polyfills";

declare module "@remix-run/cloudflare" {
	interface Future {
		v3_singleFetch: true;
	}
}

export default defineConfig({
	plugins: [
		cloudflareDevProxyVitePlugin({
			getLoadContext,
		}),
		remix({
			future: {
				v3_fetcherPersist: true,
				v3_relativeSplatPath: true,
				v3_throwAbortReason: true,
				v3_singleFetch: true,
				v3_lazyRouteDiscovery: true,
			},
		}),
		tsconfigPaths(),
		nodePolyfills(),
	],
	ssr: {
		resolve: {
			conditions: ["workerd", "worker", "browser"],
		},
	},
	resolve: {
		mainFields: ["browser", "module", "main"],
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: () => "bundle.js",
			},
		},
	},
});
