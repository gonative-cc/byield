import type { AuctionDetails } from "./types";

export function defaultAuctionDetails(): AuctionDetails {
	const startsAt = new Date("2025-08-19T12:00").getDate();
	return {
		uniqueBidders: 600,
		totalBids: 1250,
		highestBidMist: 30e9,
		entryBidMist: 2e9,
		startsAt,
		endsAt: startsAt + 24 * 3600_000,
	};
}
