import { AuctionAccountType, Badge, type AuctionInfo, type User } from "./types";

export function defaultAuctionInfo(production: boolean): AuctionInfo {
	if (!production) {
		return testAuctionDetails();
	}
	const startsAt = +new Date("2025-08-21T13:00:00Z");
	return {
		// TODO: move this
		totalBids: 0,
		uniqueBidders: 0,
		highestBidMist: 0,

		entryBidMist: 1e9, // 1 SUI
		startsAt,
		endsAt: startsAt + 48 * 3600_000,
		auctionSize: 5810,
	};
}

function testAuctionDetails(): AuctionInfo {
	const startsAt = +new Date("2025-08-20T11:00");
	return {
		uniqueBidders: 600,
		totalBids: 1250,
		highestBidMist: 30e9,
		entryBidMist: 1e7, // 0.01 SUI
		startsAt,
		endsAt: startsAt + 24 * 3600_000,
		auctionSize: 5810,
	};
}

export function defaultUser(production: boolean): User {
	if (!production) {
		return defaultTestUser();
	}
	return {
		rank: null,
		amount: 0,
		badges: [],
		note: "",
		wlStatus: AuctionAccountType.DEFAULT,
	};
}

function defaultTestUser(): User {
	return {
		rank: 9, // rank starts from 1
		amount: 1, // 1 MIST
		badges: [
			Badge.top_10,
			Badge.top_21,
			Badge.top_100,
			Badge.bid_over_5,
			Badge.nbtc_every_21st_bidder,
		],
		note: "I'm Beellish!",
		wlStatus: AuctionAccountType.PARTNER_WHITELIST,
	};
}
