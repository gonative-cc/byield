import type { AppLoadContext } from "react-router";
import { createRequestHandler } from "react-router";
import { checkBotProtection } from "~/server/bot-protection.server";

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
		const botCheck = checkBotProtection(request, false);

		if (!botCheck.allowed) {
			return new Response(JSON.stringify({ error: botCheck.reason }), {
				status: 403,
				headers: { "Content-Type": "application/json" },
			});
		}

		return requestHandler(request, {
			cloudflare: { env, ctx },
		});
	},
} satisfies ExportedHandler<Env>;
