import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import devnetConfig from "~/config/bitcoin-devnet.json";
import mainnetConfig from "~/config/bitcoin-mainnet.json";
import testnetV2Config from "~/config/bitcoin-testnet-v2.json";

export enum ExtendedBitcoinNetworkType {
	Mainnet = "Mainnet",
	Testnet = "Testnet",
	Testnet4 = "Testnet4",
	TestnetV2 = "TestnetV2",
	Regtest = "Regtest",
	Devnet = "Devnet",
}

export interface BitcoinConfigBase {
	bitcoinBroadcastLink: string;
	confirmationThreshold: number;
	blockTime?: number;
	nBTC: {
		depositAddress: string;
		packageId?: string;
		indexerUrl?: string;
	};
}

type BitcoinNetworkVariables = BitcoinConfigBase | Record<string, never>;

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
	TestnetV2: {
		variables: {
			...testnetV2Config, // New testnet-v2 with indexer integration
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
