import type { BitcoinNetworkType } from "sats-connect";
import { badRequest, handleNonSuccessResp, notFound } from "../http-resp";
import type { QueryLockedBTCResp, Req } from "./jsonrpc";
import type { CBTCData } from "./types";
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
	d1: D1Database;
	network: BitcoinNetworkType;

	constructor(network: BitcoinNetworkType, d1: D1Database) {
		this.d1 = d1;
		this.network = network;
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

			// TODO: query cBTC data using package id and object id
			const cBTCData = await this.queryCBTCData();
			if (cBTCData instanceof Response) return cBTCData;
			return {
				totalLockedBTC,
				CBTCData: cBTCData,
			};
		} catch (error) {
			logError({ msg: "Error fetching BTC reserves", method: "queryLockedBTC" }, error);
			throw error;
		}
	}

	async queryCBTCData(): Promise<CBTCData[] | Response> {
		try {
			const query =
				"SELECT network, name, btc_addr, cbtc_pkg, cbtc_obj, note FROM cbtc WHERE network = ?";
			const result = await this.d1.prepare(query).bind(this.network).all<CBTCData>();
			console.log(result);
			if (result.error) {
				return handleNonSuccessResp("queryCBTCData", "Can't query cBTC data", result.error);
			}
			return result.results;
		} catch (error) {
			console.error("Error fetching cBTC data:", error);
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
