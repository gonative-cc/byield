import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import devnetConfig from "~/config/bitcoin-devnet.json";
import mainnetConfig from "~/config/bitcoin-mainnet.json";

export enum ExtendedBitcoinNetworkType {
	Mainnet = "Mainnet",
	Testnet = "Testnet",
	Testnet4 = "Testnet4",
	Regtest = "Regtest",
	Devnet = "Devnet",
}

type BitcoinNetworkVariables = typeof mainnetConfig | typeof devnetConfig | Record<string, never>;

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
			...devnetConfig, // Use devnet config for testnet
		},
	},
	Testnet4: {
		variables: {
			...devnetConfig, // Use devnet config for testnet4
		},
	},
	// Regtest is localnet
	Regtest: {
		variables: {
			...devnetConfig, // Use devnet config for regtest
		},
	},
};

export function useBitcoinConfig(): BitcoinNetworkVariables {
	const { network } = useXverseWallet();

	return getBitcoinNetworkConfig[network].variables;
}
