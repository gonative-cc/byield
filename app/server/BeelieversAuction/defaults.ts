import { AuctionAccountType, type AuctionDetails, type User } from "./types";

import { isProductionMode } from "~/lib/appenv";

export function defaultAuctionDetails(): AuctionDetails {
	console.log(">>> IN TESTING", isProductionMode());
	if (!isProductionMode()) {
		return testAuctionDetails();
	}
	const startsAt = +new Date("2025-08-19T14:00");
	return {
		uniqueBidders: 0,
		totalBids: 0,
		highestBidMist: 0,
		entryBidMist: 1e9, // 1 SUI
		startsAt,
		endsAt: startsAt + 24 * 3600_000,
	};
}

function testAuctionDetails(): AuctionDetails {
	const startsAt = +new Date("2025-08-18T12:00");
	return {
		uniqueBidders: 600,
		totalBids: 1250,
		highestBidMist: 30e9,
		entryBidMist: 2e9,
		startsAt,
		endsAt: startsAt + 24 * 3600_000,
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
		amount: 5_1 * 1e8, // 2.1 SUI
		badges: ["top_10", "top_21", "top_100", "bid_over_5", "every_21st"],
		note: "I'm Beellish!",
		wlStatus: AuctionAccountType.PARTNER_WHITELIST,
	};
}
