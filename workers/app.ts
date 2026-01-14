import { createRequestHandler } from "react-router";
import { BitcoinNetworkType } from "sats-connect";
import { mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { logError, logger } from "~/lib/log";
import { checkBotProtection } from "~/server/bot-protection.server";

async function handleSchedule(env: Env) {
	try {
		const { mempoolApiUrl: mainnetMempoolUrl } = mustGetBitcoinConfig(
			BitcoinNetworkType.Mainnet,
		);
		const { mempoolApiUrl: testnetMempoolUrl } = mustGetBitcoinConfig(
			BitcoinNetworkType.Testnet,
		);
		const [mainnetResponse, testnetResponse] = await Promise.all([
			fetch(`${mainnetMempoolUrl}/fees/recommended`),
			fetch(`${testnetMempoolUrl}/fees/recommended`),
		]);
		const mainnetFee = (await mainnetResponse.json<{ minimumFee: number }>()).minimumFee;
		const testnetFee = (await testnetResponse.json<{ minimumFee: number }>()).minimumFee;

		const stmt = env.BYieldD1.prepare(`
			INSERT INTO btc_network_fee (network, total_fee_sats, updated_at)
			VALUES (?, ?, CURRENT_TIMESTAMP)
			ON CONFLICT(network) DO UPDATE SET
				total_fee_sats = excluded.total_fee_sats,
				updated_at = CURRENT_TIMESTAMP
		`);

		await env.BYieldD1.batch([
			stmt.bind(BitcoinNetworkType.Mainnet, mainnetFee),
			stmt.bind(BitcoinNetworkType.Testnet, testnetFee),
		]);

		logger.debug({ msg: "Hourly batch sync successful" });
	} catch (err) {
		logError({ msg: "Hourly sync failed", method: "handleSchedule", error: err });
	}
}

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
	async scheduled(event, env, ctx) {
		// We use ctx.waitUntil so the worker stays alive
		// until the DB operation is fully committed.
		ctx.waitUntil(handleSchedule(env));
	},
} satisfies ExportedHandler<Env>;
