import { DApp } from "./types";

export const vaults: DApp[] = [
	{
		name: "Desig Vault",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 11.71,
		chain: "30.555$",
		logo: "/assets/ui-icons/market/desigVault.svg",
	},
	{
		name: "Bucket Protocol",
		type: "LENDING",
		labels: ["Boosted", "Farming"],
		apy: 5.71,
		chain: "23.555$",
		logo: "/assets/ui-icons/market/bucketProtocol.svg",
	},
	{
		name: "Navi Protocol Vault",
		type: "LENDING",
		labels: ["Boosted", "Farming"],
		apy: 10.71,
		chain: "12.215$",
		logo: "/assets/ui-icons/market/naviProtocolValut.svg",
	},
	{
		name: "Splash",
		type: "LENDING",
		labels: ["Boosted", "Farming"],
		apy: 1.44,
		chain: "20.085$",
		logo: "/assets/ui-icons/market/splash.svg",
	},
	{
		name: "Pyth Network",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 9.71,
		chain: "27.715$",
		logo: "/assets/ui-icons/market/pythNetwork.svg",
	},
	{
		name: "Scallop",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 2.71,
		chain: "29.885$",
		logo: "/assets/ui-icons/market/scallop.svg",
	},
	{
		name: "BlueMove",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 2.71,
		chain: "11.235$",
		logo: "/assets/ui-icons/market/blueMove.svg",
	},
	{
		name: "OmniBTC",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 0.56,
		chain: "00.805$",
		logo: "/assets/ui-icons/market/omniBtc.svg",
	},
];

export const PRICE_PER_NBTC_IN_SUI = 25000n;
export const nBTCMintFeeInSatoshi = 10n;
export const NBTC_COINT_TYPE =
	"0x5419f6e223f18a9141e91a42286f2783eee27bf2667422c2100afc7b2296731b::nbtc::NBTC";
export const BUY_NBTC_GAS_FEE_IN_SUI = "0.01";

// sell nBTC
export const NBTC_TO_SELL = 2000n;
export const SUI_AMOUNT_RECEIVED_ON_SELL = NBTC_TO_SELL * (PRICE_PER_NBTC_IN_SUI / 2n);
