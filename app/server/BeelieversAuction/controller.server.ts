import { getLeaderBoardData } from "./leaderboard.server";
import type { LoaderDataResp } from "./types";

export default class Controller {
	loadPageData(): LoaderDataResp {
		const now = Date.now();
		return {
			error: undefined,
			leaderboard: getLeaderBoardData(),
			details: {
				uniqueBidders: 600,
				totalBids: 1250,
				highestBidMist: 30e9,
				entryBidMist: 2e9,
				startsAt: now + 24 * 60 * 60 * 1000,
				endsAt: now + 24 * 60 * 60 * 1000,
			},
		};
	}
}
