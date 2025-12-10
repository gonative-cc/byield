import { bcs } from "@mysten/sui/bcs";
import type { SuiClient } from "@mysten/sui/client";
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

export async function getUserDeposits(
	userAddress: string,
	lockdropCfg: LockdropCfg,
	client: SuiClient,
): Promise<string[]> {
	try {
		const txn = new Transaction();
		txn.moveCall({
			target: moveCallTarget(lockdropCfg, "get_user_deposits"),
			arguments: [txn.object(lockdropCfg.lockdropId), txn.pure.address(userAddress)],
		});
		const result = await client.devInspectTransactionBlock({
			sender: userAddress,
			transactionBlock: txn,
		});
		if (result.effects.status.status !== "success") {
			throw new Error(`Transaction failed: ${result.effects.status.error}`);
		}
		const returnValues = result.results?.[0]?.returnValues;
		if (!returnValues || returnValues.length === 0) {
			throw new Error("No return values from devInspectTransactionBlock");
		}
		const firstReturnValue = returnValues[0];
		if (!firstReturnValue) {
			throw new Error("No return values from devInspectTransactionBlock");
		}
		const bytes = new Uint8Array(firstReturnValue[0]);
		if (!bytes) {
			throw new Error("No return values from devInspectTransactionBlock");
		}
		const vectorSchema = bcs.vector(bcs.u64());
		const decoded = vectorSchema.parse(bytes);
		return decoded;
	} catch (err) {
		console.error("Failed to fetch deposits:", err);
		return [];
	}
}
