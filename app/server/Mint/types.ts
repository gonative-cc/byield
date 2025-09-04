export enum MintingTxStatus {
	MINED = "MINED",
	FAILED = "FAILED",
	PENDING = "PENDING",
	REORG = "REORG",
	CONFIRMING = "CONFIRMING",
}

export interface MintTransaction {
	bitcoinTxId: string;
	amountInSatoshi: number;
	status: MintingTxStatus;
	suiAddress: string;
	suiTxId: string;
	timestamp: number;
}
