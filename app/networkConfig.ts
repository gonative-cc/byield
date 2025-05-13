import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import swapTestNetConfig from "./config/sui/contracts-testnet.json";
import swapMainNetConfig from "./config/sui/contracts-mainnet.json";

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
			hello: "hello",
			...swapMainNetConfig,
		},
	},
});

export { useNetworkVariable, useNetworkVariables, networkConfig };
