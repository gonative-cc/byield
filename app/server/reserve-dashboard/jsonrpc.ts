import type { FetcherWithComponents } from "react-router";
import type { CBTCData } from "./types";
import type { BitcoinNetworkType } from "sats-connect";

export type Req = {
	method: "loadReservePage";
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

export type QueryLockedBTCResp = {
	totalLockedBTC: number;
	cBTCData: CBTCData[];
} | null;
