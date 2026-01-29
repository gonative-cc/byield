interface Tier {
	tier: string;
	name: string;
	description: string;
	bonusPercentage?: number;
	points: number;
	totalPointsCumulative: number;
	requirement: string | number;
}

export interface SBTTier {
	operationTitle: string;
	campaignTitle: string;
	purpose: string;
	tiers: Tier[];
}

export interface LockdropTier extends Omit<SBTTier, "tiers"> {
	tiers: (Tier & { usdRequired: number })[];
}
