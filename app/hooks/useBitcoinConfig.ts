import { useState, useEffect } from "react";
import type { BitcoinNetworkType } from "sats-connect";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import devnetConfig from "~/config/bitcoin-devnet.json";
import mainnetConfig from "~/config/bitcoin-mainnet.json";
import regtestConfig from "~/config/bitcoin-regtest.json";
import testnet4Config from "~/config/bitcoin-testnet4.json";

export type BitcoinNetworkVariables =
	| {
			bitcoinBroadcastLink: string;
			confirmationDepth: number;
			blockTimeSec: number;
			mempoolApiUrl: string;
			indexerUrl: string;
			btcRPCUrl: string;
			nBTC: {
				depositAddress: string;
			};
	  }
	| Record<string, never>;

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
		variables: {
			...testnet4Config,
		},
	},
	Signet: {
		variables: {},
	},
	// Regtest is localnet
	Regtest: {
		variables: {
			...regtestConfig,
		},
	},
};

export function useBitcoinConfig(): BitcoinNetworkVariables {
	const { network } = useXverseWallet();

	return getBitcoinNetworkConfig[network].variables;
}

export function useIndexerNetwork() {
	const { network } = useXverseWallet();

	const [indexerNetwork, setIndexerNetwork] = useState<BitcoinNetworkType | null>(
		network || null,
	);

	useEffect(() => {
		setIndexerNetwork(network || null);
	}, [network]);

	const bitcoinConfig = indexerNetwork ? getBitcoinNetworkConfig[indexerNetwork].variables : null;

	return {
		indexerNetwork,
		setIndexerNetwork: (network: BitcoinNetworkType | null) => setIndexerNetwork(network),
		bitcoinConfig,
	};
}
