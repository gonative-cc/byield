import type { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { moveCallTarget, type NbtcCfg } from "~/config/sui/contracts-config";
import { getCoinsForAmount } from "~/lib/suiCoins";

const MODULE = "nbtc";

// create a redeem BTC txn
export async function createRedeemTxn(
	senderAddress: string,
	amount: bigint,
	minerFee: bigint,
	recipientScriptBuffer: Uint8Array<ArrayBufferLike>,
	redeemCfg: NbtcCfg,
	client: SuiClient,
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

	// Collect enough nBTC coins across pages to cover the requested amount.
	// This avoids failures when the balance is fragmented across many small coins.
	const { coins: nbtcCoins, fulfilled } = await getCoinsForAmount(
		senderAddress,
		client,
		nbtcCoin,
		amount,
	);

	if (!fulfilled) throw new Error("Not enough nBTC coins available");

	const primaryCoin = txn.object(nbtcCoins[0].coinObjectId);
	if (nbtcCoins.length > 1) {
		const otherCoins = nbtcCoins.slice(1).map(({ coinObjectId }) => txn.object(coinObjectId));
		// merge all coins
		txn.mergeCoins(primaryCoin, otherCoins);
	}

	// Split exactly the desired amount for redemption
	const [coins] = txn.splitCoins(primaryCoin, [txn.pure.u64(amount)]);

	txn.moveCall({
		target: moveCallTarget({ ...redeemCfg, module: MODULE }, "redeem"),
		arguments: [
			txn.object(redeemCfg.contractId),
			coins,
			txn.pure.vector("u8", recipientScriptBuffer),
			txn.pure.u64(minerFee),
			txn.object.clock(),
		],
	});
	return txn;
}
