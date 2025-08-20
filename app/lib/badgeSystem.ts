import { Badge } from "~/server/BeelieversAuction/types";

export interface BadgeRecord {
	name: Badge;
	filename: string;
	src: string;
}

// Badge name to filename mapping for backend integration
export const BADGE_NAME_TO_FILENAME: Record<Badge, string> = {
	[Badge.first_place]: "Sui_Logo_1stspot.svg",
	[Badge.top_3]: "Crown_top_3.svg",
	[Badge.top_10]: "Native_top10.svg",
	[Badge.top_21]: "Bitcoin_top21.svg",
	[Badge.top_100]: "Whale_for_top_100.svg",
	[Badge.top_5810]: "Everyone_in_top_5810_positions.svg",
	[Badge.highest_bid]: "highest_single_bid.svg",
	[Badge.bid_over_10]: "Single_bid_over_10_Sui.svg",
	[Badge.bid_over_5]: "Single_bid_over_5_Sui.svg",
	[Badge.bid_over_3]: "Single_bid_over_3_Sui.svg",
	[Badge.bids_over_10]: "10_or_more_bids.svg",
	[Badge.bids_over_20]: "20_or_more_bids.svg",
	[Badge.bids_over_5]: "made_5_or_more_bids.svg",
	[Badge.partner_wl]: "Partner_WL_addresses_badge.svg",
	[Badge.first_500]: "first_500_bids.svg",
	[Badge.first_1000]: "first_1000_bids.svg",
	[Badge.climb_up_210_position]: "anyone_climbs_more_than_210_positions_up.svg",
	[Badge.climb_10_spots]: "if_anyone_climbs_10_spots_in_a_single_bid.svg",
	[Badge.comeback_top_10]: "If_some_one_comesback_to_top_10_after_falling_off_10.svg",
	[Badge.last_bid]: "Last_bid_in_Leaderboard.svg",
	[Badge.every_10th_position]: "Logo_Ika_red_every_10th_position.svg",
	[Badge.made_2nd_position]: "Made_2nd_bid.svg",
	[Badge.made_3rd_bid]: "made_3rd_bid.svg",
	[Badge.made_4th_bid]: "Made_4th_bid.svg",
	[Badge.nbtc_every_21st_bidder]: "nbtc_every_21st_bidder.svg",
	[Badge.dethrone]: "Who_dethrones_someone_and_gets_number_1_spot.svg",
};

export function toBadgeRecord(badgeName: Badge): BadgeRecord | null {
	const filename = BADGE_NAME_TO_FILENAME[badgeName];
	if (!filename) return null;

	return {
		name: badgeName,
		filename,
		src: `/assets/auction/badges/${filename}`,
	};
}
