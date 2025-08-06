import { EligibilityTypeEnum } from "./types";

const MOCK_ELIGIBILITY_DATA = {
	isEligible: true,
	type: EligibilityTypeEnum.PARTNER_WHITELIST,
};

export function checkEligibility(addr: string) {
	console.info("Checking eligibility for addr", addr);
	return MOCK_ELIGIBILITY_DATA;
}
