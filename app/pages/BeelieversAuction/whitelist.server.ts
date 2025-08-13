import { AuctionAccountType } from "./types";

// Mock whitelist data - replace with actual whitelist logic
const PARTNER_WHITELIST = [
	// Add actual partner addresses here
	"0x1234567890abcdef1234567890abcdef12345678",
];

const TESTNET_WHITELIST = [
	// Add actual testnet addresses here
	"0xabcdef1234567890abcdef1234567890abcdef12",
];

export function checkEligibility(addr: string) {
	if (!addr) {
		return {
			type: AuctionAccountType.DEFAULT,
		};
	}

	// Check if address is in partner whitelist
	if (PARTNER_WHITELIST.includes(addr)) {
		return {
			type: AuctionAccountType.PARTNER_WHITELIST,
		};
	}

	// Check if address is in testnet whitelist
	if (TESTNET_WHITELIST.includes(addr)) {
		return {
			type: AuctionAccountType.TESTNET_WHITELIST,
		};
	}

	// Default to non-whitelist but still eligible to participate
	return {
		type: AuctionAccountType.DEFAULT,
	};
}
