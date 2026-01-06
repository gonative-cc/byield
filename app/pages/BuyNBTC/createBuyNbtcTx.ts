import type { SuiClient } from "@mysten/sui/client";
import { coinWithBalance, Transaction } from "@mysten/sui/transactions";
import type { TransactionResult } from "@mysten/sui/transactions";
import { toast } from "~/hooks/use-toast";
import { moveCallTarget, type NbtcOtcCfg } from "~/config/sui/contracts-config";
import { logger } from "~/lib/log";

const buyNBTCFunction = "buy_nbtc";
const sellNBTCFunction = "sell_nbtc";

export async function createNBTCTxn(
	senderAddress: string,
	amount: bigint,
	nbtcOtcCfg: NbtcOtcCfg,
	shouldBuy: boolean,
	client: SuiClient,
	nbtcBalance: bigint,
	nbtcCoin: string,
): Promise<Transaction | null> {
	const txn = new Transaction();
	txn.setSender(senderAddress);

	let resultCoin: TransactionResult;
	if (shouldBuy) {
		const [coins] = txn.splitCoins(txn.gas, [txn.pure.u64(amount)]);
		resultCoin = txn.moveCall({
			target: moveCallTarget(nbtcOtcCfg, buyNBTCFunction),
			arguments: [txn.object(nbtcOtcCfg.vaultId), coins],
		});
		// merge nbtc coins with the result coin
		const nbtcCoins = await client.getCoins({
			owner: senderAddress,
			coinType: nbtcCoin,
		});
		const remainingCoins = nbtcCoins.data.map(({ coinObjectId }) => txn.object(coinObjectId));
		if (remainingCoins.length > 0) txn.mergeCoins(resultCoin, remainingCoins);
		// Check user have nBTC here, if yes, then we try to merge,
		// if no we will transfer
		txn.transferObjects([resultCoin], senderAddress);
	} else {
		if (nbtcBalance < amount) {
			logger.error({
				msg: "Not enough nBTC balance available",
				method: "useNBTC",
				nbtcBalance,
				amount,
			});
			toast({
				title: "Sell nBTC",
				description: "Not enough nBTC balance available.",
				variant: "destructive",
			});
			return null;
		}
		const coin = coinWithBalance({ balance: amount, type: nbtcCoin });
		resultCoin = txn.moveCall({
			target: moveCallTarget(nbtcOtcCfg, sellNBTCFunction),
			arguments: [txn.object(nbtcOtcCfg.vaultId), coin],
		});
		txn.mergeCoins(txn.gas, [txn.object(resultCoin)]);
	}

	return txn;
}
