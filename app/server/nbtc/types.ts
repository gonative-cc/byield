import type { MintTxStatus } from "@gonative-cc/btcindexer/models";
import type { RedeemRequestResp } from "@gonative-cc/sui-indexer/models";

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

// worker don't have this interface as the moment
// TODO: We should get it from the worker.
export interface RedeemSolverRPCI {
	proposeRedeemUtxos(): Promise<void>;
	redeemsBySuiAddr(suiAddress: string, setupId: number): Promise<RedeemRequestResp[]>;
}
