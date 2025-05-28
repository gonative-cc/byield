import { parseUnits, formatUnits } from "@ethersproject/units";

export const BTC = 8; // BTC -> sats decimals
export const SUI = 9; // SUI -> mist decimals
export const USDC = 6;
export const SATOSHIS_PER_BTC = parseUnits("10", BTC).toBigInt();
export const MIST_PER_SUI = parseUnits("10", SUI).toBigInt();

export const parse = (amount: string, decimals: number): bigint => {
	const a = parseUnits(amount, decimals);
	return a.toBigInt();
};

export const parseBTC = (amount: string): bigint => {
	return parse(amount, BTC);
};

export const parseSUI = (amount: string): bigint => {
	return parse(amount, SUI);
};

export const parseMIST = (amount: string): bigint => {
	return parse(amount, 0);
};

export const format = (amount: bigint, decimals: number): string => {
	return formatUnits(amount, decimals);
};

export const formatBTC = (amount: bigint): string => {
	return formatUnits(amount, BTC);
};

export const formatSUI = (amount: bigint | string): string => {
	return formatUnits(amount, SUI);
};

export const suiToMist = (amountInSUI: string): bigint => {
	return parseUnits(amountInSUI, SUI).toBigInt();
};

export const mistToSUI = (amountInMIST: string | bigint): string => {
	return formatUnits(amountInMIST, SUI);
};
