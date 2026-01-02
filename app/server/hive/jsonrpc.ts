import type { FetcherWithComponents } from "react-router";
import type { Response, UserSbtData } from "./types";

export type Req =
	| {
			method: "queryHiveUserData";
			//sui address
			params: [string];
	  }
	| {
			method: "queryTotalDeposit";
			//suiGraphQLURl, contract address, sui address
			params: [string, string, string];
	  };

export async function makeReq<T>(
	fetcher: FetcherWithComponents<T>,
	req: Req,
): Promise<T | undefined> {
	await fetcher.submit(req, { method: "POST", encType: "application/json" });
	return fetcher.data;
}

export type QueryUserDataResp = Response<UserSbtData> | null;
export type QueryUserTotalDepositDataResp = Response<string> | null;
