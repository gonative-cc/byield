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

export type UTXO = {
	scriptpubkey: string;
	txid: string;
	value: number;
	vout: number;
};
export interface IndexerTransaction {
	btc_tx_id: string;
	amount_sats: number;
	status: string;
	sui_recipient: string;
	sui_tx_id?: string;
	created_at: number;
	updated_at: number;
	confirmations: number;
	block_hash: string;
	block_height: number;
	tx_id: string;
	vout: number;
	bitcoin_explorer_url?: string;
	sui_explorer_url?: string;
	fees?: number;
	error_message?: string;
}

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

export interface LoaderData {
	mintTxs: MintTransaction[];
}

export interface LoaderDataResp extends LoaderData {
	error?: Error;
}
