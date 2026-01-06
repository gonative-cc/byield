interface SocialClaimedSbt {
	level: number;
	sbtId: number;
	title: string;
	taskName: string;
	points: number;
}

interface ReferralClaimedSbt extends SocialClaimedSbt {
	invitesRequired: number;
	claimed: boolean;
}

interface LockdropClaimedSbt extends SocialClaimedSbt {
	usdRequired: number;
}

interface Invitee {
	suiAddress: string;
	inviteDate: string;
}

export interface UserSbtData {
	suiAddress: string;
	referralLink: string;
	sbtCount: number;
	totalRawPoints: number;
	inviteeCount: number;
	claimedSocialSbts: SocialClaimedSbt[];
	claimedReferralSbts: ReferralClaimedSbt[];
	claimedLockdropSbts: LockdropClaimedSbt[];
	invitees: Invitee[];
}

export interface Response<T> {
	code: number;
	message: string;
	data: T;
	isError: boolean;
}

interface UserUSDCTotalDepositNode {
	contents: {
		json: {
			total_amount: string;
			user: string;
			coin_type: {
				name: string;
			};
		};
	};
}

export interface UserUSDCTotalDeposit {
	events: {
		nodes: UserUSDCTotalDepositNode[];
	};
}

export interface DepositTransaction {
	txnId: string;
	timestamp: string;
	amount: string;
	status: string;
}

interface TransactionEdge {
	node: {
		effects: TransactionEffects;
	};
}

interface TransactionEffects {
	status: string;
	digest: string;
	events: {
		nodes: EventNode[];
	};
}

interface EventNode {
	contents: {
		json: TransactionJsonContent;
	};
	timestamp: string;
}

interface TransactionJsonContent {
	amount: string;
	total_amount: string;
}

export interface TransactionResponse {
	transactions: {
		edges: TransactionEdge[];
	};
}
