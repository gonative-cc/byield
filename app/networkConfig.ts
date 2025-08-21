import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import testnetConfig from "./config/sui/contracts-testnet.json";
import mainnetConfig from "./config/sui/contracts-mainnet.json";

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
	testnet: {
		url: getFullnodeUrl("testnet"),
		variables: {
			...testnetConfig,
		},
	},
	mainnet: {
		url: getFullnodeUrl("mainnet"),
		variables: {
			...mainnetConfig,
		},
	},
});

export { useNetworkVariable, useNetworkVariables, networkConfig };
