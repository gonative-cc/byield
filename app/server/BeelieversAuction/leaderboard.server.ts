import type { LeaderboardResponse, Bidder } from "~/pages/BeelieversAuction/types";

// TODO: leader board API integration
const MOCK_LEADER_BOARD_DATA: Omit<LeaderboardResponse, "isError"> = {
	leaders: [
		{
			rank: 1,
			bidder: "0xe670405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "100", // Highest bid - will get "highest single bid" badge
			badges: ["first_place", "highest_bid"],
		},
		{
			rank: 2,
			bidder: "0xabc123405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "45",
			badges: [],
		},
		{
			rank: 3,
			bidder: "0xdef456405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "40",
			badges: [],
		},
		{
			rank: 10,
			bidder: "0xghi789405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "15", // Rank 10 - will get "Logo Ika red every 10th position" badge
			badges: [],
		},
		{
			rank: 20,
			bidder: "0xjkl012405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "12", // Rank 20 - will get "Logo Ika red every 10th position" badge
			badges: [],
		},
		{
			rank: 21,
			bidder: "0xxyz345405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "11", // Rank 21 - will get "nbtc every 21st bidder" badge
			badges: [],
		},
		{
			rank: 50,
			bidder: "0xaaa111405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "8",
			badges: [],
		},
		{
			rank: 100,
			bidder: "0xbbb222405731f97182a4e5056b63385ddd6f7929dfa1a64f82c5f0bdd780dc79f4",
			amount: "6", // Rank 100 - will get "Whale for top 100" badge
			badges: [],
		},
	] as Bidder[],
	unique_bidders: 600,
	total_bids: 1250,
	highest_bid: 100,
	entry_bid: 2,
	auction_start_ms: Date.now() + 24 * 60 * 60 * 1000,
	auction_end_ms: Date.now() + 24 * 60 * 60 * 1000,
};

export function getLeaderBoardData(): LeaderboardResponse {
	return { ...MOCK_LEADER_BOARD_DATA, isError: false };
}
