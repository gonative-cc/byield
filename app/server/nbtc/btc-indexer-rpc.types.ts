// TODO: use types from btcindexer, rahter than copying it
export interface TxStatusResp {
	btc_tx_id: string;
	amount_sats: number;
	status: string;
	sui_recipient: string;
	sui_tx_id: string | null;
	created_at: string;
	confirmations: number;
	bitcoin_explorer_url: string;
	sui_explorer_url: string | null;
	fees: number;
	error_message: string | null;
}

export interface BtcIndexerRpc {
	statusBySuiAddress(suiAddress: string): Promise<TxStatusResp[]>;
	putNbtcTx(txHex: string): Promise<{ tx_id: string; registered_deposits: number }>;
	lockedBTCDeposit(): Promise<number>;
}
