import { isValidSuiAddress } from "@mysten/sui/utils";
import { type IndexerTransaction, type MintTransaction } from "./types";
import type { QueryMintTxResp, Req } from "./jsonrpc";
import type { BitcoinNetworkType } from "sats-connect";
import { mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { badRequest, serverError, notFound } from "../http-resp";

export default class Controller {
	btcRPCUrl: string | null = null;
	indexerBaseUrl: string | null = null;

	constructor(network: BitcoinNetworkType) {
		this.handleNetwork(network);
	}

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
			console.error("Failed to fetch the mint txs: ", error);
			return serverError();
		}
	}

	private handleNetwork(network: BitcoinNetworkType) {
		const networkConfig = mustGetBitcoinConfig(network);
		this.indexerBaseUrl = networkConfig?.indexerUrl || null;
		this.btcRPCUrl = networkConfig?.btcRPCUrl || null;
	}

	private async fetchTxHexByTxId(txId: string) {
		try {
			const url = this.btcRPCUrl + `/tx/${txId}/hex`;
			const response = await fetch(url);
			if (!response.ok) {
				if (response.status === 404) {
					return notFound();
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return await response.text();
		} catch (error) {
			console.error({ msg: "Error fetching tx hex:", error });
			return serverError();
		}
	}

	private async postNBTCTx(txId: string) {
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
					return notFound();
				}
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			return response;
		} catch (error) {
			console.error({ msg: "Error posting tx hex:", error });
			return serverError();
		}
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

		switch (reqData.method) {
			case "queryMintTx":
				return this.getMintTxs(reqData.params[1]);
			case "postNBTCTx":
				return this.postNBTCTx(reqData.params[1]);
			default:
				return notFound("Unknown method");
		}
	}
}
