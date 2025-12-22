import { useState, useCallback } from "react";
import { storage } from "~/lib/storage";

export type SuiNetwork = "testnet" | "mainnet" | "localnet";

export const useSuiNetwork = () => {
	const [network, setNetworkState] = useState<SuiNetwork>(() => {
		const saved = storage.getSuiNetwork() as SuiNetwork;
		return saved || "testnet";
	});

	const selectNetwork = useCallback((newNetwork: SuiNetwork) => {
		setNetworkState(newNetwork);
		storage.setSuiNetwork(newNetwork);
		// Force page reload to switch Sui network
		window.location.reload();
	}, []);

	return { network, selectNetwork };
};
