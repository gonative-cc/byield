import { useCallback } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { toast } from "~/hooks/use-toast";
import { formatSUI, parseSUI } from "~/lib/denoms";
import { useNetworkVariables } from "~/networkConfig";
import { moveCallTarget, type LockdropCfg } from "~/config/sui/contracts-config";
import { logger } from "~/lib/log";
import type { SuiTransactionBlockResponse } from "@mysten/sui/client";

async function createLockdropDepositTxn(
	senderAddress: string,
	suiAmountInMist: bigint,
	lockdropCfg: LockdropCfg,
): Promise<Transaction | null> {
	const txn = new Transaction();
	txn.setSender(senderAddress);

	const [coins] = txn.splitCoins(txn.gas, [txn.pure.u64(suiAmountInMist)]);

	txn.moveCall({
		target: moveCallTarget(lockdropCfg, "deposit"),
		typeArguments: ["0x02::sui::SUI"],
		arguments: [
			txn.object(lockdropCfg.lockdropId),
			txn.object("0x6"), // Clock object
			coins,
		],
	});

	return txn;
}

interface UseLockdropDepositReturn {
	handleDeposit: (amount: bigint) => Promise<void>;
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	data?: SuiTransactionBlockResponse;
	resetMutation: () => void;
	isSuiWalletConnected: boolean;
}

export const useLockdropDeposit = (): UseLockdropDepositReturn => {
	const account = useCurrentAccount();
	const client = useSuiClient();
	const { lockdrop } = useNetworkVariables();
	const isSuiWalletConnected = !!account;

	const {
		mutate: signAndExecuteTransaction,
		reset: resetMutation,
		isPending,
		isSuccess,
		isError,
		data,
	} = useSignAndExecuteTransaction({
		execute: async ({ bytes, signature }) =>
			await client.executeTransactionBlock({
				transactionBlock: bytes,
				signature,
				options: {
					showObjectChanges: true,
					showEffects: true,
					showRawEffects: true,
				},
			}),
	});

	const handleDeposit = useCallback(
		async (amount: bigint) => {
			if (!account) {
				logger.error({
					msg: "Account is not available. Cannot proceed with the deposit",
					method: "useLockdropDeposit",
				});
				toast({
					title: "Deposit Assets",
					description: "Account is not available. Cannot proceed with the deposit.",
					variant: "destructive",
				});
				return;
			}

			const transaction = await createLockdropDepositTxn(account.address, amount, lockdrop);

			if (!transaction) {
				logger.error({
					msg: "Failed to create the deposit transaction",
					method: "useLockdropDeposit",
				});
				return;
			}

			signAndExecuteTransaction(
				{ transaction },
				{
					onSuccess: () => {
						toast({
							title: "Deposit Successful",
							description: `Successfully deposited ${formatSUI(amount)} SUI to lockdrop`,
						});
					},
					onError: (error) => {
						logger.error({
							msg: "Deposit transaction failed",
							method: "useLockdropDeposit",
							error,
						});
						toast({
							title: "Deposit Failed",
							description: "Failed to deposit assets. Please try again.",
							variant: "destructive",
						});
					},
				},
			);
		},
		[account, lockdrop, signAndExecuteTransaction],
	);

	return {
		handleDeposit,
		isPending,
		isSuccess,
		isError,
		data,
		resetMutation,
		isSuiWalletConnected,
	};
};
