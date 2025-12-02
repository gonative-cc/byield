interface ClaimedSbt {
	level: number;
	sbtId: number;
	title: string;
	taskName: string;
	points: number;
}

interface User {
	suiAddress: string;
	sbtCount: number;
	totalRawPoints: number;
	claimedSbts: ClaimedSbt[];
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
	users: User[];
	pagination: Pagination;
}

export interface UserSbtData {
	suiAddress: string;
	claimedSbts: ClaimedSbt[];
	totalRawPoints: number;
	sbtCount: number;
}
