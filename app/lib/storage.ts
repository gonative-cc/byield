import type { SuiNetwork } from "~/hooks/useSuiNetwork";

const STORAGE_KEYS = {
	XVERSE_NETWORK: "xverse_network",
	SUI_NETWORK: "sui_network",
};

const ALLOWED_SUI_NETWORKS = ["testnet", "mainnet", "localnet"];

const isValidSuiNetwork = (value: SuiNetwork): boolean => {
	if (value === null) return false;
	return ALLOWED_SUI_NETWORKS.includes(value);
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

	getSuiNetwork: (): SuiNetwork | null => {
		if (typeof window === "undefined") return null;
		const cachedSuiNetwork = localStorage.getItem(STORAGE_KEYS.SUI_NETWORK) as SuiNetwork;
		if (isValidSuiNetwork(cachedSuiNetwork)) return cachedSuiNetwork;
		return null;
	},

	setSuiNetwork: (network: SuiNetwork | null) => {
		if (typeof window === "undefined" || !network) return;
		localStorage.setItem(STORAGE_KEYS.SUI_NETWORK, network);
	},
};
