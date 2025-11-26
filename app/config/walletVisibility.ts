interface WalletVisibility {
	bitcoin: boolean;
	sui: boolean;
}

export const routes: Record<string, WalletVisibility> = {
	"/": {
		bitcoin: false,
		sui: true,
	},
	"/market": {
		bitcoin: true,
		sui: true,
	},
	"/nbtc/mint": {
		bitcoin: true,
		sui: true,
	},
	"/beelievers-auction": {
		bitcoin: false,
		sui: true,
	},
	"/hive": {
		bitcoin: false,
		sui: true,
	},
};
