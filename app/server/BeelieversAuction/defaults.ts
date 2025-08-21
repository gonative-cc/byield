import { AuctionAccountType, Badge, type AuctionInfo, type User } from "./types";

export function defaultAuctionInfo(production: boolean): AuctionInfo {
	if (!production) {
		return testAuctionDetails();
	}
	const startsAt = +new Date("2025-08-21T13:00:00Z");
	return {
		// TODO: move this and use DB records!
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
	const startsAt = +new Date("2025-08-20T11:00Z");
	// TODO: fix
	return {
		uniqueBidders: 100,
		totalBids: 100,
		highestBidMist: 10e9,

		entryBidMist: 1e6, //  0.001 SUI
		startsAt,
		endsAt: 1755780307000,
		auctionSize: 10,
	};
}

function mockAuctionDetails(): AuctionInfo {
	const startsAt = +new Date("2025-08-20T11:00Z");
	return {
		uniqueBidders: 600,
		totalBids: 1250,
		highestBidMist: 30e9,

		entryBidMist: 1e8, // 0.1 SUI
		startsAt,
		endsAt: startsAt + 24 * 3600_000,
		auctionSize: 5810,
	};
}

export function defaultUser(_production: boolean): User {
	// if (!_production) {
	// 	return defaultTestUser();
	// }
	return {
		rank: null,
		amount: 0,
		badges: [],
		note: "",
		wlStatus: AuctionAccountType.DEFAULT,
		bids: 0,
	};
}

function defaultTestUser(): User {
	return {
		rank: 9, // rank starts from 1
		amount: 12e8, // 1.2 SUI
		badges: [
			Badge.top_10,
			Badge.top_21,
			Badge.top_100,
			Badge.bid_over_5,
			Badge.nbtc_every_21st_bidder,
		],
		note: "I'm Beellish!",
		wlStatus: AuctionAccountType.PARTNER_WHITELIST,
		bids: 4,
	};
}
