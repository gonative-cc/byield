import { isValidSuiAddress } from "@mysten/sui/utils";
import type { QueryMintTxResp, Req } from "./jsonrpc";
import type { BitcoinNetworkType } from "sats-connect";
import { mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";
import {
	badRequest,
	serverError,
	notFound,
	handleNonSuccessResp as handleFailResp,
	jsonHeader,
} from "../http-resp";
import { protectedBitcoinRPC } from "./btc-proxy.server";
import type { BtcIndexerRpc } from "./btc-indexer-rpc.types";
import { convertTxStatusToMintTx } from "./convert";
import { logger } from "~/lib/log";

export default class Controller {
	btcRPCUrl: string | null = null;
	btcindexer: BtcIndexerRpc | null = null;

	constructor(network: BitcoinNetworkType, indexerRpc?: BtcIndexerRpc) {
		this.handleNetwork(network);
		this.btcindexer = indexerRpc || null;
	}

	private async getMintTxs(suiAddr: string): Promise<QueryMintTxResp | Response> {
		const method = "nbtc:getMintTxs";
		if (!isValidSuiAddress(suiAddr)) {
			return badRequest();
		}
		if (!this.btcindexer) {
			return serverError(method, new Error("Indexer RPC not configured"));
		}
		try {
			const txStatuses = await this.btcindexer.statusBySuiAddress(suiAddr);
			const mintTxs = txStatuses.map(convertTxStatusToMintTx);
			return mintTxs;
		} catch (error) {
			return serverError(method, error);
		}
	}

	private async queryUTXOs(address: string) {
		const method = "nbtc:queryUTXOs";
		const path = `/address/${encodeURIComponent(address)}/utxo`;
		logger.debug({ msg: "Querying nBTCUTXOs", method, address, btcRPCUrl: this.btcRPCUrl });

		// URL is dummy
		const request = new Request("https://internal-proxy-auth", {
			headers: {
				Authorization: "Bearer btc-proxy-secret-2025",
				"CF-Connecting-IP": "127.0.0.1",
			},
		});

		const rpcResponse = await protectedBitcoinRPC(request, this.btcRPCUrl!, path);
		if (!rpcResponse.ok) {
			return handleFailResp(method, "Can't query Bitcoin UTXOs", rpcResponse);
		}
		return rpcResponse;
	}

	private handleNetwork(network: BitcoinNetworkType) {
		const networkConfig = mustGetBitcoinConfig(network);
		this.btcRPCUrl = networkConfig?.btcRPCUrl || null;
	}

	private async fetchTxHexByTxId(txId: string) {
		const method = "nbtc:fetchTxHexByTxId";
		try {
			const path = `/tx/${encodeURIComponent(txId)}/hex`;

			// URL is dummy
			const request = new Request("https://internal-proxy-auth", {
				headers: {
					Authorization: "Bearer btc-proxy-secret-2025",
					"CF-Connecting-IP": "127.0.0.1",
				},
			});

			const response = await protectedBitcoinRPC(request, this.btcRPCUrl!, path);
			if (!response.ok) {
				return handleFailResp(method, "Can't query Bitcoin Tx data", response);
			}
			return await response.text();
		} catch (error) {
			return serverError(method, error, "can't process Tx data");
		}
	}

	private async postNbtcTx(txId: string) {
		const method = "nbtc:postNbtcTx";
		if (!this.btcindexer) {
			return serverError(method, new Error("Indexer RPC not configured"));
		}
		try {
			const txHex = await this.fetchTxHexByTxId(txId);
			if (txHex instanceof Response) {
				return txHex;
			}
			if (!txHex) {
				throw new Error(`Error fetching tx hex: ${txId}`);
			}
			const result = await this.btcindexer.putNbtcTx(txHex);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: jsonHeader,
			});
		} catch (error) {
			return serverError(method, error);
		}
	}

	async handleJsonRPC(r: Request) {
		let reqData: Req;
		try {
			reqData = await r.json<Req>();
		} catch (_err) {
			logger.error({
				msg: "Expecting JSON Content-Type and JSON body",
				method: "nbtc:handleJsonRPC",
				error: _err,
			});
			return new Response("Expecting JSON Content-Type and JSON body", {
				status: 400,
			});
		}

		switch (reqData.method) {
			case "queryMintTx":
				return this.getMintTxs(reqData.params[1]);
			case "postNbtcTx":
				return this.postNbtcTx(reqData.params[1]);
			case "queryUTXOs":
				return this.queryUTXOs(reqData.params[1]);
			default:
				return notFound("Unknown method");
		}
	}
}
