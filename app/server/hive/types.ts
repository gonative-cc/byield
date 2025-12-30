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

interface Pagination {
	currentPage: number;
	pageSize: number;
	totalUsers: number;
	totalPages: number;
}

export interface Response<T> {
	code: number;
	message: string;
	data: T;
}

export interface Data {
	users: UserSbtData[];
	pagination: Pagination;
}
