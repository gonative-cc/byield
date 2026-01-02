import type { GraphQLResponse } from "../common/types";
import { badRequest, notFound, serverError } from "../http-resp";
import type { QueryUserDataResp, QueryUserTotalDepositDataResp, Req } from "./jsonrpc";
import { logError } from "~/lib/log";
import type { UserUSDCTotalDeposit } from "./types";

const URL = "https://rd-api-staging.tbook.com/sbt-data/gonative";

export class HiveController {
	tbookAuthToken: string = "";
	suiGraphQLURl: string | null = null;

	constructor(_tbookAuthToken: string, _graphqlURl: string) {
		this.tbookAuthToken = _tbookAuthToken;
		this.suiGraphQLURl = _graphqlURl || null;
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

	async queryTotalDeposit(
		contractId: string,
		suiAddr: string,
	): Promise<QueryUserTotalDepositDataResp | Response> {
		try {
			if (!this.suiGraphQLURl) throw badRequest();
			const endpoint = this.suiGraphQLURl;
			const query = `
				query UserUSDCTotalDeposit($contractId: String!, $suiAddr: SuiAddress!) {
					events(
						filter: {
						module: $contractId
						sender: $suiAddr
						}
						last: 1
					) {
						nodes {
						timestamp
						sender {
							address
						}
						contents {
							json
						}
						transaction {
							digest
							effects {
							status
							}
						}
						}
					}
				}
			`;

			const res = await fetch(endpoint, {
				method: "POST",
				body: JSON.stringify({
					query: query,
					variables: {
						contractId,
						suiAddr,
					},
				}),
			});
			if (!res.ok) throw new Error(res.statusText);
			const { data, errors } = await res.json<GraphQLResponse<UserUSDCTotalDeposit>>();
			if (errors?.length) {
				throw new Error(errors.map((e) => e.message).join(", "));
			}
			console.log(data.events.nodes);
			return {
				code: res.status,
				data: data.events.nodes?.[0]?.contents?.json?.total_amount || "0",
				isError: false,
				message: "Success",
			};
		} catch (err) {
			logError({ msg: "Error fetching total deposit", method: "queryTotalDeposit" }, err);
			return serverError("queryTotalDeposit", err, "Error fetching total deposit");
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
			case "queryTotalDeposit":
				return this.queryTotalDeposit(reqData.params[1], reqData.params[2]);
			default:
				return notFound("Unknown method");
		}
	}
}
