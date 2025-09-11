import { getFullnodeUrl } from "@mysten/sui/client";
import { createNetworkConfig } from "@mysten/dapp-kit";
import { mainnetCfg, testnetCfg } from "./config/sui/contracts-config";

const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
	testnet: {
		url: getFullnodeUrl("testnet"),
		variables: {
			...testnetCfg,
		},
	},
	mainnet: {
		url: getFullnodeUrl("mainnet"),
		variables: {
			...mainnetCfg,
		},
	},
});

export { useNetworkVariable, useNetworkVariables, networkConfig };
