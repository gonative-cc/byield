import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useCallback, useContext } from "react";
import { Wallets } from "~/components/Wallet";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { toast } from "~/hooks/use-toast";
import { useNetworkVariables } from "~/networkConfig";
import { WalletContext } from "~/providers/ByieldWalletProvider";

type Targets = {
	packageId: string;
	module: string;
	bidEndpoint: string;
	auctionId: string;
};

const createBidTxn = async (
	senderAddress: string,
	amount: bigint,
	{ packageId, module, bidEndpoint, auctionId }: Targets,
): Promise<Transaction> => {
	const txn = new Transaction();
	txn.setSender(senderAddress);
	const [coin] = txn.splitCoins(txn.gas, [txn.pure.u64(amount)]);
	txn.moveCall({
		target: `${packageId}::${module}::${bidEndpoint}`,
		arguments: [txn.object(auctionId), coin, txn.object.clock()],
	});
	return txn;
};

interface UseBidReturn {
	handleTransaction: (amount: bigint) => Promise<void>;
	// check if TX is pending
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	// TX result
	/* eslint-disable @typescript-eslint/no-explicit-any */
	data: any;
	resetMutation: () => void;
	isSuiWalletConnected: boolean;
}

export const useBid = (): UseBidReturn => {
	const account = useCurrentAccount();
	const client = useSuiClient();
	const { isWalletConnected } = useContext(WalletContext);
	const isSuiWalletConnected = isWalletConnected(Wallets.SuiWallet);
	const suiBalanceRes = useCoinBalance();
	const { auctionBidApi } = useNetworkVariables();
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

	const handleTransaction = useCallback(
		async (amount: bigint) => {
			const title = "Bid NFT";
			if (!account) {
				console.error("Account is not available. Cannot proceed with the transaction.");
				toast({
					title,
					description: "Account is not available. Cannot proceed with the transaction.",
					variant: "destructive",
				});
				return;
			}
			const transaction = await createBidTxn(account.address, amount, auctionBidApi);
			if (!transaction) {
				console.error("Failed to create the transaction");
				return;
			}
			signAndExecuteTransaction(
				{
					transaction,
				},
				{
					onSuccess: () => {
						toast({
							title,
							description: "Bid successful",
						});
					},
					onError: () => {
						toast({
							title,
							description: "Bid failed. Please try again later.",
							variant: "destructive",
						});
					},
					onSettled: () => suiBalanceRes.refetch(),
				},
			);
		},
		[account, auctionBidApi, signAndExecuteTransaction, suiBalanceRes],
	);

	return {
		handleTransaction,
		isPending,
		isSuccess,
		isError,
		data,
		resetMutation,
		isSuiWalletConnected,
	};
};
