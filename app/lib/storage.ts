const STORAGE_KEYS = {
	XVERSE_NETWORK: "xverse_network",
	SUI_NETWORK: "sui_network",
};

export const storage = {
	getXverseNetwork: (): string | null => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(STORAGE_KEYS.XVERSE_NETWORK);
	},

	setXverseNetwork: (network: string) => {
		if (typeof window === "undefined") return;
		localStorage.setItem(STORAGE_KEYS.XVERSE_NETWORK, network);
	},

	getSuiNetwork: (): string | null => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(STORAGE_KEYS.SUI_NETWORK);
	},

	setSuiNetwork: (network: "testnet" | "mainnet" | "localnet" | null) => {
		if (typeof window === "undefined" || !network) return;
		localStorage.setItem(STORAGE_KEYS.SUI_NETWORK, network);
	},
};
