import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { bcs } from "@mysten/sui/bcs";
import type { SuiClient, SuiExecutionResult } from "@mysten/sui/client";
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

function decodeOption(encode: Uint8Array): bigint | null {
	const option = bcs.option(bcs.u64());
	const result = option.parse(encode);
	if (result) return BigInt(result);
	else return null;
}
const getCurrentBidAmount = async (
	client: SuiClient,
	userAddr: string,
	{ packageId, module, auctionId }: Targets,
): Promise<bigint | null> => {
	const txn = new Transaction();
	txn.moveCall({
		target: `${packageId}::${module}::query_total_bid`,
		arguments: [txn.object(auctionId), txn.pure.address(userAddr)],
	});

	const res = await client.devInspectTransactionBlock({
		transactionBlock: txn,
		sender: userAddr,
	});
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-expect-error
	const returnValue = res.results[0].returnValues[0][0];

	return decodeOption(new Uint8Array(returnValue));
};

const createBidTxn = async (
	client: SuiClient,
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

			const totalBid = await getCurrentBidAmount(client, account.address, auctionBidApi);

			console.log(totalBid);
			if (totalBid) {
				if (amount <= totalBid) {
					toast({
						title,
						description: `Bid failed. Please bid higher than total bid you have ${totalBid || 0}`,
						variant: "destructive",
					});
					return;
				}
				amount = amount - totalBid;
			}

			const transaction = await createBidTxn(client, account.address, amount, auctionBidApi);
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
		[client, account, auctionBidApi, signAndExecuteTransaction, suiBalanceRes],
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
