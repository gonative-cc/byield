import { coinWithBalance, Transaction } from "@mysten/sui/transactions";
import { type Coin, type LockdropCfg, moveCallTarget } from "~/config/sui/contracts-config";

export function createLockdropDepositTxn(
	senderAddress: string,
	amount: bigint,
	lockdropCfg: LockdropCfg,
	coin: Coin,
): Transaction {
	if (!lockdropCfg.lockdropId) {
		throw new Error("Lockdrop ID is not found");
	}
	if (!lockdropCfg.pkgId) {
		throw new Error("Lockdrop package ID is not found");
	}

	const txn = new Transaction();
	txn.setSender(senderAddress);

	const coins = coinWithBalance({ balance: amount, type: coin.type });

	txn.moveCall({
		target: moveCallTarget(lockdropCfg, "deposit"),
		typeArguments: [coin.type],
		arguments: [
			txn.object(lockdropCfg.lockdropId),
			txn.object(txn.object.clock()), // Clock object
			coins,
		],
	});

	return txn;
}
