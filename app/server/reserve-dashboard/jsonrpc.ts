import type { FetcherWithComponents } from "react-router";
import type { QueryLockedBTC, QueryLockedNCBTC } from "./types";
import type { BitcoinNetworkType } from "sats-connect";

export type Req =
	| {
			method: "queryLockedNBTC";
			// network,  graphql url, nBTC contractId,
			params: [BitcoinNetworkType, string, string];
	  }
	| {
			method: "queryLockedNCBTC";
			// network, graphql url
			params: [BitcoinNetworkType, string];
	  };

export async function makeReq<T>(
	fetcher: FetcherWithComponents<T>,
	req: Req,
): Promise<T | undefined> {
	await fetcher.submit(req, { method: "POST", encType: "application/json" });
	return fetcher.data;
}

export type QueryLockedNBTCResp = QueryLockedBTC | null;
export type QueryLockedNCBTCResp = QueryLockedNCBTC | null;
