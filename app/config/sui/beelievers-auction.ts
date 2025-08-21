// put it in other place so we can reuse it
type SuiNet = "mainnet" | "testnet" | "localnet";

interface AuctionConfig {
	pkId: string;
	fallbackIndexerUrl: string;
}

const dummyConfig: AuctionConfig = {
	pkId: "pkId",
	fallbackIndexerUrl: "website",
};

export const config: Record<SuiNet, AuctionConfig> = {
	mainnet: dummyConfig,
	testnet: dummyConfig,
	localnet: dummyConfig,
};

// TODO
// have single in TS rather than app/config/sui/contracts-testnet.json#L7
