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
	minMintInSats: number;
}

const mainnetCfg: BitcoinConfig = {
	bitcoinBroadcastLink: "https://mempool.space/tx/",
	confirmationDepth: 6,
	blockTimeSec: 600,
	mempoolApiUrl: "https://mempool.space/api/v1",
	minerFeeSats: 1000,
	nBTC: {
		// TODO: update nBTC deposit address when available
		depositAddress: "update it when available",
		mintingFee: 10,
	},
	indexerUrl: "https://mempool.space",
	btcRPCUrl: "https://bitcoin-rpc.publicnode.com",
	minMintInSats: 1000,
};

const devnetCfg: BitcoinConfig = {
	bitcoinBroadcastLink: "https://bitcoin-devnet.gonative.cc/tx/",
	confirmationDepth: 4,
	blockTimeSec: 120,
	mempoolApiUrl: "https://bitcoin-devnet.gonative.cc",
	minerFeeSats: 1000,
	nBTC: {
		depositAddress: "bcrt1q90xm34jqm0kcpfclkdmn868rw6vcv9fzvfg6p6",
		mintingFee: 1000,
	},
	indexerUrl: "https://btcindexer.gonative-cc.workers.dev:443",
	btcRPCUrl: "https://bitcoin-devnet.gonative.cc",
	minMintInSats: 1000,
};

const testnetCfg: BitcoinConfig = {
	bitcoinBroadcastLink: "https://mempool.space/testnet/tx/",
	confirmationDepth: 6,
	blockTimeSec: 600,
	mempoolApiUrl: "https://mempool.space/testnet/api/v1",
	minerFeeSats: 1000,
	nBTC: {
		// TODO: update nBTC deposit address when available
		depositAddress: "update it when available",
		mintingFee: 10,
	},
	indexerUrl: "https://mempool.space/testnet",
	btcRPCUrl: "https://bitcoin-testnet-rpc.publicnode.com",
	minMintInSats: 1000,
};

export const bitcoinConfigs: Record<BitcoinNetworkType, BitcoinConfig | undefined> = {
	Mainnet: mainnetCfg,
	Testnet: testnetCfg,
	Testnet4: undefined,
	Signet: undefined,
	Regtest: devnetCfg,
};
