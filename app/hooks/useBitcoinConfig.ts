import type { BitcoinNetworkType } from "sats-connect";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import devnetConfig from "~/config/bitcoin-devnet.json";
import mainnetConfig from "~/config/bitcoin-mainnet.json";

type BitcoinNetworkVariables = typeof mainnetConfig | typeof devnetConfig | Record<string, never>;

interface NetworkConfig {
	variables: BitcoinNetworkVariables;
}

const getBitcoinNetworkConfig: Record<BitcoinNetworkType, NetworkConfig> = {
	// regtest is devnet config
	Regtest: {
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
	Testnet4: {
		variables: {},
	},
	Signet: {
		variables: {},
	},
};

export function useBitcoinConfig(): BitcoinNetworkVariables {
	const { network } = useXverseWallet();

	return getBitcoinNetworkConfig[network].variables;
}
