export enum MintingTxStatus {
	BROADCASTING = "Broadcasting",
	CONFIRMING = "Confirming",
	MINTING = "Minting",
	MINTED = "Minted",
	FAILED = "Failed",
	REORG = "REORG",
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
	recipient?: string; // Recipient address for the new table column
	operationStartDate?: number; // Timestamp for when the operation started
	fees?: number; // Transaction fees in satoshis
	bitcoinExplorerUrl?: string; // URL to bitcoin explorer
	suiExplorerUrl?: string; // URL to sui explorer
	errorMessage?: string; // Error message for failed transactions
}
