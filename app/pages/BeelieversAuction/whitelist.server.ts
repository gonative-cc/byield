import { EligibilityTypeEnum } from "./types";

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
	console.info("Checking eligibility for addr", addr);

	if (!addr) {
		return {
			isEligible: false,
			type: EligibilityTypeEnum.NON_WHITELIST_ADDRESS,
		};
	}

	// Check if address is in partner whitelist
	if (PARTNER_WHITELIST.includes(addr)) {
		return {
			isEligible: true,
			type: EligibilityTypeEnum.PARTNER_WHITELIST,
		};
	}

	// Check if address is in testnet whitelist
	if (TESTNET_WHITELIST.includes(addr)) {
		return {
			isEligible: true,
			type: EligibilityTypeEnum.TESTNET_WHITELIST_ADDRESS,
		};
	}

	// Default to non-whitelist but still eligible to participate
	return {
		isEligible: true,
		type: EligibilityTypeEnum.NON_WHITELIST_ADDRESS,
	};
}
