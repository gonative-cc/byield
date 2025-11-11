import type { BitcoinNetworkType } from "sats-connect";
import { notFound, serverError } from "../http-resp";
import type { QueryLockedBTCResp, Req } from "./jsonrpc";
import { mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";
import type { BtcIndexerRpc } from "../nbtc/btc-indexer-rpc.types";
import { logError } from "~/lib/log";
import type { CBTCData } from "./types";

export class ReserveController {
	btcRPCUrl: string | null = null;
	depositAddress: string | null = null;
	d1: D1Database;
	network: BitcoinNetworkType;
	indexerRpc: BtcIndexerRpc | null = null;

	constructor(network: BitcoinNetworkType, d1: D1Database, indexerRpc?: BtcIndexerRpc) {
		this.d1 = d1;
		this.network = network;
		this.indexerRpc = indexerRpc || null;
		this.handleNetwork(network);
	}

	async loadReservePage(): Promise<QueryLockedBTCResp | Response> {
		try {
			const totalLockedBTC = await this.indexerRpc?.lockedBTCDeposit();
			if (totalLockedBTC === undefined || totalLockedBTC === null) {
				throw Error("Failed to get locked BTC");
			}
			const cBTCData: CBTCData[] | Response = await this.queryCBTCData();
			if (cBTCData instanceof Response) throw Error("Failed to get cBTC data");
			return {
				totalLockedBTC,
				cBTCData,
			};
		} catch (error) {
			return serverError("reserver-dashboard:loadReservePage", error);
		}
	}

	async queryCBTCData(): Promise<CBTCData[] | Response> {
		try {
			const query = `SELECT * from cbtc where network = ?`;
			const result = await this.d1.prepare(query).bind(this.network).all<CBTCData>();
			console.log(result);
			if (result.error) {
				throw Error(result.error);
			}
			return result.results;
		} catch (error) {
			return serverError("reserver-dashboard:queryCBTCData", error);
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
			case "loadReservePage":
				return this.loadReservePage();
			default:
				return notFound("Unknown method");
		}
	}
}
