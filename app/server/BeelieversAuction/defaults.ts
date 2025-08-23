import { AuctionAccountType, Badge, type AuctionInfo, type User, type Bidder } from "./types";

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
	const oneh = 3600_000;
	const startsAt = +new Date() - oneh;
	return {
		uniqueBidders: 100,
		totalBids: 100,
		highestBidMist: 10e9,

		entryBidMist: 1e6, //  0.001 SUI
		startsAt,
		endsAt: startsAt + 10 * oneh,
		auctionSize: 10,
	};
}

 

export function defaultUser(_production: boolean): User {
	return {
		rank: null,
		amount: 0,
		badges: [],
		note: "",
		wlStatus: AuctionAccountType.DEFAULT,
		bids: 0,
	};
}

/* eslint-disable @typescript-eslint/no-unused-vars */
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

// TODO: leader board API integration
const MOCK_LEADER_BOARD_DATA: Bidder[] = [
	{
		rank: 1,
		bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		amount: 100, // Highest bid - will get "highest single bid" badge
		badges: [Badge.first_place, Badge.highest_bid],
		note: "",
		bids: 2,
	},
	{
		rank: 2,
		bidder: "0xabc123405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		amount: 45,
		badges: [],
		note: "",
		bids: 2,
	},
	{
		rank: 3,
		bidder: "0xdef456405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		amount: 40,
		badges: [],
		note: "",
		bids: 2,
	},
	{
		rank: 10,
		bidder: "0xghi789405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		amount: 15, // Rank 10 - will get "Logo Ika red every 10th position" badge
		badges: [],
		note: "",
		bids: 2,
	},
	{
		rank: 20,
		bidder: "0xjkl012405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		amount: 12, // Rank 20 - will get "Logo Ika red every 10th position" badge
		badges: [],
		note: "",
		bids: 2,
	},
	{
		rank: 21,
		bidder: "0xxyz345405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		amount: 11, // Rank 21 - will get "nbtc every 21st bidder" badge
		badges: [],
		note: "",
		bids: 2,
	},
	{
		rank: 50,
		bidder: "0xaaa111405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		amount: 8,
		badges: [],
		note: "",
		bids: 2,
	},
	{
		rank: 100,
		bidder: "0xbbb222405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
		amount: 6, // Rank 100 - will get "Whale for top 100" badge
		badges: [],
		note: "",
		bids: 2,
	},
];
