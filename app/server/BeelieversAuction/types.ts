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

export interface User_ {
	rank: number | null; // null => outside of the winning list
	// amount bid in MIST. 0 => no bid placed
	amount: number;
	badges: Badge[];
	note: string;
	bids: number;
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
	// dynamic: is in the top* position "now"
	first_place = 1,
	top_3 = 2,
	top_10 = 3,
	top_21 = 4,
	top_100 = 5,
	top_5810 = 6, // beeliever
	highest_bid = 7, // TODO

	// static: diff bids: put X coin to the bid.
	bid_over_10 = 8,
	bid_over_5 = 9,
	bid_over_3 = 10,

	// dynamic: how many bids
	made_2_bids = 23,
	made_3_bids = 24,
	made_4_bids = 25,
	made_5_bids = 13,
	made_10_bids = 11,
	made_20_bids = 12,

	// dynamic, TODO
	partner_wl = 14, // done through WL status

	// first ever bids made
	first_500 = 15,
	first_1000 = 16,

	// dynamic
	climb_up_210 = 17,
	climb_up_10 = 18,

	// dynamic
	last_bid = 20,
	every_10th_position = 21,
	nbtc_every_21st_bidder = 22,

	// static
	dethrone = 26,
}
