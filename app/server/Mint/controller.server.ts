import { isValidSuiAddress } from "@mysten/sui/utils";
import { type IndexerTransaction, type MintTransaction } from "./types";
import type { QueryMintTxResp, Req } from "./jsonrpc";
import type { BitcoinNetworkType } from "sats-connect";
import { mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { badRequest, serverError, notFound } from "../http-resp";

export default class Controller {
	indexerBaseUrl: string | null = null;
	btcRPCUrl: string | null = null;
	btcRPCAuthToken: string | null = null;

	private convertIndexerTransaction(tx: IndexerTransaction): MintTransaction {
		return {
			bitcoinTxId: tx.btc_tx_id,
			amountInSatoshi: tx.amount_sats,
			status: tx.status,
			suiAddress: tx.sui_recipient,
			suiTxId: tx.sui_tx_id,
			timestamp: tx.created_at,
			numberOfConfirmation: tx.confirmations,
			operationStartDate: tx.created_at,
			bitcoinExplorerUrl: tx.bitcoin_explorer_url,
			suiExplorerUrl: tx.sui_explorer_url,
			fees: tx.fees || 1000,
			errorMessage: tx.error_message,
		};
	}

	private async getMintTxs(suiAddr: string): Promise<QueryMintTxResp | Response> {
		if (!isValidSuiAddress(suiAddr)) {
			return badRequest();
		}
		try {
			const url = this.indexerBaseUrl + `/nbtc?sui_recipient=${suiAddr}`;
			const indexerResponse = await fetch(url);
			const data: IndexerTransaction[] = await indexerResponse.json();
			const mintTxs: MintTransaction[] = data.map((tx) => this.convertIndexerTransaction(tx));
			return mintTxs;
		} catch (error) {
			console.error({ msg: "Failed to fetch the mint txs", error, url: this.indexerBaseUrl });
			return serverError();
		}
	}

	private async queryUTXOsByAddr(address: string) {
		const rpcUrl = `${this.btcRPCUrl}/address/${encodeURIComponent(address!)}/utxo`;
		console.trace({ msg: "Querying UTXOs by address", rpcUrl, address });

		const headers: Record<string, string> = {
			"Content-Type": "application/json",
		};

		if (this.btcRPCAuthToken) {
			headers["Authorization"] = `Bearer ${this.btcRPCAuthToken}`;
		}

		const rpcResponse = await fetch(rpcUrl, { headers });
		if (!rpcResponse.ok) {
			console.error({
				msg: "Bitcoin RPC responded with error",
				status: rpcResponse.status,
				statusText: rpcResponse.statusText,
				rpcUrl,
				address,
			});
			return serverError(
				`Bitcoin RPC error: ${rpcResponse.status} ${rpcResponse.statusText}`,
			);
		}

		const data = await rpcResponse.json();
		console.debug({
			msg: "Fetched UTXOs",
			count: Array.isArray(data) ? data.length : undefined,
			address,
		});
		return Response.json(data);
	}

	private handleNetwork(network: BitcoinNetworkType) {
		const networkConfig = mustGetBitcoinConfig(network);
		this.indexerBaseUrl = networkConfig?.indexerUrl || null;
		this.btcRPCUrl = networkConfig?.btcRPCUrl || null;
		this.btcRPCAuthToken = networkConfig?.btcRPCAuthToken || null;
	}

	async handleJsonRPC(r: Request) {
		let reqData: Req;
		try {
			reqData = await r.json<Req>();
		} catch (_err) {
			console.error({ msg: "Expecting JSON Content-Type and JSON body", error: _err });
			return new Response("Expecting JSON Content-Type and JSON body", {
				status: 400,
			});
		}
		const network = reqData.params[0];
		this.handleNetwork(network);

		switch (reqData.method) {
			case "queryMintTx":
				return this.getMintTxs(reqData.params[1]);
			case "queryUTXOsByAddr":
				return this.queryUTXOsByAddr(reqData.params[1]);
			// TODO: implement putNBTCTx case and method for transaction submission to indexer)
			default:
				return notFound("Unknown method");
		}
	}
}
