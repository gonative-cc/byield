export interface QueryLockedBTC {
	totalLockedBTC: number;
	CBTCData: CBTCData[];
}

export interface CBTCData {
	network: string;
	name: string;
	btc_addr: string;
	cbtc_pkg: string;
	cbtc_obj: string;
	note?: string;
}
