export type MintingTxStatus =
	| "broadcasting"
	| "confirming"
	| "finalized"
	| "minting"
	| "minted"
	| "failed"
	| "reorg";

export const MintingStatus = {
	Broadcasting: "broadcasting" as const,
	Confirming: "confirming" as const,
	Finalized: "finalized" as const,
	Minting: "minting" as const,
	Minted: "minted" as const,
	Failed: "failed" as const,
	Reorg: "reorg" as const,
} as const;

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
