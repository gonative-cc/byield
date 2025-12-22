import { badRequest, notFound, serverError } from "../http-resp";
import type { QueryAllUserDataResp, QueryUserDataResp, Req } from "./jsonrpc";
import { logError } from "~/lib/log";

const URL = "https://rd-api-staging.tbook.com/sbt-data/gonative";

export class HiveController {
	tbookAuthToken: string = "";

	constructor(_tbookAuthToken: string) {
		this.tbookAuthToken = _tbookAuthToken;
	}

	private async fetchData<T>(url: string, options?: RequestInit): Promise<T | Response> {
		try {
			const response = await fetch(url, {
				...options,
				headers: {
					...options?.headers,
					Authorization: this.tbookAuthToken,
				},
			});
			if (!response.ok)
				throw new Error(`HTTP Error! Status: ${response.status} - ${response.statusText}`);
			return await response.json<T>();
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "An unknown error occurred during fetch.";
			logError({ msg: `Failed to fetch data from ${url}.`, method: "fetchData" }, error);

			return serverError("fetchData", errorMessage);
		}
	}

	async queryUserData(suiAddr: string): Promise<QueryUserDataResp | Response> {
		if (!suiAddr) return badRequest("SUI address not provided");

		const url = `${URL}/user?address=${suiAddr}`;
		return await this.fetchData<QueryUserDataResp>(url);
	}

	async queryAllUserData(): Promise<QueryAllUserDataResp | Response> {
		const url = `${URL}/all-users`;
		return await this.fetchData<QueryAllUserDataResp>(url);
	}

	async handleJsonRPC(r: Request) {
		let reqData: Req;
		try {
			reqData = await r.json<Req>();
		} catch (_err) {
			logError(
				{ msg: "Expecting JSON Content-Type and JSON body", method: "handleJsonRPC" },
				_err,
			);
			return new Response("Expecting JSON Content-Type and JSON body", {
				status: 400,
			});
		}

		switch (reqData.method) {
			case "queryHiveUserData":
				return this.queryUserData(reqData.params[0]);
			case "queryAllUserData":
				return this.queryAllUserData();
			default:
				return notFound("Unknown method");
		}
	}
}
