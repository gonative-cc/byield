export interface BadgeRecord {
	name: string;
	filename: string;
	src: string;
}

// Badge name to filename mapping for backend integration
export const BADGE_NAME_TO_FILENAME: Record<string, string> = {
	first_place: "Sui_Logo_1stspot.svg",
	top_3: "Crown_top_3.svg",
	top_10: "Native_top10.svg",
	top_21: "Bitcoin_top21.svg",
	top_100: "Whale_for_top_100.svg",
	top_5810: "Everyone_in_top_5810_positions.svg",
	highest_bid: "highest_single_bid.svg",
	bid_over_10: "Single_bid_over_10_Sui.svg",
	bid_over_5: "Single_bid_over_5_Sui.svg",
	bid_over_3: "Single_bid_over_3_Sui.svg",
	every_10th: "Logo_Ika_red_every_10th_position.svg",
	every_21st: "nbtc_every_21st_bidder.svg",
	last_position: "Last_bid_in_Leaderboard.svg",
};

export function toBadgeRecord(badgeName: string): BadgeRecord | null {
	const filename = BADGE_NAME_TO_FILENAME[badgeName];
	if (!filename) return null;

	return {
		name: badgeName,
		filename,
		src: `/assets/auction/badges/${filename}`,
	};
}
