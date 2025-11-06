import type { FetcherWithComponents } from "react-router";
import type { QueryLockedBTC } from "./types";
import type { BitcoinNetworkType } from "sats-connect";

export type Req = {
	method: "queryLockedBTC";
	// network
	params: [BitcoinNetworkType];
};

export async function makeReq<T>(
	fetcher: FetcherWithComponents<T>,
	req: Req,
): Promise<T | undefined> {
	await fetcher.submit(req, { method: "POST", encType: "application/json" });
	return fetcher.data;
}

export type QueryLockedBTCResp = QueryLockedBTC | null;
