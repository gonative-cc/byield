export enum EligibilityTypeEnum {
	PARTNER_WHITELIST = "PARTNER_WHITELIST",
	TESTNET_WHITELIST_ADDRESS = "TESTNET_WHITELIST_ADDRESS",
	NON_WHITELIST_ADDRESS = "NON_WHITELIST_ADDRESS",
}

const MOCK_ELIGIBILITY_DATA = {
	isEligible: true,
	type: EligibilityTypeEnum.PARTNER_WHITELIST,
};

export function checkEligibility(addr: string) {
	console.info("Checking eligibility for addr", addr);
	return MOCK_ELIGIBILITY_DATA;
}
