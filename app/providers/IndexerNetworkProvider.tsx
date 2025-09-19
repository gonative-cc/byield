import { createContext, useContext, type ReactNode } from "react";
import type { BitcoinNetworkType } from "sats-connect";
import { useIndexerNetwork } from "~/hooks/useIndexerNetwork";
import devnetConfig from "~/config/bitcoin-devnet.json";
import mainnetConfig from "~/config/bitcoin-mainnet.json";

type BitcoinNetworkVariables = typeof mainnetConfig | typeof devnetConfig | Record<string, never>;

interface IndexerNetworkContextType {
	indexerNetwork: BitcoinNetworkType;
	setIndexerNetwork: (network: BitcoinNetworkType) => void;
	bitcoinConfig: BitcoinNetworkVariables;
}

const IndexerNetworkContext = createContext<IndexerNetworkContextType | null>(null);

export function IndexerNetworkProvider({ children }: { children: ReactNode }) {
	const indexerNetworkData = useIndexerNetwork();

	return (
		<IndexerNetworkContext.Provider value={indexerNetworkData}>{children}</IndexerNetworkContext.Provider>
	);
}

export function useIndexerNetworkContext() {
	const context = useContext(IndexerNetworkContext);
	if (!context) {
		throw new Error("useIndexerNetworkContext must be used within IndexerNetworkProvider");
	}
	return context;
}
