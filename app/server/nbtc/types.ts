import type { MintTxStatus } from "@gonative-cc/btcindexer/models";

// scriptPubKey hex of the locking script (NOT a public key)
export type UTXO = {
	scriptpubkey: string;
	txid: string;
	value: number;
	vout: number;
};

export interface MintTransaction {
	bitcoinTxId: string;
	amountInSatoshi: number;
	status: MintTxStatus;
	suiAddress: string;
	suiTxId?: string;
	timestamp: number;
	numberOfConfirmation: number;
	operationStartDate?: number;
	bitcoinExplorerUrl?: string;
	suiExplorerUrl?: string;
	fees?: number;
	// TODO: add err msg to btcindexer
	errorMessage?: string;
}
