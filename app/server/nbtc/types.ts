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

// scriptPubKey hex of the locking script (NOT a public key)
export type UTXO = {
	scriptpubkey: string;
	txid: string;
	value: number;
	vout: number;
};

// TODO: this type should be imported from a worker, to assure we have consistent behaviour
export interface IndexerTransaction {
	btc_tx_id: string;
	amount_sats: number;
	status: MintingTxStatus;
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
