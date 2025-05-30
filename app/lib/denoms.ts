// This file defines denoms and  the convertion factors.
//
import { parseUnits, formatUnits } from "@ethersproject/units";

export const BTC = 8; // BTC -> sats decimals
export const SUI = 9; // SUI -> mist decimals
export const USDC = 6;

export function parse(amount: string, decimals: number): bigint {
	const a = parseUnits(amount, decimals);
	return a.toBigInt();
}

export function parseBTC(amount: string): bigint {
	return parse(amount, BTC);
}

export function formatAmount(amount: bigint, decimals: number): string {
	return formatUnits(amount, decimals);
}

export function parseSUI(amount: string): bigint {
	return parse(amount, SUI);
}

export function formatBTC(amount: bigint): string {
	return formatUnits(amount, BTC);
}

export function formatSUI(amount: bigint | string): string {
	return formatUnits(amount, SUI);
}
