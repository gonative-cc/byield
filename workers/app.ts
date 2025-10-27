import type { AppLoadContext } from "react-router";
import { createRequestHandler } from "react-router";
import type { Env } from "../worker-configuration";

declare module "react-router" {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},
} satisfies ExportedHandler<Env>;
