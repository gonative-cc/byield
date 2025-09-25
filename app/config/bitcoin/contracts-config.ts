import type { BitcoinNetworkType } from "sats-connect";

export interface NBTCConfig {
	depositAddress: string;
	mintingFee: number;
}

export interface BitcoinConfig {
	bitcoinBroadcastLink: string;
	confirmationDepth: number;
	blockTimeSec: number;
	mempoolApiUrl: string;
	minerFeeSats: number;
	nBTC: NBTCConfig;
	indexerUrl: string;
	btcRPCUrl: string;
}

export const mainnetCfg: BitcoinConfig = {
	bitcoinBroadcastLink: "https://mempool.space/tx/",
	confirmationDepth: 6,
	blockTimeSec: 600,
	mempoolApiUrl: "",
	minerFeeSats: 1000,
	nBTC: {
		depositAddress: "",
		mintingFee: 10,
	},
	indexerUrl: "",
	btcRPCUrl: "",
};

export const regtestCfg: BitcoinConfig = {
	bitcoinBroadcastLink: "http://142.93.46.134:3002/tx/",
	confirmationDepth: 4,
	blockTimeSec: 120,
	mempoolApiUrl: "http://142.93.46.134:3002",
	minerFeeSats: 1000,
	nBTC: {
		depositAddress: "bcrt1q90xm34jqm0kcpfclkdmn868rw6vcv9fzvfg6p6",
		mintingFee: 10,
	},
	indexerUrl: "https://btcindexer.gonative-cc.workers.dev:443",
	btcRPCUrl: "http://142.93.46.134:3002",
};

export const bitcoinConfigs: Record<BitcoinNetworkType, BitcoinConfig | undefined> = {
	Mainnet: mainnetCfg,
	Testnet: undefined,
	Testnet4: undefined,
	Signet: undefined,
	Regtest: regtestCfg,
};
