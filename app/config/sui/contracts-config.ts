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
}

export interface ContractsCfg {
	explorer: string;
	accountExplorer: string;
	nbtcOTC: NbtcOtcCfg;
	beelieversAuction: BeelieversAuctionCfg;
	beelieversMint: BeelieversMintCfg;
	nbtc: NbtcCfg;
}

export const mainnetCfg: ContractsCfg = {
	explorer: "https://suivision.xyz",
	accountExplorer: "https://suiscan.xyz/mainnet/account/",
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
	},
};

export const testnetCfg: ContractsCfg = {
	explorer: "https://testnet.suivision.xyz",
	accountExplorer: "https://suiscan.xyz/testnet/account/",
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
		pkgId: "0x55be1b4afbbb00a24ac3a6353f1dadf28c5ab756db6e54d7d3ae5a0b7e88d5e9",
		collectionId: "0xe007c02191ef3a3022adda1ad18dca149bcf676db5112746ed40e8de12bde718",
		transferPolicyId: "0x7daca888ce6a93d0b24f685e1f652b587faefb8e80d9badcbf19cf09bf844941",
		mintStart: 1756899768721,
	},
	nbtc: {
		coinType: "::nbtc::NBTC",
		pkgId: "0x5419f6e223f18a9141e91a42286f2783eee27bf2667422c2100afc7b2296731b",
	},
};

export interface MoveCallCfg {
	pkgId: string;
	module: string;
}

export function moveCallTarget(cfg: MoveCallCfg, funName: string): string {
	return `${cfg.pkgId}::${cfg.module}::${funName}`;
}
