import { createContext, useContext, type ReactNode } from "react";
import { useIndexerNetwork } from "~/hooks/useIndexerNetwork";
import { ExtendedBitcoinNetworkType } from "~/hooks/useBitcoinConfig";
import testnetV2Config from "~/config/bitcoin-testnet-v2.json";
import regtestConfig from "~/config/bitcoin-regtest.json";
import devnetConfig from "~/config/bitcoin-devnet.json";
import mainnetConfig from "~/config/bitcoin-mainnet.json";

type BitcoinNetworkVariables =
	| typeof mainnetConfig
	| typeof devnetConfig
	| typeof testnetV2Config
	| typeof regtestConfig
	| Record<string, never>;

interface IndexerNetworkContextType {
	indexerNetwork: ExtendedBitcoinNetworkType;
	setIndexerNetwork: (network: ExtendedBitcoinNetworkType) => void;
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
