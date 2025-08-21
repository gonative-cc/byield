export type SuiNet = "mainnet" | "testnet" | "localnet";

export interface AuctionNetworkConfig {
	packageId: string;
	auctionId: string;
	fallbackIndexerUrl: string;
}

const testnetConfig: AuctionNetworkConfig = {
	packageId: "0x40af41f362a7ed22c78038c4ef637007d5b2875dbf103b35f3fe1e98443df048",
	auctionId: "0xe3ef11c8a21557f3d26c2f74b63c23e1fb9f01a4ecf045e1720f8b4cdc68412a",
	fallbackIndexerUrl: "https://sui-testnet-endpoint.blockvision.org/",
};

const mainnetConfig: AuctionNetworkConfig = {
	packageId: "", // TODO: Add mainnet packageId
	auctionId: "", // TODO: Add mainnet auctionId
	fallbackIndexerUrl: "https://sui-mainnet-endpoint.blockvision.org",
};

export const networkConfig: Record<SuiNet, AuctionNetworkConfig> = {
	mainnet: mainnetConfig,
	testnet: testnetConfig,
	localnet: testnetConfig, // TODO: add localnet config if needed
};
