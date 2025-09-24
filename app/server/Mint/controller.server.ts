import { isValidSuiAddress } from "@mysten/sui/utils";
import {
	MintingStatus,
	type IndexerTransaction,
	type MintingTxStatus,
	type MintTransaction,
} from "./types";
import type { QueryMintTxResp, Req } from "./jsonrpc";
import { BitcoinNetworkType } from "sats-connect";
import { bitcoinConfigs, mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";

export default class Controller {
	btcRPCUrl: string | null = null;
	indexerBaseUrl: string | null = null;

	private handleNetwork(network: BitcoinNetworkType) {
		const networkConfig = bitcoinConfigs[network];
		this.indexerBaseUrl = networkConfig?.indexerUrl || null;
		this.btcRPCUrl = networkConfig?.btcRPCUrl || null;
	}

	private mapIndexerStatus(status: string): MintingTxStatus {
		switch (status?.toLowerCase()) {
			case "confirming":
				return MintingStatus.Confirming;
			case "finalized":
				return MintingStatus.Finalized;
			case "minted":
				return MintingStatus.Minted;
			case "failed":
				return MintingStatus.Failed;
			case "reorg":
				return MintingStatus.Reorg;
			default:
				return MintingStatus.Unknown;
		}
	}

	private convertIndexerTransaction(tx: IndexerTransaction): MintTransaction {
		return {
			bitcoinTxId: tx.btc_tx_id,
			amountInSatoshi: tx.amount_sats,
			status: this.mapIndexerStatus(tx.status),
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
			return responseBadRequest();
		}
		try {
			const url = this.indexerBaseUrl + `/nbtc?sui_recipient=${suiAddr}`;
			const indexerResponse = await fetch(url);
			const data: IndexerTransaction[] = await indexerResponse.json();
			const mintTxs: MintTransaction[] = data.map((tx) => this.convertIndexerTransaction(tx));
			return mintTxs;
		} catch (error) {
			console.error("Failed to fetch the mint txs: ", error);
			return responseServerError();
		}
	}

	private async fetchTxHexByTxId(txId: string) {
		try {
			const url = this.btcRPCUrl + `/tx/${txId}/hex`;
			const response = await fetch(url);
			if (!response.ok) {
				if (response.status === 404) {
					return responseNotFound();
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.text();
		} catch (error) {
			console.error("Error fetching tx hex:", error);
			return responseServerError();
		}
	}

	private async putNBTCTX(txId: string) {
		try {
			const txHex = await this.fetchTxHexByTxId(txId);
			if (!txHex) {
				throw new Error(`Error fetching tx hex: ${txId}`);
			}
			const url = this.indexerBaseUrl + `/nbtc`;
			const response = await fetch(url, {
				method: "POST",
				body: JSON.stringify({
					txHex,
				}),
			});
			if (!response.ok) {
				if (response.status === 404) {
					return responseNotFound();
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response;
		} catch (error) {
			console.error("Error posting tx hex:", error);
			return responseServerError();
		}
	}

	private async handleBitcoinServiceRPC(address: string) {
		const rpcUrl = `${this.btcRPCUrl}/address/${encodeURIComponent(address!)}/utxo`;
		console.log("rpcUrl", rpcUrl);
		const rpcResponse = await fetch(rpcUrl);
		console.log("rpcResponse", rpcResponse);
		if (!rpcResponse.ok) {
			console.error(
				"Bitcoin RPC responded with error:",
				rpcResponse.status,
				rpcResponse.statusText,
			);
			return responseServerError(
				`Bitcoin RPC error: ${rpcResponse.status} ${rpcResponse.statusText}`,
			);
		}

		const data = await rpcResponse.json();
		console.log("data", data);
		return Response.json(data);
	}

	async handleJsonRPC(r: Request) {
		let reqData: Req;
		try {
			reqData = await r.json<Req>();
		} catch (_err) {
			console.log(">>>>> Expected JSON content type:", _err);
			return new Response("Expecting JSON Content-Type and JSON body", {
				status: 400,
			});
		}
		const network = reqData.params[0];
		this.handleNetwork(network);
		switch (reqData.method) {
			case "queryMintTx":
				return this.getMintTxs(reqData.params[1]);
			case "putNBTCTx":
				return this.putNBTCTX(reqData.params[1]);
			case "bitcoinService":
				return this.handleBitcoinServiceRPC(reqData.params[1]);
			default:
				return responseNotFound("Unknown method");
		}
	}
}

function responseBadRequest(msg: string = "Bad Request"): Response {
	return new Response(msg, { status: 400 });
}

function responseNotFound(msg: string = "Not Found"): Response {
	return new Response(msg, { status: 404 });
}

function responseServerError(msg: string = "Server Error"): Response {
	return new Response(msg, { status: 500 });
}
