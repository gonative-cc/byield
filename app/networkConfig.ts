import { getFullnodeUrl } from '@mysten/sui/client';
import { createNetworkConfig } from '@mysten/dapp-kit';
import { mainnetCfg, testnetCfg, localnetCfg } from './config/sui/contracts-config';

//
// Sui
//
const { networkConfig, useNetworkVariable, useNetworkVariables } = createNetworkConfig({
	testnet: {
		url: getFullnodeUrl('testnet'),
		variables: {
			...testnetCfg,
		},
	},
	mainnet: {
		url: getFullnodeUrl('mainnet'),
		variables: {
			...mainnetCfg,
		},
	},
	localnet: {
		url: getFullnodeUrl('localnet'),
		variables: {
			...localnetCfg,
		},
	},
});

export { useNetworkVariable, useNetworkVariables, networkConfig };
