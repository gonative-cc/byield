import { getLeaderBoardData } from "./leaderboard.server";
import type { LoaderDataResp, AuctionDetails, User } from "./types";
import type { Req } from "./jsonrpc";
import { defaultAuctionDetails, defaultUser } from "./defaults";
import { isValidSuiAddress } from "@mysten/sui/utils";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { validateBidTransaction, type BidDetails } from "./auth.server";

export default class Controller {
	kv: KVNamespace;
	kvKeyDetails = "details";
	kvKeyLeaderboard = "lead";
	kvKeyUserPrefix = "u_";

	constructor(kv: KVNamespace) {
		this.kv = kv;
	}

	async loadPageData(userAddr?: string): Promise<LoaderDataResp> {
		// TODO: add user data if a use is connected
		const user = userAddr !== undefined ? await this.getUserData(userAddr) : undefined;

		return {
			error: undefined,
			leaderboard: getLeaderBoardData(),
			details: await this.getAuctionDetails(),
			user,
		};
	}

	async handleJsonRPC(r: Request) {
		let reqData: Req;
		try {
			reqData = await r.json<Req>();
		} catch (_err) {
			return new Response("Malformed JSON in request body", { status: 400 });
		}
		switch (reqData.method) {
			case "queryUser":
				return this.getUserData(reqData.params[0]);
			case "postBidTx": {
				const [suiTxId, bidderAddr, amount, msg] = reqData.params;
				const bidDetails = await this.postBidTx(suiTxId, bidderAddr, amount, msg);

				if (bidDetails) {
					console.log("Successfully validated and processed bid:", bidDetails);
					return new Response(JSON.stringify(bidDetails), {
						headers: { "Content-Type": "application/json" },
						status: 200,
					});
				} else {
					return new Response("Failed to validate transaction or find bid event", {
						status: 422,
					});
				}
			}
			case "pageData": {
				const [suiAddr] = reqData.params;
				return this.loadPageData(suiAddr);
			}
			default:
				return new Response("Unknown method", { status: 404 });
		}
	}

	async getAuctionDetails(): Promise<AuctionDetails> {
		const detailsJson = await this.kv.get(this.kvKeyDetails);
		if (detailsJson !== null) {
			return JSON.parse(detailsJson) as AuctionDetails;
		}
		const details = defaultAuctionDetails();
		await this.kv.put(this.kvKeyDetails, JSON.stringify(details));
		return details;
	}

	async postBidTx(
		suiTxId: string,
		bidderAddr: string,
		amount: number,
		msg: string
	): Promise<BidDetails | null> {
		console.log("handling bid tx", suiTxId, bidderAddr, amount, msg);
		// TODO: The RPC client is hardcoded to testnet. This should be configurable and moved to constructor
		const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });
		const bidDetails = await validateBidTransaction(suiClient, suiTxId, bidderAddr);
		if (!bidDetails) {
			return null;
		}
		return bidDetails;

		// TODO authentication
		// TODO: Vu - could you check up if we pass the full signed TX, and user address, can we
		// verify if the given address signed TX? If yes, then we sole authentication
		//  TODO: check whitelist (later)
	}

	async getUserData(userAddr: string): Promise<User | undefined> {
		if (!isValidSuiAddress(userAddr)) {
			return undefined;
		}
		const userJson = await this.kv.get(this.kvKeyUserPrefix + userAddr);
		if (userJson === null) {
			return defaultUser();
		}
		return JSON.parse(userJson) as User;
	}
}
