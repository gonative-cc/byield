export interface AuctionInfo {
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
	// number of items in the auction
	auctionSize: number;
}

export enum AuctionAccountType {
	DEFAULT = 0,
	PARTNER_WHITELIST = 2,
	TESTNET_WHITELIST = 1,
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
	details: AuctionInfo;
	leaderboard: Bidder[];
	user: User | null;
}

// TODO move to controller
export interface LoaderDataResp extends LoaderData {
	error?: Error;
}

export enum Badge {
	// have been in top* at any point in time
	first_place = 1,
	top_3 = 2,
	top_10 = 3,
	top_21 = 4,
	top_100 = 5,
	top_5810 = 6, // beeliever
	highest_bid = 7, // NOT DONE -> first_place has it
	// diff bids:
	bid_over_10 = 8,
	bid_over_5 = 9,
	bid_over_3 = 10,

	// how many bids, TODO: verify, not done
	bids_over_10 = 11,
	bids_over_20 = 12,
	bids_over_5 = 13,
	// TODO: not done, same as above?
	made_2nd_bid = 23, // TODO - wrong description
	made_3rd_bid = 24,
	made_4th_bid = 25,

	partner_wl = 14, // done through WL status

	// first ever bids made, TODO: maybe we should change to 1000 and 2100?
	first_500 = 15,
	first_1000 = 16,

	climb_up_210 = 17,
	climb_up_10 = 18,

	// TODO: final calculation
	last_bid = 20,
	every_10th_position = 21,
	nbtc_every_21st_bidder = 22,

	dethrone = 26, // NOT done
}
