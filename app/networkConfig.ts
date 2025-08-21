import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import swapTestNetConfig from "./config/sui/contracts-testnet.json";
import swapMainNetConfig from "./config/sui/contracts-mainnet.json";

// TODO: move this file to config/ or providers/ByieldWalletProvider.tsx

// TODO Stan: use info from config/sui/
const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
	testnet: {
		url: getFullnodeUrl("testnet"),
		variables: {
			...swapTestNetConfig,
		},
	},
	mainnet: {
		url: getFullnodeUrl("mainnet"),
		variables: {
			...swapMainNetConfig,
		},
	},
});

export { useNetworkVariable, useNetworkVariables, networkConfig };
