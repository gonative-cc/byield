export interface NbtcOtcCfg {
	pkgId: string;
	vaultId: string;
	// module name
	module: string;
}

export interface BeelieversAuctionCfg {
	pkgId: string;
	auctionId: string;
	module: string;
}

export interface BeelieversMintCfg {
	pkgId: string;
	collectionId: string;
	transferPolicyId: string;
	// epoch time in ms
	mintStart: number;
}

export interface NbtcCfg {
	pkgId: string;
	coinType: string;
	contractId: string;
}

export interface ContractsCfg {
	explorer: string;
	accountExplorer: string;
	graphqlURL: string;
	nbtcOTC: NbtcOtcCfg;
	beelieversAuction: BeelieversAuctionCfg;
	beelieversMint: BeelieversMintCfg;
	nbtc: NbtcCfg;
}

export const mainnetCfg: ContractsCfg = {
	explorer: "https://suivision.xyz",
	accountExplorer: "https://suiscan.xyz/mainnet/account/",
	graphqlURL: "https://graphql.mainnet.sui.io/graphql",
	nbtcOTC: {
		pkgId: "",
		vaultId: "",
		module: "",
	},
	beelieversAuction: {
		pkgId: "0xff4982cd449809676699d1a52c5562fc15b9b92cb41bde5f8845a14647186704",
		auctionId: "0x161524be15687cca96dec58146568622458905c30479452351f231cac5d64c41",
		module: "auction",
	},
	beelieversMint: {
		pkgId: "0x3aeca4699ce5f914b56ee04b8ccd4b2eba1b93cabbab9f1a997735c52ef76253",
		collectionId: "0xe896f82d681a0562a3062fff61a72c3ac324be5a4f00fa6db0f9520a4124ce7b",
		transferPolicyId: "0xd9fe40ec079a6959940260c29be5a782cb79a7951906a0ac380a3961dbd78914",
		mintStart: 1757192460000,
	},
	nbtc: {
		coinType: "::nbtc::NBTC",
		pkgId: "",
		contractId: "",
	},
};

export const testnetCfg: ContractsCfg = {
	explorer: "https://testnet.suivision.xyz",
	accountExplorer: "https://suiscan.xyz/testnet/account/",
	graphqlURL: "https://graphql.testnet.sui.io/graphql",
	nbtcOTC: {
		pkgId: "0xac799dd8708c2882fcbe2191cfb27bdc9f7654d997ffaa9b530009349f698f3b",
		vaultId: "0x148a3a004f19aeea0b5df7ffc82a23935ff6cccca433e8e9c14c0f55595425e8",
		module: "nbtc_swap",
	},
	beelieversAuction: {
		pkgId: "0x749993f86193ec6314993b4988f4f7d03df7c74a68b4a8f78cc32f605284da8d",
		auctionId: "0x60f6241088efad8dea782dfbf0071aaf58cb1baa60388f4b5e66959f7eec7ef6",
		module: "auction",
	},
	beelieversMint: {
		pkgId: "0x5fd844048b810820390dd57af340b09cb6bf93a5b6f856fb4a5e8645011a342b",
		collectionId: "0x8d3c4ff21afc01584cbc04ee899d97e719734cc49721f08893506404730cd190",
		transferPolicyId: "0xa701e8257bdd1847462708c5c8d517c7975d57376e801789159af3ed5ae31083",
		mintStart: 1756899768721,
	},
	nbtc: {
		coinType: "::nbtc::NBTC",
		pkgId: "0x50be08b805766cc1a2901b925d3fb80b6362fcb25f269cb78067429237e222ec",
		contractId: "0x5905e0c452bb5f237fb106ec2ecff962fbc60cd180090fb07a79d14d9d628a96",
	},
};

// Localnet configuration for development
// To use localnet:
// 1. Start your local Sui network: `sui start --with-faucet --force-regenesis`
// 2. Deploy your contracts to localnet
// 3. Fill in the package IDs and object IDs below with your local deployment values
export const localnetCfg: ContractsCfg = {
	explorer: "http://localhost:9123",
	accountExplorer: "http://localhost:9123/account/",
	graphqlURL: "",
	nbtcOTC: {
		pkgId: "",
		vaultId: "",
		module: "nbtc_swap",
	},
	beelieversAuction: {
		pkgId: "",
		auctionId: "",
		module: "auction",
	},
	beelieversMint: {
		pkgId: "",
		collectionId: "",
		transferPolicyId: "",
		mintStart: Date.now(),
	},
	nbtc: {
		coinType: "::nbtc::NBTC",
		pkgId: "",
		contractId: "",
	},
};

export interface MoveCallCfg {
	pkgId: string;
	module: string;
}

// throws exception in pkgId or module is not set in cfg
export function moveCallTarget(cfg: MoveCallCfg, funName: string): string {
	if (!cfg.pkgId || !cfg.module)
		throw Error("cfg: MoveCallCfg is not set, expect pkgId and module to be defined");
	return `${cfg.pkgId}::${cfg.module}::${funName}`;
}
