import { useCallback } from "react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { toast } from "~/hooks/use-toast";
import { formatSUI } from "~/lib/denoms";
import { GA_EVENT_NAME, GA_CATEGORY, useGoogleAnalytics } from "~/lib/googleAnalytics";
import { useNetworkVariables } from "~/networkConfig";
import type { UseCoinBalanceResult } from "~/components/Wallet/SuiWallet/useBalance";
import { logger } from "~/lib/log";
import { createNBTCTxn } from "./createBuyNbtcTx";

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
