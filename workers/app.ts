import { createRequestHandler } from "react-router";
import { BitcoinNetworkType } from "sats-connect";
import { mainnetCfg, testnetCfg } from "~/config/sui/contracts-config";
import { mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { logError, logger } from "~/lib/log";
import { checkBotProtection } from "~/server/bot-protection.server";
import { RECOMMENDED_FEE_KEY } from "./constants";

async function handleSchedule(env: Env) {
	try {
		const {
			nbtc: { setupId: mainnetSetupId },
		} = mainnetCfg;
		const {
			nbtc: { setupId: testnetSetupId },
		} = testnetCfg;

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

		const mainnetcfg = JSON.stringify({
			minimumFee: mainnetFee,
			updatedAt: new Date().toISOString(),
		});
		const testnetcfg = JSON.stringify({
			minimumFee: testnetFee,
			updatedAt: new Date().toISOString(),
		});

		const stmt = env.BYieldD1.prepare(`
            INSERT INTO params (setup_id, name, value)
            VALUES (?, ?, ?)
			ON CONFLICT(setup_id, name) DO UPDATE SET
                value = excluded.value;
        `);

		await env.BYieldD1.batch([
			stmt.bind(mainnetSetupId, RECOMMENDED_FEE_KEY, mainnetcfg),
			stmt.bind(testnetSetupId, RECOMMENDED_FEE_KEY, testnetcfg),
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
