import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useCallback, useContext } from "react";
import { Wallets } from "~/components/Wallet";
import { useSuiBalance } from "~/components/Wallet/SuiWallet/useSuiBalance";
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

export const useBid = () => {
	const account = useCurrentAccount();
	const client = useSuiClient();
	const { isWalletConnected } = useContext(WalletContext);
	const isSuiWalletConnected = isWalletConnected(Wallets.SuiWallet);
	const { balance, refetchSUIBalance } = useSuiBalance();
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
					onSettled: refetchSUIBalance,
				},
			);
		},
		[account, auctionBidApi, signAndExecuteTransaction, refetchSUIBalance],
	);

	return {
		handleTransaction,
		isPending,
		isSuccess,
		isError,
		data,
		resetMutation,
		balance,
		isSuiWalletConnected,
	};
};
