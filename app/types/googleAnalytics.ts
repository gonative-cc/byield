export type eventParam = {
	label: string;
	category: GA_CATEGORY;
	[key: string]: string | number;
};

export enum GA_EVENT_NAME {
	BUY_NBTC = "TESTNET_BUY_NBTC",
}

export enum GA_CATEGORY {
	BUY_NBTC_SUCCESS = "SUCCESS",
	BUY_NBTC_ERROR = "ERROR",
}
