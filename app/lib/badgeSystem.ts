import type { Bidder, LeaderboardData } from "~/types/auction";

export interface BadgeCondition {
	filename: string;
	condition: (bidder: Bidder, allBidders: Bidder[], leaderboardData: LeaderboardData) => boolean;
	priority: number; // Lower number = higher priority
}

export interface Badge {
	name: string;
	filename: string;
	src: string;
}

// Badge conditions based on filename analysis
export const BADGE_CONDITIONS: BadgeCondition[] = [
	{
		filename: "Sui_Logo_1stspot.svg",
		condition: (bidder: Bidder) => bidder.rank === 1,
		priority: 1,
	},
	{
		filename: "Crown_top_3.svg",
		condition: (bidder: Bidder) => bidder.rank <= 3,
		priority: 2,
	},
	{
		filename: "Native_top10.svg",
		condition: (bidder: Bidder) => bidder.rank <= 10,
		priority: 3,
	},
	{
		filename: "Bitcoin_top21.svg",
		condition: (bidder: Bidder) => bidder.rank <= 21,
		priority: 4,
	},
	{
		filename: "Whale_for_top_100.svg",
		condition: (bidder: Bidder) => bidder.rank <= 100,
		priority: 5,
	},
	{
		filename: "Everyone_in_top_5810_positions.svg",
		condition: (bidder: Bidder) => bidder.rank <= 5810,
		priority: 6,
	},
	{
		filename: "highest_single_bid.svg",
		condition: (bidder: Bidder, _allBidders: Bidder[], leaderboardData: LeaderboardData) =>
			parseFloat(bidder.amount) === leaderboardData.highest_bid,
		priority: 1,
	},
	{
		filename: "Single_bid_over_10_Sui.svg",
		condition: (bidder: Bidder) => parseFloat(bidder.amount) > 10,
		priority: 7,
	},
	{
		filename: "Single_bid_over_5_Sui.svg",
		condition: (bidder: Bidder) => parseFloat(bidder.amount) > 5,
		priority: 8,
	},
	{
		filename: "Single_bid_over_3_Sui.svg",
		condition: (bidder: Bidder) => parseFloat(bidder.amount) > 3,
		priority: 9,
	},
	{
		filename: "Logo_Ika_red_every_10th_position.svg",
		condition: (bidder: Bidder) => bidder.rank % 10 === 0,
		priority: 10,
	},
	{
		filename: "nbtc_every_21st_bidder.svg",
		condition: (bidder: Bidder) => bidder.rank % 21 === 0,
		priority: 11,
	},
	{
		filename: "Last_bid_in_Leaderboard.svg",
		condition: (bidder: Bidder, allBidders: Bidder[]) => bidder.rank === allBidders.length,
		priority: 12,
	},
];

export function getBadgesForBidder(
	bidder: Bidder,
	allBidders: Bidder[],
	leaderboardData: LeaderboardData,
): Badge[] {
	const applicableBadges: Badge[] = [];

	for (const badgeCondition of BADGE_CONDITIONS) {
		if (badgeCondition.condition(bidder, allBidders, leaderboardData)) {
			applicableBadges.push({
				name: badgeCondition.filename.replace(".svg", ""),
				filename: badgeCondition.filename,
				src: `/assets/auction/badges/${badgeCondition.filename}`,
			});
		}
	}

	// Sort by priority and return top 3 badges to avoid clutter
	return applicableBadges
		.sort((a, b) => {
			const aPriority =
				BADGE_CONDITIONS.find((c) => c.filename === a.filename)?.priority ?? 999;
			const bPriority =
				BADGE_CONDITIONS.find((c) => c.filename === b.filename)?.priority ?? 999;
			return aPriority - bPriority;
		})
		.slice(0, 3);
}
