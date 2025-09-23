export enum MintingStatus {
	Broadcasting = "broadcasting",
	Confirming = "confirming",
	Finalized = "finalized",
	Minting = "minting",
	Minted = "minted",
	Failed = "failed",
	Reorg = "reorg",
	Unknown = "unknown",
}

export type MintingTxStatus = `${MintingStatus}`;

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
