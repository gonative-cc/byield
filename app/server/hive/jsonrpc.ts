import type { FetcherWithComponents } from "react-router";
import type { DepositTransaction, Response, UserSbtData } from "./types";

export type Req =
	| {
			method: "queryHiveUserData";
			//suiGraphQLURl, tbookurl, sui address
			params: [string, string, string];
	  }
	| {
			method: "queryTotalDeposit";
			//suiGraphQLURl, tbookurl, contract address, sui address
			params: [string, string, string, string];
	  }
	| {
			method: "queryUserDeposits";
			//suiGraphQLURl, tbookurl, contract address, sui address
			params: [string, string, string, string];
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
export type QueryUserDepositsDataResp = Response<DepositTransaction[]> | null;
