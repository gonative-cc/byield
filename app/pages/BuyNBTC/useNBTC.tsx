import { useCallback } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import type { SuiClient } from "@mysten/sui/client";
import { coinWithBalance, Transaction } from "@mysten/sui/transactions";
import type { TransactionResult } from "@mysten/sui/transactions";
import { toast } from "~/hooks/use-toast";
import { formatSUI } from "~/lib/denoms";
import { GA_EVENT_NAME, GA_CATEGORY, useGoogleAnalytics } from "~/lib/googleAnalytics";
import { useNetworkVariables } from "~/networkConfig";
import type { UseCoinBalanceResult } from "~/components/Wallet/SuiWallet/useBalance";
import { moveCallTarget, type NbtcOtcCfg } from "~/config/sui/contracts-config";
import { logger } from "~/lib/log";

const buyNBTCFunction = "buy_nbtc";
const sellNBTCFunction = "sell_nbtc";

interface GetCoinForAmountI {
	coins: {
		coinObjectId: string;
		balance: string | number | bigint;
	}[];
	isEnoughBalance: boolean;
}

// Returns the enough  coin coin array that has balance >= required amount
export async function getCoinsForAmount(
	senderAddress: string,
	client: SuiClient,
	coinType: string,
	requiredAmount: bigint,
): Promise<GetCoinForAmountI> {
	const coins: GetCoinForAmountI["coins"] = [];
	let hasNextPage = true;
	let cursor: string | null | undefined = null;
	let totalBalance = 0n;

	while (hasNextPage && totalBalance < requiredAmount) {
		const page = await client.getCoins({
			owner: senderAddress,
			coinType,
			cursor,
		});
		const pageCoins = page.data ?? [];

		if (!pageCoins.length) {
			break;
		}

		for (const coin of pageCoins) {
			coins.push(coin);
			totalBalance += BigInt(coin.balance);
			if (totalBalance >= requiredAmount) {
				break;
			}
		}

		hasNextPage = page.hasNextPage;
		cursor = page.nextCursor;
	}
	return { coins, isEnoughBalance: totalBalance >= requiredAmount };
}

async function createNBTCTxn(
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

interface UseNBTCReturn {
	handleTransaction: (amount: bigint) => Promise<void>;
	// check if TX is pending
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	// TX result
	/* eslint-disable @typescript-eslint/no-explicit-any */
	data: any;
	resetMutation: () => void;
	// TODO: maybe we should return the Resp object here (including loading state)?
	// Or when loading or error, maybe we should set null? But then user maybe be confused if he doesn't
	// see the error.
	suiBalance: bigint;
	nbtcBalance: bigint;
	isSuiWalletConnected: boolean;
}

interface NBTCProps {
	variant: "BUY" | "SELL";
	nbtcBalanceRes: UseCoinBalanceResult;
	suiBalanceRes: UseCoinBalanceResult;
}

export const useBuySellNBTC = ({ variant, nbtcBalanceRes, suiBalanceRes }: NBTCProps): UseNBTCReturn => {
	const shouldBuy = variant === "BUY";
	const account = useCurrentAccount();
	const client = useSuiClient();
	const { trackEvent } = useGoogleAnalytics();
	const { nbtcOTC, nbtc } = useNetworkVariables();
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

	const handleTransaction = useCallback(
		async (amount: bigint) => {
			const title = variant === "BUY" ? "Buy nBTC" : "Sell nBTC";
			if (!account) {
				logger.error({
					msg: "Account is not available. Cannot proceed with the transaction",
					method: "useNBTC",
				});
				toast({
					title,
					description: "Account is not available. Cannot proceed with the transaction.",
					variant: "destructive",
				});
				return;
			}
			const nbtcCoin = nbtc.pkgId + nbtc.coinType;
			const transaction = await createNBTCTxn(
				account.address,
				amount,
				nbtcOTC,
				shouldBuy,
				client,
				nbtcBalanceRes.balance,
				nbtcCoin,
			);
			const label = variant === "BUY" ? `user tried to buy ${formatSUI(amount)} SUI` : "";
			if (!transaction) {
				logger.error({ msg: "Failed to create the transaction", method: "useNBTC" });
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
						suiBalanceRes.refetch();
						nbtcBalanceRes.refetch();
					},
				},
			);
		},
		[
			variant,
			account,
			nbtcOTC,
			nbtc,
			shouldBuy,
			client,
			nbtcBalanceRes,
			signAndExecuteTransaction,
			trackEvent,
			suiBalanceRes,
		],
	);

	return {
		handleTransaction,
		isPending,
		isSuccess,
		isError,
		data,
		resetMutation,
		suiBalance: suiBalanceRes.balance,
		nbtcBalance: nbtcBalanceRes.balance,
		isSuiWalletConnected,
	};
};
