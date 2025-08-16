import { getLeaderBoardData } from "./leaderboard.server";
import type { LoaderDataResp, AuctionDetails } from "./types";
import { defaultAuctionDetails } from "./defaults";

export default class Controller {
	kv: KVNamespace;
	kvKeyDetails = "details";
	kvKeyLeaderboard = "lead";

	constructor(kv: KVNamespace) {
		this.kv = kv;
	}

	async loadPageData(): Promise<LoaderDataResp> {
		return {
			error: undefined,
			leaderboard: getLeaderBoardData(),
			details: await this.getAuctionDetails(),
		};
	}

	async getAuctionDetails(): Promise<AuctionDetails> {
		const detailsStr = await this.kv.get(this.kvKeyDetails);
		let details;
		if (detailsStr !== null) {
			console.log("DEATILS IN KV");
			details = JSON.parse(detailsStr) as AuctionDetails;
		} else {
			console.log("DEATILS NOT LOADED");
			details = defaultAuctionDetails();
			await this.kv.put(this.kvKeyDetails, JSON.stringify(details));
		}
		return details;
	}
}
