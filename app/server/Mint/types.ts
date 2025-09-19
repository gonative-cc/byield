export type MintingTxStatus = "confirming" | "finalized" | "minted" | "failed" | "reorg";

export interface MintTransaction {
	bitcoinTxId: string;
	amountInSatoshi: number;
	status: MintingTxStatus;
	suiAddress: string;
	suiTxId?: string;
	timestamp: number;
	numberOfConfirmation: number;
	operationStartDate?: number;
	bitcoinExplorerUrl?: string;
	suiExplorerUrl?: string;
	fees?: number;
	errorMessage?: string;
}
