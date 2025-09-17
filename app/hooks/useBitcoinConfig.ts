import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import devnetConfig from "~/config/bitcoin-devnet.json";
import mainnetConfig from "~/config/bitcoin-mainnet.json";
import testnetV2Config from "~/config/bitcoin-testnet-v2.json";

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
		variables: {},
	},
	TestnetV2: {
		variables: {
			...testnetV2Config,
		},
	},
	Testnet4: {
		variables: {},
	},
	// Regtest is localnet
	Regtest: {
		variables: {},
	},
};

export function useBitcoinConfig(): BitcoinNetworkVariables {
	const { network } = useXverseWallet();

	return getBitcoinNetworkConfig[network].variables;
}
