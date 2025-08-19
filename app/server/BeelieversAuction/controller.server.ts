import { getLeaderBoardData } from "./leaderboard.server";
import type { LoaderDataResp, AuctionDetails, User } from "./types";
import type { Req } from "./jsonrpc";
import { defaultAuctionDetails, defaultUser } from "./defaults";
import { isValidSuiAddress } from "@mysten/sui/utils";

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
				return this.postBidTx(suiTxId, bidderAddr, amount, msg);
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

	async postBidTx(suiTxId: string, bidderAddr: string, amount: number, msg: string) {
		// TODO authentication
		// TODO: Vu - could you check up if we pass the full signed TX, and user address, can we
		// verify if the given address signed TX? If yes, then we sole authentication
		//  TODO: check whitelist (later)
		console.log("handling bid tx", suiTxId, bidderAddr, amount, msg);
	}

	async getUserData(userAddr: string): Promise<User | null> {
		if (!isValidSuiAddress(userAddr)) {
			return null;
		}
		const userJson = await this.kv.get(this.kvKeyUserPrefix + userAddr);
		if (userJson === null) {
			return defaultUser();
		}
		return JSON.parse(userJson) as User;
	}
}
