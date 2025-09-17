import { useState } from "react";
import { ExtendedBitcoinNetworkType } from "~/hooks/useBitcoinConfig";
import testnetV2Config from "~/config/bitcoin-testnet-v2.json";
import devnetConfig from "~/config/bitcoin-devnet.json";
import mainnetConfig from "~/config/bitcoin-mainnet.json";

type BitcoinNetworkVariables =
	| typeof mainnetConfig
	| typeof devnetConfig
	| typeof testnetV2Config
	| Record<string, never>;

const getIndexerNetworkConfig = (network: ExtendedBitcoinNetworkType): BitcoinNetworkVariables => {
	switch (network) {
		case ExtendedBitcoinNetworkType.TestnetV2:
			return testnetV2Config;
		case ExtendedBitcoinNetworkType.Devnet:
			return devnetConfig;
		case ExtendedBitcoinNetworkType.Mainnet:
			return mainnetConfig;
		default:
			return {}; // Fallback for networks without specific config
	}
};

export function useIndexerNetwork() {
	// Default to TestnetV2 for nBTC indexer
	const [indexerNetwork, setIndexerNetwork] = useState<ExtendedBitcoinNetworkType>(
		ExtendedBitcoinNetworkType.TestnetV2,
	);

	const bitcoinConfig = getIndexerNetworkConfig(indexerNetwork);

	return {
		indexerNetwork,
		setIndexerNetwork,
		bitcoinConfig,
	};
}
