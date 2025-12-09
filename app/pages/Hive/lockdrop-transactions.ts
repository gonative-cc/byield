import { Transaction } from "@mysten/sui/transactions";
import { type LockdropCfg, moveCallTarget } from "~/config/sui/contracts-config";

export function createLockdropDepositTxn(
	senderAddress: string,
	suiAmountInMist: bigint,
	lockdropCfg: LockdropCfg,
): Transaction {
	if (!lockdropCfg.lockdropId) {
		throw new Error("Lockdrop ID is not found");
	}
	if (!lockdropCfg.pkgId) {
		throw new Error("Lockdrop package ID is not found");
	}

	const txn = new Transaction();
	txn.setSender(senderAddress);

	const [coins] = txn.splitCoins(txn.gas, [txn.pure.u64(suiAmountInMist)]);

	txn.moveCall({
		target: moveCallTarget(lockdropCfg, "deposit"),
		// TODO: support other type of coins
		typeArguments: ["0x2::sui::SUI"],
		arguments: [
			txn.object(lockdropCfg.lockdropId),
			txn.object(txn.object.clock()), // Clock object
			coins,
		],
	});

	return txn;
}
