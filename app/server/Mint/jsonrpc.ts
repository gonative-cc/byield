import type { FetcherWithComponents } from "react-router";
import type { MintTransaction } from "./types";

export type Req = {
	method: "queryMintTx";
	params: [string];
};

export async function makeReq<T>(
	fetcher: FetcherWithComponents<T>,
	req: Req,
): Promise<T | undefined> {
	await fetcher.submit(req, { method: "POST", encType: "application/json" });
	return fetcher.data;
}

export type QueryMintTxResp = MintTransaction[] | null;
