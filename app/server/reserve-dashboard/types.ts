export interface QueryLockedBTC {
	totalLockedBTC: number;
	totalNBTCSupply: number;
}

export interface QueryLockedNCBTC {
	totalLockedBTC: number;
	totalNCBTCSupply: number;
	NCBTCData: NCBTCData[];
}

export interface NCBTCData {
	network: string;
	name: string;
	btc_addr: string;
	cbtc_pkg: string;
	cbtc_obj: string;
	note?: string;
	amount: number;
	totalSupply: number;
}

export interface TotalBTCRes {
	chain_stats: {
		funded_txo_sum: number;
		spent_txo_sum: number;
	};
}
export interface TotalSupplyResponse {
	object: {
		asMoveObject: {
			contents: {
				json: {
					cap: {
						total_supply: {
							value: number;
						};
					};
				};
			};
		};
	};
}

export interface GraphQLResponse<T> {
	data: T;
	errors?: Array<{ message: string }>;
}
