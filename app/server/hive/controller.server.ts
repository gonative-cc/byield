import { notFound, serverError } from "../http-resp";
import type { QueryAllUserDataResp, QueryUserDataResp, Req } from "./jsonrpc";
import { logError } from "~/lib/log";

const URL = "https://rd-api-staging.tbook.com/sbt-data/gonative";
const AUTH_TOKEN = "tbk_authorization_djoi39ide2";

async function fetchData<T>(url: string, options?: RequestInit): Promise<T | Response> {
	try {
		const response = await fetch(url, {
			...options,
			headers: {
				Authorization: AUTH_TOKEN,
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

export class HiveController {
	async queryUserData(suiAddr: string): Promise<QueryUserDataResp | Response> {
		try {
			const url = `${URL}/user`;
			return await fetchData<QueryUserDataResp>(url, {
				body: new URLSearchParams({ address: suiAddr }),
			});
		} catch (error) {
			logError({ msg: "Error fetching all user data", method: "queryUserData" }, error);
			return serverError("queryUserData", "Error fetching all user data");
		}
	}

	async queryAllUserData(): Promise<QueryAllUserDataResp | Response> {
		try {
			const url = `${URL}/all-users`;
			return await fetchData<QueryAllUserDataResp>(url);
		} catch (error) {
			logError({ msg: "Error fetching all user data", method: "queryAllUserData" }, error);
			return serverError("queryAllUserData", "Error fetching all user data");
		}
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
