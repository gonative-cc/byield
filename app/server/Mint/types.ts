export enum MintingTxStatus {
	MINTED = "MINTED",
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
