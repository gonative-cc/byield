import type { FetcherWithComponents } from "react-router";
import type { SuiNet } from "~/config/sui/networks";

// TODO: make response types
export type Req =
	| {
			method: "queryUser";
			params: [string];
	  }
	| {
			method: "queryAuctionDetails";
			params: [];
	  }
	| {
			method: "postBidTx";
			// address, base64 tx bytes, signature, user message
			params: [string, string, string, string];
	  }
	| {
			method: "pageData";
			// suiTxId, bidder, amount, msg
			params: [string];
	  };

export async function makeReq<T>(
	fetcher: FetcherWithComponents<T>,
	req: Req,
	suiNet: SuiNet,
): Promise<T | undefined> {
	const body = {
		...req,
		suiNet: suiNet,
	};
	await fetcher.submit(body, {
		method: "POST",
		encType: "application/json",
	});

	return fetcher.data;
}
