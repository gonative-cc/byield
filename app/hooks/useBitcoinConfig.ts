import { BitcoinNetworkType } from "sats-connect";
import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import regtestConfig from "~/config/bitcoin-regtest.json";

export interface BitcoinConfig {
	bitcoinBroadcastLink: string;
	confirmationDepth: number;
	blockTimeSec: number;
	mempoolApiUrl: string;
	indexerUrl: string;
	btcRPCUrl: string;
	minerFeeSats?: number;
	nBTC: {
		depositAddress: string;
		mintingFee: number;
	};
}

// TODO: this should be in /app/config!
const bitcoinConfigs: Record<BitcoinNetworkType, BitcoinConfig | undefined> = {
	Mainnet: undefined,
	Testnet: undefined,
	Testnet4: undefined,
	Signet: undefined,
	Regtest: { ...regtestConfig },
};

// return config for related Bitcoin network. Throws an error if network is not supported.
export function mustGetBitcoinConfig(network: BitcoinNetworkType): BitcoinConfig {
	const cfg = bitcoinConfigs[network];
	if (cfg === undefined) {
		throw new Error("`Not supported Bitcoin network: " + network);
	}
	return cfg;
}

// TODO: we can move it to ../networkConfig.ts
export function useBitcoinConfig(): BitcoinConfig {
	const { network } = useXverseWallet();
	return mustGetBitcoinConfig(network);
}
export default useBitcoinConfig;
