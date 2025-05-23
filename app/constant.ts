import { DApp } from "./types";

export const vaults: DApp[] = [
	{
		name: "Desig Vault",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 11.71,
		chain: "30.555$",
		logo: "/public/assets/ui-icons/market/desigVault.svg",
	},
	{
		name: "Bucket Protocol",
		type: "LENDING",
		labels: ["Boosted", "Farming"],
		apy: 5.71,
		chain: "23.555$",
		logo: "/public/assets/ui-icons/market/bucketProtocol.svg",
	},
	{
		name: "Navi Protocol Vault",
		type: "LENDING",
		labels: ["Boosted", "Farming"],
		apy: 10.71,
		chain: "12.215$",
		logo: "/public/assets/ui-icons/market/naviProtocolValut.svg",
	},
	{
		name: "Splash",
		type: "LENDING",
		labels: ["Boosted", "Farming"],
		apy: 1.44,
		chain: "20.085$",
		logo: "/public/assets/ui-icons/market/splash.svg",
	},
	{
		name: "Pyth Network",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 9.71,
		chain: "27.715$",
		logo: "/public/assets/ui-icons/market/pythNetwork.svg",
	},
	{
		name: "Scallop",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 2.71,
		chain: "29.885$",
		logo: "/public/assets/ui-icons/market/scallop.svg",
	},
	{
		name: "BlueMove",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 2.71,
		chain: "11.235$",
		logo: "/public/assets/ui-icons/market/blueMove.svg",
	},
	{
		name: "OmniBTC",
		type: "DEX",
		labels: ["Boosted", "Farming"],
		apy: 0.56,
		chain: "00.805$",
		logo: "/public/assets/ui-icons/market/omniBtc.svg",
	},
];

export const PRICE_PER_NBTC_IN_SUI = 25000;
export const BUFFER_BALANCE = 10000000;
