import { useState, useEffect } from "react";
import { ExtendedBitcoinNetworkType } from "~/hooks/useBitcoinConfig";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
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

const getIndexerNetworkConfig = (network: ExtendedBitcoinNetworkType): BitcoinNetworkVariables => {
	switch (network) {
		case ExtendedBitcoinNetworkType.TestnetV2:
			return testnetV2Config;
		case ExtendedBitcoinNetworkType.Regtest:
			return regtestConfig;
		case ExtendedBitcoinNetworkType.Devnet:
			return devnetConfig;
		case ExtendedBitcoinNetworkType.Mainnet:
			return mainnetConfig;
		case ExtendedBitcoinNetworkType.Testnet:
		case ExtendedBitcoinNetworkType.Testnet4:
			return testnetV2Config;
		default:
			return testnetV2Config;
	}
};

export function useIndexerNetwork() {
	const { network } = useXverseWallet();

	const [indexerNetwork, setIndexerNetwork] = useState<ExtendedBitcoinNetworkType>(
		network || ExtendedBitcoinNetworkType.TestnetV2,
	);

	useEffect(() => {
		if (network) {
			setIndexerNetwork(network);
		}
	}, [network]);

	const bitcoinConfig = getIndexerNetworkConfig(indexerNetwork);

	return {
		indexerNetwork,
		setIndexerNetwork,
		bitcoinConfig,
	};
}
