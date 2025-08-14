export enum AuctionAccountType {
	PARTNER_WHITELIST = "PARTNER_WHITELIST",
	TESTNET_WHITELIST = "TESTNET_WHITELIST_ADDRESS",
	DEFAULT = "DEFAULT",
}

export interface Bidder {
	rank: number;
	bidder: string;
	amount: string;
	note?: string;
}

export interface LeaderboardData {
	unique_bidders: number;
	total_bids: number;
	highest_bid: number;
	entry_bid: number;
	auction_end_ms: number;
}

export interface LeaderboardResponse {
	isError: boolean;
	leaders: Bidder[];
	unique_bidders: number;
	total_bids: number;
	highest_bid: number;
	entry_bid: number;
	auction_end_ms: number;
}

export interface EligibilityData {
	type?: AuctionAccountType;
	isError?: boolean;
}
