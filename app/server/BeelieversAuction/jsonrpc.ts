import type { FetcherWithComponents } from "react-router";
import type { Raffle, User } from "./types";

// TODO: make response types
// TODO: maybe we should extend this by adding network as the top level param?
export type Req =
	| {
			method: "queryUser";
			params: [string];
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
	  }
	| {
			method: "queryRaffle";
			params: [];
	  };

export async function makeReq<T>(
	fetcher: FetcherWithComponents<T>,
	req: Req,
): Promise<T | undefined> {
	await fetcher.submit(req, { method: "POST", encType: "application/json" });
	return fetcher.data;
}

export type QueryUserResp = User | null;

export interface RaffleResp_ {
	winners: Raffle[];
	// total amount in MIST (TODO: need to convert to USD)
	totalAmount: number;
}

export type QueryRaffleResp = RaffleResp_ | null;
