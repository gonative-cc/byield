import type { AuctionAccountType } from "~/server/BeelieversAuction/types";

export interface EligibilityData {
	type?: AuctionAccountType;
	isError?: boolean;
}

export enum AuctionState {
	WILL_START = "WILL_START",
	STARTED = "STARTED",
	ENDED = "ENDED",
}
