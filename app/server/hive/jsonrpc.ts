import type { FetcherWithComponents } from "react-router";
import type { Response, Data, UserSbtData } from "./types";

export type Req =
	| {
			method: "queryHiveUserData";
			//sui address
			params: [string];
	  }
	| {
			method: "queryAllUserData";
			params: [];
	  };

export async function makeReq<T>(
	fetcher: FetcherWithComponents<T>,
	req: Req,
): Promise<T | undefined> {
	await fetcher.submit(req, { method: "POST", encType: "application/json" });
	return fetcher.data;
}

export type QueryAllUserDataResp = Response<Data> | null;
export type QueryUserDataResp = Response<UserSbtData> | null;
