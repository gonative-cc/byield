import { isValidSuiAddress } from "@mysten/sui/utils";
import {
	MintingStatus,
	type IndexerTransaction,
	type MintingTxStatus,
	type MintTransaction,
} from "./types";
import type { QueryMintTxResp, Req } from "./jsonrpc";
import { getBitcoinNetworkConfig } from "~/hooks/useBitcoinConfig";
import type { BitcoinNetworkType } from "sats-connect";

export default class Controller {
	indexerBaseUrl: string | null = null;

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

	private handleNetwork(network: BitcoinNetworkType) {
		const networkConfig = getBitcoinNetworkConfig[network];
		this.indexerBaseUrl = networkConfig?.variables?.indexerUrl || null;
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
