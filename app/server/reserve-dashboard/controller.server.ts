import type { BitcoinNetworkType } from "sats-connect";
import { badRequest, handleNonSuccessResp, notFound, serverError } from "../http-resp";
import type { QueryLockedNBTCResp, QueryLockedNCBTCResp, Req } from "./jsonrpc";
import type { NCBTCData, TotalBTCRes, TotalSupplyResponse } from "./types";
import type { GraphQLResponse } from "../common/types";
import { mustGetBitcoinConfig } from "~/hooks/useBitcoinConfig";
import { logError } from "~/lib/log";

export class ReserveController {
	btcRPCUrl: string;
	depositAddress: string | null = null;
	d1: D1Database;
	network: BitcoinNetworkType;
	suiGraphQLURl: string | null = null;

	constructor(network: BitcoinNetworkType, suiGraphQLURl: string, d1: D1Database) {
		this.d1 = d1;
		this.network = network;
		this.suiGraphQLURl = suiGraphQLURl;

		const networkConfig = mustGetBitcoinConfig(network);
		this.btcRPCUrl = networkConfig.btcRPCUrl;
		this.depositAddress = networkConfig.nBTC.depositAddress || null;
	}

	private async getTotalBTCBalance(address: string): Promise<number> {
		try {
			if (!this.btcRPCUrl) throw badRequest();
			const url = this.btcRPCUrl + `/address/${address}`;
			const response = await fetch(url);
			if (!response.ok) throw Error(response.statusText);
			const {
				chain_stats: { funded_txo_sum, spent_txo_sum },
			} = await response.json<TotalBTCRes>();
			const totalLockedBTC = funded_txo_sum - spent_txo_sum;
			return totalLockedBTC;
		} catch (err) {
			logError({ msg: "Error fetching BTC reserves", method: "getTotalBTCBalance" }, err);
			return 0;
		}
	}

	private async getTotalSupply(contractId: string): Promise<number> {
		try {
			if (!this.suiGraphQLURl) throw badRequest();
			const endpoint = this.suiGraphQLURl;
			const query = `
				query GetTotalSupply($contractId: SuiAddress!) {
					object(address: $contractId) {
						address
						asMoveObject {
							contents {
								json
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
					},
				}),
			});
			if (!res.ok) throw new Error(res.statusText);

			const { data, errors } = await res.json<GraphQLResponse<TotalSupplyResponse>>();
			if (errors?.length) {
				throw new Error(errors.map((e) => e.message).join(", "));
			}
			const {
				object: {
					asMoveObject: {
						contents: {
							json: {
								cap: {
									total_supply: { value },
								},
							},
						},
					},
				},
			} = data;
			return value;
		} catch (err) {
			logError({ msg: "Error fetching total supply", method: "getTotalSupply" }, err);
			return 0;
		}
	}

	async queryLockedNBTC(nBTCContractId: string): Promise<QueryLockedNBTCResp | Response> {
		try {
			if (!this.depositAddress)
				return serverError("queryLockedNBTC", new Error("Deposit address not found"));
			const totalLockedBTC = await this.getTotalBTCBalance(this.depositAddress);
			const totalNBTCSupply = await this.getTotalSupply(nBTCContractId);

			return {
				totalLockedBTC,
				totalNBTCSupply,
			};
		} catch (error) {
			logError({ msg: "Error fetching BTC reserves", method: "queryLockedNBTC" }, error);
			return serverError("queryLockedNBTC", "Error fetching BTC reserves");
		}
	}

	async queryNCBTCData(): Promise<QueryLockedNCBTCResp | Response> {
		try {
			const query =
				"SELECT network, name, btc_addr, cbtc_pkg, cbtc_obj, note FROM cbtc WHERE network = ?";
			const result = await this.d1.prepare(query).bind(this.network).all<NCBTCData>();
			if (result.error) {
				return handleNonSuccessResp(
					"queryNCBTCData",
					"Can't query ncBTC data",
					result.error,
				);
			}

			const NCBTCData = await Promise.all(
				result.results.map(async (row) => {
					const amount = await this.getTotalBTCBalance(row.btc_addr);
					const totalSupply = await this.getTotalSupply(row.cbtc_obj);
					return {
						...row,
						amount,
						totalSupply,
					};
				}),
			);

			const totalLockedBTC = NCBTCData.reduce((acc, row) => acc + row.amount, 0);
			const totalNCBTCSupply = NCBTCData.reduce((acc, row) => acc + row.totalSupply, 0);

			return {
				totalLockedBTC,
				totalNCBTCSupply,
				NCBTCData,
			};
		} catch (error) {
			logError({ msg: "Error fetching ncBTC data", method: "queryNCBTCData" }, error);
			return serverError("queryLockedNBTC", "Error fetching ncBTC data");
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
			case "queryLockedNBTC":
				return this.queryLockedNBTC(reqData.params[2]);
			case "queryLockedNCBTC":
				return this.queryNCBTCData();
			default:
				return notFound("Unknown method");
		}
	}
}
