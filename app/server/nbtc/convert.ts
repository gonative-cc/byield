import type { MintTransaction, MintingTxStatus } from "./types";
import type { TxStatusResp } from "./btc-indexer-rpc.types";
import { isProductionMode } from "~/lib/appenv";
import { mainnetCfg, testnetCfg } from "~/config/sui/contracts-config";

export function convertTxStatusToMintTx(tx: TxStatusResp): MintTransaction {
	let suiExplorerUrl: string | undefined;
	if (tx.sui_tx_id) {
		const cfg = isProductionMode() ? mainnetCfg : testnetCfg;
		suiExplorerUrl = `${cfg.explorer}/txblock/${tx.sui_tx_id}`;
	}

	return {
		bitcoinTxId: tx.btc_tx_id,
		amountInSatoshi: tx.amount_sats,
		status: tx.status as MintingTxStatus,
		suiAddress: tx.sui_recipient,
		suiTxId: tx.sui_tx_id || undefined,
		timestamp: new Date(tx.created_at).getTime(),
		numberOfConfirmation: tx.confirmations,
		operationStartDate: new Date(tx.created_at).getTime(),
		bitcoinExplorerUrl: tx.bitcoin_explorer_url,
		suiExplorerUrl,
		fees: tx.fees || 1000,
		errorMessage: tx.error_message || undefined,
	};
}
