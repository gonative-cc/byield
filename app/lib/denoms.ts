// This file defines denoms and  the convertion factors.
//
import { parseUnits, formatUnits } from "@ethersproject/units";

export const BTC = 8; // BTC -> sats decimals
export const SUI = 9; // SUI -> mist decimals
export const NBTC = 8; // NBTC decimals
export const USDC = 6;

// Auction constants
export const MINIMUM_FIRST_BID_MIST = 1e9; // 1 SUI in mist for first-time bidders

// throws error when amount decimals are bigger then `decimals` or when amount is not a proper
// numeric string
export function parse(amount: string, decimals: number): bigint {
	const a = parseUnits(amount, decimals);
	return a.toBigInt();
}

export function parseBTC(amount: string): bigint {
	return parse(amount, BTC);
}

export function formatAmount(amount: number | bigint, decimals: number): string {
	return formatUnits(amount, decimals);
}

export function parseSUI(amount: string): bigint {
	return parse(amount, SUI);
}

export function formatBTC(amount: number | bigint): string {
	return formatUnits(amount, BTC);
}

export function formatSUI(amount: number | bigint | string): string {
	return formatUnits(amount, SUI);
}

export function parseNBTC(amount: string): bigint {
	return parse(amount, NBTC);
}

export function formatNBTC(amount: number | bigint): string {
	return formatUnits(amount, NBTC);
}
