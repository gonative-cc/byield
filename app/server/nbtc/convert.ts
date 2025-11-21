import type { MintTransaction } from "./types";
import { isProductionMode } from "~/lib/appenv";
import { mainnetCfg, testnetCfg } from "~/config/sui/contracts-config";

import type { NbtcTxResp } from "@gonative-cc/btcindexer/models";

export function nbtcMintTxRespToMintTx(tx: NbtcTxResp): MintTransaction {
	let suiExplorerUrl: string | undefined;
	if (tx.sui_tx_id) {
		const cfg = isProductionMode() ? mainnetCfg : testnetCfg;
		suiExplorerUrl = `${cfg.explorer}/txblock/${tx.sui_tx_id}`;
	}

	return {
		bitcoinTxId: tx.btc_tx_id,
		amountInSatoshi: tx.amount_sats,
		status: tx.status,
		suiAddress: tx.sui_recipient,
		suiTxId: tx.sui_tx_id || undefined,
		timestamp: new Date(tx.created_at).getTime(),
		numberOfConfirmation: tx.confirmations,
		operationStartDate: new Date(tx.created_at).getTime(),
		suiExplorerUrl,
		// TODO: bitcoinExplorerUrl, fees, errorMessage
		bitcoinExplorerUrl: undefined,
		fees: 1000,
	};
}
