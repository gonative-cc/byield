import { useState, useEffect } from "react";
import type { BitcoinNetworkType } from "sats-connect";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import devnetConfig from "~/config/bitcoin-devnet.json";
import mainnetConfig from "~/config/bitcoin-mainnet.json";

type BitcoinNetworkVariables = typeof mainnetConfig | typeof devnetConfig | Record<string, never>;

interface NetworkConfig {
	variables: BitcoinNetworkVariables;
}

export const getBitcoinNetworkConfig: Record<BitcoinNetworkType, NetworkConfig> = {
	Mainnet: {
		variables: {
			...mainnetConfig,
		},
	},
	Testnet: {
		variables: {},
	},
	Testnet4: {
		variables: {},
	},
	Signet: {
		variables: {},
	},
	// Regtest is localnet
	Regtest: {
		variables: {
			...devnetConfig,
		},
	},
};

export function useIndexerNetwork() {
	const { network } = useXverseWallet();

	const [indexerNetwork, setIndexerNetwork] = useState<BitcoinNetworkType>(network || "Testnet");

	useEffect(() => {
		if (network) {
			setIndexerNetwork(network);
		}
	}, [network]);

	const bitcoinConfig = getBitcoinNetworkConfig[indexerNetwork].variables;

	return {
		indexerNetwork,
		setIndexerNetwork,
		bitcoinConfig,
	};
}
