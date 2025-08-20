export interface AuctionDetails {
	// start epoch time time in MS
	startsAt: number;
	// end epoch time time in MS
	endsAt: number;
	// price in MIST (1 MIST = 1e9 SUI)
	entryBidMist: number;
	// price in MIST (1 MIST = 1e9 SUI)
	highestBidMist: number;
	// amount of unique bidders
	uniqueBidders: number;
	// total number of bids people made
	totalBids: number;
}

export enum AuctionAccountType {
	DEFAULT = 0,
	PARTNER_WHITELIST = 1,
	TESTNET_WHITELIST = 2,
}

interface User_ {
	rank: number | null; // null => outside of the winning list
	// amount bid in MIST. 0 => no bid placed
	amount: number;
	badges: Badge[];
	note: string;
}

export interface User extends User_ {
	wlStatus: AuctionAccountType;
}

export interface Bidder extends User_ {
	bidder: string;
}

export interface LoaderData {
	details: AuctionDetails;
	leaderboard: Bidder[];
	user?: User;
}

// TODO move to controller
export interface LoaderDataResp extends LoaderData {
	error?: Error;
}

export enum Badge {
	first_place = 1,
	top_3 = 2,
	top_10 = 3,
	top_21 = 4,
	top_100 = 5,
	top_5810 = 6,
	highest_bid = 7,
	bid_over_10 = 8,
	bid_over_5 = 9,
	bid_over_3 = 10,
	bids_over_10 = 11,
	bids_over_20 = 12,
	bids_over_5 = 13,
	partner_wl = 14,
	first_500 = 15,
	first_1000 = 16,
	climb_up_210_position = 17,
	climb_10_spots = 18,
	comeback_top_10 = 19,
	last_bid = 20,
	every_10th_position = 21,
	made_2nd_position = 22,
	made_3rd_bid = 23,
	made_4th_bid = 24,
	nbtc_every_21st_bidder = 25,
	dethrone = 26,
}
