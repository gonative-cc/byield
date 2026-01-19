import type { FetcherWithComponents } from "react-router";
import type { MintTransaction } from "./types";
import type { BitcoinNetworkType } from "sats-connect";
import type { RedeemRequestResp } from "@gonative-cc/sui-indexer/models";

export type Req =
	| {
			method: "queryMintTx";
			// network, sui address, bitcoin address
			params: [BitcoinNetworkType, string | null, string | null];
	  }
	| {
			method: "postNbtcTx";
			// network, tx id
			params: [BitcoinNetworkType, string];
	  }
	| {
			// query all UTXOs associate with a give address / spending key
			method: "queryUTXOs";
			// network, address
			params: [BitcoinNetworkType, string];
	  }
	| {
			method: "fetchRedeemTxs";
			// network, sui address, setup id
			params: [BitcoinNetworkType, string, number];
	  }
	| {
			method: "putRedeemTx";
			// network, setup id, tx id, redeem request event raw
			params: [BitcoinNetworkType, number, string, string];
	  };

export async function makeReq<T>(
	fetcher: FetcherWithComponents<T>,
	req: Req,
): Promise<T | undefined> {
	await fetcher.submit(req, { method: "POST", encType: "application/json" });
	return fetcher.data;
}

export type QueryMintTxResp = MintTransaction[];
export type QueryRedeemTxsResp = RedeemRequestResp[];
