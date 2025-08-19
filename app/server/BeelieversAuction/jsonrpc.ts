/* eslint-disable @typescript-eslint/no-explicit-any */

import type { FetcherWithComponents } from "react-router";

export type Req =
	| {
			method: "queryUser";
			params: [string];
	  }
	| {
			method: "postBidTx";
			// suiTxId, bidder, amount, msg
			params: [string, string, number, string];
	  }
	| {
			method: "pageData";
			// suiTxId, bidder, amount, msg
			params: [string];
	  };

// TODO: this function should return result
export async function makeReq(fetcher: FetcherWithComponents<any>, req: Req) {
	return fetcher.submit(req, { method: "POST", encType: "application/json" });
}
