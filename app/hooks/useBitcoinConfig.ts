import React from "react";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import devnetConfig from "~/config/bitcoin-devnet.json";
import mainnetConfig from "~/config/bitcoin-mainnet.json";
import testnetV2Config from "~/config/bitcoin-testnet-v2.json";
import regtestConfig from "~/config/bitcoin-regtest.json";

export enum ExtendedBitcoinNetworkType {
	Mainnet = "Mainnet",
	Testnet = "Testnet",
	TestnetV2 = "TestnetV2",
	Testnet4 = "Testnet4",
	Regtest = "Regtest",
	Devnet = "Devnet",
}

type BitcoinNetworkVariables =
	| typeof mainnetConfig
	| typeof devnetConfig
	| typeof testnetV2Config
	| typeof regtestConfig
	| Record<string, never>;

interface NetworkConfig {
	variables: BitcoinNetworkVariables;
}

const getBitcoinNetworkConfig: Record<ExtendedBitcoinNetworkType, NetworkConfig> = {
	Devnet: {
		variables: {
			...devnetConfig,
		},
	},
	Mainnet: {
		variables: {
			...mainnetConfig,
		},
	},
	Testnet: {
		variables: {
			...testnetV2Config,
		},
	},
	TestnetV2: {
		variables: {
			...testnetV2Config,
		},
	},
	Testnet4: {
		variables: {
			...testnetV2Config,
		},
	},
	Regtest: {
		variables: {
			...regtestConfig,
		},
	},
};

export function useBitcoinConfig(): BitcoinNetworkVariables {
	const { network } = useXverseWallet();

	const config = getBitcoinNetworkConfig[network];

	const networkRef = React.useRef(network);
	if (networkRef.current !== network) {
		networkRef.current = network;
	}

	if (!config || !config.variables || Object.keys(config.variables).length === 0) {
		const fallbackConfig =
			getBitcoinNetworkConfig[ExtendedBitcoinNetworkType.TestnetV2].variables;
		return fallbackConfig;
	}

	return config.variables;
}
