import {
	AuctionAccountType,
	Badge,
	type AuctionInfo,
	type User,
	type Bidder,
	type Raffle,
} from "./types";

export function defaultAuctionInfo(_production: boolean): AuctionInfo {
	// TODO: make an env Var
	// if (!production) {
	// 	return testAuctionDetails();
	// }
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
		clearingPrice: null,
	};
}
/* eslint-disable @typescript-eslint/no-unused-vars */
function testAuctionDetails(): AuctionInfo {
	const oneHour = 3600_000;
	const startsAt = +new Date() - oneHour;
	return {
		uniqueBidders: 100,
		totalBids: 100,
		highestBidMist: 10e9,

		entryBidMist: 1e6, //  0.001 SUI
		startsAt,
		endsAt: startsAt + 10 * oneHour,
		auctionSize: 10,
		clearingPrice: null,
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

export function mockRaffleWinners(): Raffle[] {
	return [
		{ id: 1, address: "0x2c7b5d2d4c9e8a7f0e6c5a9b8d1c3a0f9b6e7d8c4a1e5f0d2c7b5d2d4c9e8a7f" },
		{ id: 2, address: "0x3d8c1e2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d" },
		{ id: 3, address: "0x4e9d2c3e4f5a6b7c8d9e0f1a2b3c4d5e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c" },
		{ id: 4, address: "0x5a1f2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a" },
		{ id: 5, address: "0x6b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c0d1e2f3a4b5c6d7e8f9a0b1c" },
		{ id: 6, address: "0x7c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c0d1e2f3a4b5c6d7e8f9a0b1c2d" },
		{ id: 7, address: "0x8d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e" },
		{ id: 8, address: "0x9e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f" },
		{ id: 9, address: "0xae6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a" },
		{ id: 10, address: "0xbf7b8c9d0e1f2a3b4c5d6e7f8a9b0c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b" },
		{ id: 11, address: "0xcb8c9d0e1f2a3b4c5d6e7f8a9b0c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c" },
		{ id: 12, address: "0xdc9d0e1f2a3b4c5d6e7f8a9b0c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d" },
		{ id: 13, address: "0xed0e1f2a3b4c5d6e7f8a9b0c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e" },
		{ id: 14, address: "0xfe1f2a3b4c5d6e7f8a9b0c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f" },
		{ id: 15, address: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b" },
		{ id: 16, address: "0x2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c" },
		{ id: 17, address: "0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d" },
		{ id: 18, address: "0x4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e" },
		{ id: 19, address: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f" },
		{ id: 20, address: "0x6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a" },
		{ id: 21, address: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b" },
	];
}
