import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import type { SuiClient, CoinBalance, PaginatedCoins } from "@mysten/sui/client";
import { coinWithBalance, Transaction } from "@mysten/sui/transactions";
import type { TransactionResult } from "@mysten/sui/transactions";
import { useCallback, useContext } from "react";
import { toast } from "~/hooks/use-toast";
import type { ToastFunction } from "~/hooks/use-toast";
import { formatSUI } from "~/lib/denoms";
import { GA_EVENT_NAME, GA_CATEGORY, useGoogleAnalytics } from "~/lib/googleAnalytics";
import { useNetworkVariables } from "~/networkConfig";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { useNBTCBalance } from "~/components/Wallet/SuiWallet/useNBTCBalance";
import { useSuiBalance } from "~/components/Wallet/SuiWallet/useSuiBalance";
import { Wallets } from "~/components/Wallet";
import { NBTC_COIN_TYPE } from "~/lib/nbtc";

type Targets = {
	packageId: string;
	module: string;
	buyNBTCFunction: string;
	sellNBTCFunction: string;
	vaultId: string;
};

// get nBTC coins
const getNBTCCoins = async (owner: string, client: SuiClient): Promise<PaginatedCoins> => {
	return await client.getCoins({
		owner,
		coinType: NBTC_COIN_TYPE,
	});
};

const createNBTCTxn = async (
	senderAddress: string,
	amount: bigint,
	{ packageId, module, buyNBTCFunction, sellNBTCFunction, vaultId }: Targets,
	toast: ToastFunction,
	shouldBuy: boolean,
	client: SuiClient,
	nBTCBalance?: CoinBalance | null,
): Promise<Transaction | null> => {
	const txn = new Transaction();
	txn.setSender(senderAddress);

	let resultCoin: TransactionResult;
	if (shouldBuy) {
		const [coins] = txn.splitCoins(txn.gas, [txn.pure.u64(amount)]);
		resultCoin = txn.moveCall({
			target: `${packageId}::${module}::${buyNBTCFunction}`,
			arguments: [txn.object(vaultId), coins],
		});
		// merge nbtc coins with the result coin
		const nbtcCoins = await getNBTCCoins(senderAddress, client);
		const remainingCoins = nbtcCoins.data.map(({ coinObjectId }) => txn.object(coinObjectId));
		if (remainingCoins.length > 0) txn.mergeCoins(resultCoin, remainingCoins);
		// Check user have nBTC here, if yes, then we try to merge,
		// if no we will transfer
		txn.transferObjects([resultCoin], senderAddress);
	} else {
		if (nBTCBalance?.totalBalance && BigInt(nBTCBalance.totalBalance) < amount) {
			console.error("Not enough nBTC balance available.");
			toast({
				title: "Sell nBTC",
				description: "Not enough nBTC balance available.",
				variant: "destructive",
			});
			return null;
		}
		resultCoin = txn.moveCall({
			target: `${packageId}::${module}::${sellNBTCFunction}`,
			arguments: [txn.object(vaultId), coinWithBalance({ balance: amount, type: NBTC_COIN_TYPE })],
		});
		txn.mergeCoins(txn.gas, [txn.object(resultCoin)]);
	}

	return txn;
};

interface NBTCProps {
	variant: "BUY" | "SELL";
}

export const useNBTC = ({ variant }: NBTCProps) => {
	const shouldBuy = variant === "BUY";
	const account = useCurrentAccount();
	const client = useSuiClient();
	const { isWalletConnected } = useContext(WalletContext);
	const { trackEvent } = useGoogleAnalytics();
	const isSuiWalletConnected = isWalletConnected(Wallets.SuiWallet);
	const { balance: nBTCBalance, refetchBalance: refetchNBTCBalance } = useNBTCBalance();
	const { balance, refetchSUIBalance } = useSuiBalance();
	const { nbtcOTC } = useNetworkVariables();

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
			const title = variant === "BUY" ? "Buy nBTC" : "Sell nBTC";
			if (!account) {
				console.error("Account is not available. Cannot proceed with the transaction.");
				toast({
					title,
					description: "Account is not available. Cannot proceed with the transaction.",
					variant: "destructive",
				});
				return;
			}
			const transaction = await createNBTCTxn(
				account.address,
				amount,
				nbtcOTC,
				toast,
				shouldBuy,
				client,
				nBTCBalance,
			);
			const label = variant === "BUY" ? `user tried to buy ${formatSUI(amount)} SUI` : "";
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
						if (variant === "BUY")
							trackEvent(GA_EVENT_NAME.BUY_NBTC, {
								category: GA_CATEGORY.BUY_NBTC_SUCCESS,
								label,
							});
					},
					onError: () => {
						if (variant === "BUY")
							trackEvent(GA_EVENT_NAME.BUY_NBTC, {
								category: GA_CATEGORY.BUY_NBTC_ERROR,
								label,
							});
					},
					onSettled: () => {
						refetchSUIBalance();
						refetchNBTCBalance();
					},
				},
			);
		},
		[
			variant,
			account,
			nbtcOTC,
			shouldBuy,
			client,
			nBTCBalance,
			signAndExecuteTransaction,
			trackEvent,
			refetchSUIBalance,
			refetchNBTCBalance,
		],
	);

	return {
		handleTransaction,
		isPending,
		isSuccess,
		isError,
		data,
		resetMutation,
		balance,
		nBTCBalance,
		isSuiWalletConnected,
	};
};
