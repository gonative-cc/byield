import type { BitcoinNetworkType } from "sats-connect";
import { badRequest, notFound } from "../http-resp";
import type { QueryLockedBTCResp, Req } from "./jsonrpc";
import { mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { logError } from "~/lib/log";

interface Res {
	chain_stats: {
		funded_txo_sum: number;
		spent_txo_sum: number;
	};
}

const BTC_TO_SATOSHIS = 100000000;

export class ReserveController {
	btcRPCUrl: string | null = null;
	depositAddress: string | null = null;

	constructor(network: BitcoinNetworkType) {
		this.handleNetwork(network);
	}

	async queryLockedBTC(): Promise<QueryLockedBTCResp | Response> {
		try {
			if (!this.depositAddress) return badRequest();
			const url = this.btcRPCUrl + `/address/${this.depositAddress}`;
			const response = await fetch(url);
			const data: Res = await response.json();
			const totalLockedBTC =
				(data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) /
				BTC_TO_SATOSHIS; // Convert satoshis to BTC

			return {
				totalLockedBTC,
			};
		} catch (error) {
			logError({ msg: "Error fetching BTC reserves", method: "queryLockedBTC" }, error);
			throw error;
		}
	}

	private handleNetwork(network: BitcoinNetworkType) {
		const networkConfig = mustGetBitcoinConfig(network);
		this.btcRPCUrl = networkConfig?.btcRPCUrl || null;
		this.depositAddress = networkConfig.nBTC.depositAddress || null;
	}

	async handleJsonRPC(r: Request) {
		let reqData: Req;
		try {
			reqData = await r.json<Req>();
		} catch (_err) {
			logError(
				{ msg: "Expecting JSON Content-Type and JSON body", method: "handleJsonRPC" },
				_err,
			);
			return new Response("Expecting JSON Content-Type and JSON body", {
				status: 400,
			});
		}

		switch (reqData.method) {
			case "queryLockedBTC":
				return this.queryLockedBTC();
			default:
				return notFound("Unknown method");
		}
	}
}
