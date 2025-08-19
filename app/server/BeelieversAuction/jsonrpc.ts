import type { FetcherWithComponents } from "react-router";

export type Req =
	| {
			method: "login";
			// address, signature, message
			params: [string, string, string];
	  }
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
): Promise<T | undefined> {
	await fetcher.submit(req, { method: "POST", encType: "application/json" });
	return fetcher.data;
}
