export enum MintingTxStatus {
	MINTED = "MINED",
	FAILED = "FAILED",
	REORG = "REORG",
	CONFIRMING = "CONFIRMING",
	BROADCASTED = "BROADCASTED",
}

export interface MintTransaction {
	bitcoinTxId: string;
	amountInSatoshi: number;
	status: MintingTxStatus;
	suiAddress: string;
	suiTxId: string;
	timestamp: number;
	numberOfConfirmation: number;
}
