import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { Transaction, TransactionResult } from "@mysten/sui/transactions";
import { useCallback, useContext } from "react";
import { NBTC_COINT_TYPE } from "~/constant";
import { toast, ToastFunction } from "~/hooks/use-toast";
import { formatSUI, parseNBTC } from "~/lib/denoms";
import { GA_EVENT_NAME, GA_CATEGORY, useGoogleAnalytics } from "~/lib/googleAnalytics";
import { useNetworkVariables } from "~/networkConfig";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { useNBTCBalance } from "../Wallet/SuiWallet/useNBTCBalance";
import { useSuiBalance } from "../Wallet/SuiWallet/useSuiBalance";

const MIN_NBTC_BALANCE = parseNBTC("0.00002");

type Targets = {
	packageId: string;
	module: string;
	buyNBTCFunction: string;
	sellNBTCFunction: string;
	vaultId: string;
};

const getCoinObjectId = async (owner: string, client: SuiClient): Promise<string | null> => {
	const coins = await client.getCoins({
		owner,
		coinType: NBTC_COINT_TYPE,
	});
	// find coin thw min nbtc balance
	const suitableCoin = coins.data.find((coin) => BigInt(coin.balance) >= MIN_NBTC_BALANCE);
	return suitableCoin ? suitableCoin.coinObjectId : null;
};

const createNBTCTxn = async (
	senderAddress: string,
	suiAmountMist: bigint,
	{ packageId, module, buyNBTCFunction, sellNBTCFunction, vaultId }: Targets,
	toast: ToastFunction,
	shouldBuy: boolean,
	client: SuiClient,
): Promise<Transaction | null> => {
	const txn = new Transaction();
	txn.setSender(senderAddress);
	const NBTCFunction = shouldBuy ? buyNBTCFunction : sellNBTCFunction;

	let resultCoin: TransactionResult;
	if (shouldBuy) {
		const [coins] = txn.splitCoins(txn.gas, [txn.pure.u64(suiAmountMist)]);
		resultCoin = txn.moveCall({
			target: `${packageId}::${module}::${NBTCFunction}`,
			arguments: [txn.object(vaultId), coins],
		});
	} else {
		const nbtcCoinId = await getCoinObjectId(senderAddress, client);
		if (!nbtcCoinId) {
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
			arguments: [txn.object(vaultId), txn.object(nbtcCoinId)],
		});
	}
	txn.transferObjects([resultCoin], senderAddress);
	return txn;
};

interface NBTCProps {
	variant: "BUY" | "SELL";
}

export const useNBTC = ({ variant }: NBTCProps) => {
	const shouldBuy = variant === "BUY";
	const account = useCurrentAccount();
	const client = useSuiClient();
	const { connectedWallet } = useContext(WalletContext);
	const { trackEvent } = useGoogleAnalytics();
	const isSuiWalletConnected = connectedWallet === ByieldWallet.SuiWallet;
	const { refetchBalance: refetchNBTCBalance } = useNBTCBalance();
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
		async (mistAmount: bigint) => {
			if (!account) {
				console.error("Account is not available. Cannot proceed with the transaction.");
				toast({
					title: "Buy nBTC",
					description: "Account is not available. Cannot proceed with the transaction.",
					variant: "destructive",
				});
				return;
			}
			const amount = variant === "BUY" ? mistAmount : 0n;
			const transaction = await createNBTCTxn(account.address, amount, nbtcOTC, toast, shouldBuy, client);
			const label = `user tried to buy ${formatSUI(mistAmount)} SUI`;
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
		[account, variant, nbtcOTC, shouldBuy, client, signAndExecuteTransaction, trackEvent, refetchSUIBalance, refetchNBTCBalance],
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
