import { BitcoinNetworkType } from "sats-connect";

import { useXverseWallet } from "~/components/Wallet/XverseWallet/useWallet";
import regtestConfig from "~/config/bitcoin-regtest.json";
import * as validate from "~/lib/validate";

export interface BitcoinConfig {
	confirmationDepth: number;
	blockTimeSec: number;
	bitcoinBroadcastLink: string;
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
export const bitcoinConfigs: Record<BitcoinNetworkType, BitcoinConfig | undefined> = {
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
	const err = verify(cfg);
	if (err !== null) throw err;
	return cfg;
}

// TODO: we can move it to ../networkConfig.ts
export function useBitcoinConfig(): BitcoinConfig {
	const { network } = useXverseWallet();
	return mustGetBitcoinConfig(network);
}
export default useBitcoinConfig;

function verify(cfg: BitcoinConfig): Error | null {
	const errors = [];
	if (cfg.confirmationDepth < 0) errors.push("confirmationDepth must be >= 0");
	if (cfg.blockTimeSec === 0) errors.push("blockTimeSec must be bigger than 0");
	if (!validate.url(cfg.bitcoinBroadcastLink)) errors.push("bitcoinBroadcastLink is not valid");
	if (!validate.url(cfg.mempoolApiUrl)) errors.push("mempoolApiUrl is not valid");
	if (!validate.url(cfg.indexerUrl)) errors.push("indexerUrl is not valid");
	if (!validate.url(cfg.btcRPCUrl)) errors.push("btcRPCUrl is not valid");
	if (!cfg.nBTC.depositAddress) errors.push("nbtc.depositAddress is not set");
	if (cfg.nBTC.mintingFee < 0) errors.push("nbtc.mintingFee is not set");
	if (errors.length > 0) return new Error("Invalid BitcoinConfig: " + JSON.stringify(errors));

	return null;
}
