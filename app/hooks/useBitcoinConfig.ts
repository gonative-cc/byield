import { useState, useEffect } from "react";
import type { BitcoinNetworkType } from "sats-connect";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import regtestConfig from "~/config/bitcoin-regtest.json";

export type BitcoinNetworkVariables =
	| {
			bitcoinBroadcastLink: string;
			confirmationDepth: number;
			blockTimeSec: number;
			mempoolApiUrl: string;
			indexerUrl: string;
			btcRPCUrl: string;
			minerFeeSats?: number;
			nBTC: {
				depositAddress: string;
				mintingFee?: number;
			};
	  }
	| Record<string, never>;

interface NetworkConfig {
	variables: BitcoinNetworkVariables;
}

export const getBitcoinNetworkConfig: Record<BitcoinNetworkType, NetworkConfig> = {
	Mainnet: { variables: {} },
	Testnet: { variables: {} },
	Testnet4: { variables: {} },
	Signet: { variables: {} },
	Regtest: { variables: { ...regtestConfig } },
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
