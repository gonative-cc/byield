type eventParam = {
	label: string;
	category: BYIELD_GA_CATEGORY;
	[key: string]: string | number;
};

enum BYIELD_GA_EVENT_NAME {
	BUY_NBTC = "BUY_NBTC",
}

enum BYIELD_GA_CATEGORY {
	BUY_NBTC_SUCCESS = "BUY_NBTC_SUCCESS",
	BUY_NBTC_ERROR = "BUY_NBTC_ERROR",
}

export { BYIELD_GA_EVENT_NAME, BYIELD_GA_CATEGORY };
export type { eventParam };
