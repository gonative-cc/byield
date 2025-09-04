export enum BitcoinTransactionStatus {
	SUCCESS = "SUCCESS",
	FAILED = "FAILED",
	PENDING = "PENDING",
}

export interface MintTransaction {
	bitcoinTxId: string;
	amountInSatoshi: number;
	status: BitcoinTransactionStatus;
	suiAddress: string;
	SUITxId: string;
	timestamp: number;
}
