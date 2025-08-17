export enum AuctionAccountType {
	PARTNER_WHITELIST = "PARTNER_WHITELIST",
	TESTNET_WHITELIST = "TESTNET_WHITELIST_ADDRESS",
	DEFAULT = "DEFAULT",
}

export interface EligibilityData {
	type?: AuctionAccountType;
	isError?: boolean;
}

export enum AuctionState {
	WILL_START = "WILL_START",
	STARTED = "STARTED",
	ENDED = "ENDED",
}

export interface LeaderboardResponse {
	leaders: any[];
	unique_bidders: number;
	total_bids: number;
	highest_bid: number;
	entry_bid: number;
	auction_start_ms: number;
	auction_end_ms: number;
}
