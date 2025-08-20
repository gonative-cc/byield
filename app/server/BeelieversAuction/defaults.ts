import { AuctionAccountType, Badge, type AuctionDetails, type User } from "./types";

import { isProductionMode } from "~/lib/appenv";

export function defaultAuctionDetails(): AuctionDetails {
	if (!isProductionMode()) {
		return testAuctionDetails();
	}
	const startsAt = +new Date("2025-08-21T13:00:00Z");
	return {
		uniqueBidders: 0,
		totalBids: 0,
		highestBidMist: 0,
		entryBidMist: 1e9, // 1 SUI
		startsAt,
		endsAt: startsAt + 48 * 3600_000,
		auctionSize: 5810,
	};
}

function testAuctionDetails(): AuctionDetails {
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

export function defaultUser(): User {
	if (!isProductionMode()) {
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
		amount: 5_1 * 1e8, // 5.1 SUI
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
