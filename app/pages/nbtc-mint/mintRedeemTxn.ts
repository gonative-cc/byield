import type { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import type { BitcoinNetworkType } from "sats-connect";
import { type RedeemCfg, moveCallTarget } from "~/config/sui/contracts-config";
import { scriptPubKeyFromAddress } from "~/lib/bitcoin.client";
import { getCoinsForAmount } from "../BuyNBTC/useNBTC";

// create a redeem BTC txn
export async function createRedeemTxn(
	senderAddress: string,
	amount: bigint,
	recipientAddr: string,
	redeemCfg: RedeemCfg,
	client: SuiClient,
	network: BitcoinNetworkType,
	nbtcCoin: string,
): Promise<Transaction> {
	if (!redeemCfg.contractId) {
		throw new Error("Contract ID is not found");
	}
	if (!redeemCfg.pkgId) {
		throw new Error("Redeem BTC package ID is not found");
	}
	const txn = new Transaction();
	txn.setSender(senderAddress);

	const recipientScriptBuffer: Uint8Array | null = await scriptPubKeyFromAddress(
		recipientAddr,
		network,
	);
	if (!recipientScriptBuffer) throw Error("Invalid recipient address");

	// Collect enough nBTC coins across pages to cover the requested amount.
	// This avoids failures when the balance is fragmented across many small coins.
	const { coins: nbtcCoins, isEnoughBalance } = await getCoinsForAmount(
		senderAddress,
		client,
		nbtcCoin,
		amount,
	);

	if (!nbtcCoins.length || !isEnoughBalance) throw Error("Not enough nBTC coins available");

	const primaryCoin = txn.object(nbtcCoins[0].coinObjectId);
	if (nbtcCoins.length > 1) {
		const otherCoins = nbtcCoins.slice(1).map(({ coinObjectId }) => txn.object(coinObjectId));
		// merge all coins
		txn.mergeCoins(primaryCoin, otherCoins);
	}

	// Split exactly the desired amount for redemption
	const [coins] = txn.splitCoins(primaryCoin, [txn.pure.u64(amount)]);

	txn.moveCall({
		target: moveCallTarget(redeemCfg, "redeem"),
		arguments: [
			txn.object(redeemCfg.contractId),
			coins,
			txn.pure.vector("u8", recipientScriptBuffer),
			txn.object(txn.object.clock()),
		],
	});
	return txn;
}
