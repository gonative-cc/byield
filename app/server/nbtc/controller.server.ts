import { isValidSuiAddress } from "@mysten/sui/utils";
import { BitcoinNetworkType } from "sats-connect";
import type { NbtcTxResp } from "@gonative-cc/btcindexer/models";
import type { BtcIndexerRpc } from "@gonative-cc/btcindexer/rpc-interface";
import type { SuiIndexerRpc } from "@gonative-cc/sui-indexer/rpc-interface";
import type { RedeemRequestEventRaw } from "@gonative-cc/sui-indexer/models";
import type { QueryMintTxResp, QueryRedeemTxsResp, Req } from "./jsonrpc";
import { mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";
import {
	serverError,
	notFound,
	handleNonSuccessResp as handleFailResp,
	jsonHeader,
	badRequest,
	textOK,
} from "../http-resp";
import { protectedBitcoinRPC } from "./btc-proxy.server";
import { BitcoinNetworkTypeMap, nbtcMintTxRespToMintTx } from "./convert";
import { logError, logger } from "~/lib/log";
import { ParamsDB } from "~/db/paramsDB";

function validateRedeemRequestEventRaw(data: RedeemRequestEventRaw) {
	return (
		typeof data === "object" &&
		data !== null &&
		typeof data.redeem_id === "string" &&
		typeof data.redeemer === "string" &&
		typeof data.amount === "string" &&
		typeof data.created_at === "string"
	);
}

function validateFee(minimumFee: number): boolean {
	return Number.isFinite(minimumFee) && minimumFee > 0;
}

export default class Controller {
	btcRPCUrl: string;
	btcindexer: BtcIndexerRpc;
	suiIndexer: SuiIndexerRpc;
	network: BitcoinNetworkType;
	paramsDB: ParamsDB;

	constructor(
		network: BitcoinNetworkType,
		indexerRpc: BtcIndexerRpc,
		suiIndexer: SuiIndexerRpc,
		db: D1Database,
	) {
		this.btcindexer = indexerRpc;
		this.network = network;
		const networkConfig = mustGetBitcoinConfig(network);
		this.btcRPCUrl = networkConfig.btcRPCUrl;
		this.suiIndexer = suiIndexer;
		this.paramsDB = new ParamsDB(db);
	}

	private async getMintTxs(
		btcAddr: string | null,
		suiAddr: string | null,
	): Promise<QueryMintTxResp | Response> {
		const method = "nbtc:getMintTxs";
		if (!this.btcindexer) {
			return serverError(method, new Error("Indexer RPC not configured"));
		}
		if (!btcAddr && !suiAddr) return badRequest();

		const fetchPromises: Promise<NbtcTxResp[]>[] = [];
		if (suiAddr && isValidSuiAddress(suiAddr)) {
			fetchPromises.push(this.btcindexer.nbtcMintTxsBySuiAddr(suiAddr));
		}
		if (btcAddr) {
			fetchPromises.push(
				this.btcindexer.depositsBySender(btcAddr, BitcoinNetworkTypeMap[this.network]),
			);
		}

		if (fetchPromises.length === 0) return badRequest();

		try {
			const results = await Promise.all(fetchPromises);
			const rawMints = results.flat();
			return rawMints.map(nbtcMintTxRespToMintTx);
		} catch (error) {
			return serverError(method, error);
		}
	}

	private async queryUTXOs(address: string): Promise<Response> {
		const method = "nbtc:queryUTXOs";
		const path = `/address/${encodeURIComponent(address)}/utxo`;
		logger.debug({ msg: "Querying nBTC UTXOs", method, address, btcRPCUrl: this.btcRPCUrl });

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
			const result = await this.btcindexer.putNbtcTx(
				txHex,
				BitcoinNetworkTypeMap[this.network],
			);
			return new Response(JSON.stringify(result), {
				status: 200,
				headers: jsonHeader,
			});
		} catch (error) {
			return serverError(method, error);
		}
	}

	private async queryRedeemTxs(
		_suiAddr: string,
		_setupId: number,
	): Promise<QueryRedeemTxsResp | Response> {
		const method = "nbtc:queryRedeemTxs";
		try {
			const redeemTxs = await this.suiIndexer.redeemsBySuiAddr(_setupId, _suiAddr);
			return redeemTxs;
		} catch (error) {
			return serverError(method, error, "can't process redeem Txs data");
		}
	}

	async putRedeemTx(setupId: number, txId: string, e: string): Promise<Response> {
		const method = "nbtc:putRedeemTx";
		if (typeof setupId !== "number" || setupId < 0 || !txId || !e) return badRequest();
		try {
			const event = JSON.parse(e) as RedeemRequestEventRaw;
			if (!validateRedeemRequestEventRaw(event))
				return badRequest("Invalid redeem event format");
			await this.suiIndexer.putRedeemTx(setupId, txId, event);
			return textOK("Redeem event saved successfully");
		} catch (error) {
			logError({ msg: "Error putting redeem tx", method, error });
			return serverError(method, error);
		}
	}

	private async queryBitcoinFee(setupId: number): Promise<number | Response> {
		const method = "nbtc:queryBitcoinFee";
		try {
			if (!this.network) return badRequest("Please provide network");
			// return miner fee directly in case user is on regtest network
			if (this.network === BitcoinNetworkType.Regtest) return 1;
			if (typeof setupId !== "number" || setupId < 0)
				return badRequest("Please provide the setup id");

			const value = await this.paramsDB.getRecommendedBitcoinFee(setupId);

			if (!value) {
				logger.debug({
					msg: "No network fee found",
					method,
					setupId,
				});
				return textOK(`No network fee found for the given setupId: ${setupId}`);
			}
			if (!validateFee(value)) return textOK("Recommended fee not found");
			return value;
		} catch (error) {
			logError({ msg: "Error getting network fee", method, error });
			return serverError(method, error);
		}
	}

	async handleJsonRPC(r: Request) {
		let reqData: Req;
		try {
			reqData = await r.json<Req>();
		} catch (_err) {
			logError(
				{
					msg: "Expecting JSON Content-Type and JSON body",
					method: "nbtc:handleJsonRPC",
				},
				_err,
			);
			return new Response("Expecting JSON Content-Type and JSON body", {
				status: 400,
			});
		}

		switch (reqData.method) {
			case "queryMintTx":
				return this.getMintTxs(reqData.params[1], reqData.params[2]);
			case "postNbtcTx":
				return this.postNbtcTx(reqData.params[1]);
			case "queryUTXOs":
				return this.queryUTXOs(reqData.params[1]);
			case "fetchRedeemTxs":
				return this.queryRedeemTxs(reqData.params[1], reqData.params[2]);
			case "putRedeemTx":
				return this.putRedeemTx(reqData.params[1], reqData.params[2], reqData.params[3]);
			case "queryBitcoinFee":
				return this.queryBitcoinFee(reqData.params[1]);
			default:
				return notFound("Unknown method");
		}
	}
}
