export type NbtcTxStatus = "confirming" | "finalized" | "minted" | "failed" | "reorg";

export interface MintTransaction {
	bitcoinTxId: string;
	amountInSatoshi: number;
	status: NbtcTxStatus;
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
