import type { FetcherWithComponents } from "react-router";
import type { MintTransaction } from "./types";
import type { BitcoinNetworkType } from "sats-connect";

export type Req =
	| {
			method: "queryMintTx";
			// network, sui address
			params: [BitcoinNetworkType, string];
	  }
	| {
			method: "postNBTCTx";
			// network, tx id
			params: [BitcoinNetworkType, string];
	  }
	| {
			// query all UTXOs associate with a give address / spending key
			method: "queryUTXOs";
			// network, address
			params: [BitcoinNetworkType, string];
	  };

export async function makeReq<T>(
	fetcher: FetcherWithComponents<T>,
	req: Req,
): Promise<T | undefined> {
	await fetcher.submit(req, { method: "POST", encType: "application/json" });
	return fetcher.data;
}

export type QueryMintTxResp = MintTransaction[] | null;
