import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import swapTestNetConfig from "./config/swap/testnet.json";
import swapMainNetConfig from "./config/swap/mainnet.json";

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
