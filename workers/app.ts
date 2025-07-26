import { createRequestHandler } from "react-router";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

/* eslint-disable */
const requestHandler = createRequestHandler(
	// eslint-disable-next-line
	() => import("virtual:react-router/server-build"), // @ts-ignore
	import.meta.env.MODE,
);
/* eslint-enable */

export default {
	async fetch(request, env, ctx) {
		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},
} satisfies ExportedHandler<Env>;
