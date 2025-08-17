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

export interface User {
	rank: number | null; // null => outside of the winning list
	// amount bid in MIST. 0 => no bid placed
	amount: number;
	badges: string[];
	note: string;
}

export interface Bidder extends User {
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
