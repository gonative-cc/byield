import type { MintTransaction } from "./types";
import { isProductionMode } from "~/lib/appenv";
import { mainnetCfg, testnetCfg } from "~/config/sui/contracts-config";
import type { NbtcTxResp } from "@gonative-cc/btcindexer/models";
import { BitcoinNetworkType } from "sats-connect";
import { BtcNet } from "@gonative-cc/lib/nbtc";

export const BitcoinNetworkTypeMap = {
	[BitcoinNetworkType.Mainnet]: BtcNet.MAINNET,
	[BitcoinNetworkType.Testnet]: BtcNet.TESTNET,
	[BitcoinNetworkType.Regtest]: BtcNet.REGTEST,
	[BitcoinNetworkType.Signet]: BtcNet.SIGNET,
	[BitcoinNetworkType.Testnet4]: BtcNet.TESTNET,
} as const;

export function nbtcMintTxRespToMintTx(tx: NbtcTxResp): MintTransaction {
	let suiExplorerUrl: string | undefined;
	if (tx.sui_tx_id) {
		const cfg = isProductionMode() ? mainnetCfg : testnetCfg;
		suiExplorerUrl = `${cfg.explorer}/txblock/${tx.sui_tx_id}`;
	}

	return {
		bitcoinTxId: tx.btcTxId,
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
