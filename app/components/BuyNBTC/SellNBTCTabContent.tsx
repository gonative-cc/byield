import { Transaction } from "@mysten/sui/transactions";
import { useContext, useCallback, useEffect } from "react";
import { ArrowDown, ChevronRight } from "lucide-react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Button } from "../ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { SuiModal } from "../Wallet/SuiWallet/SuiModal";
import { useNetworkVariables } from "~/networkConfig";
import { NBTC_SELL_PRICE } from "~/constant";
import { formatSUI, parseSUI } from "~/lib/denoms";
import { useToast } from "~/hooks/use-toast";
import { useNBTCBalance } from "../Wallet/SuiWallet/useNBTCBalance";
import { FormNumericInput } from "../form/FormNumericInput";
import { Modal } from "../ui/dialog";
import { useSuiBalance } from "../Wallet/SuiWallet/useSuiBalance";
import { TransactionStatus } from "./TransactionStatus";
import { GA_CATEGORY, GA_EVENT_NAME, useGoogleAnalytics } from "~/lib/googleAnalytics";
import { NBTCIcon, SUIIcon } from "../icons";

interface SellNBTCForm {
	suiAmount: string;
}

export function SellNBTCTabContent() {
	const { toast } = useToast();
	const client = useSuiClient();
	const account = useCurrentAccount();
	const { connectedWallet } = useContext(WalletContext);
	const { trackEvent } = useGoogleAnalytics();
	const isSuiWalletConnected = connectedWallet === ByieldWallet.SuiWallet;
	const { refetchBalance: refetchNBTCBalance } = useNBTCBalance();
	const { refetchSUIBalance } = useSuiBalance();
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

	const buyNBTCForm = useForm<SellNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isPending || isSuccess || isError,
	});
	const { watch, trigger, handleSubmit, reset } = buyNBTCForm;
	const suiAmount = watch("suiAmount");

	const mistAmount: bigint = parseSUI(suiAmount?.length > 0 && suiAmount !== "." ? suiAmount : "0");

	const handleTransaction = useCallback(async () => {
		if (!account) {
			console.error("Account is not available. Cannot proceed with the transaction.");
			toast({
				title: "Buy nBTC",
				description: "Account is not available. Cannot proceed with the transaction.",
				variant: "destructive",
			});
			return;
		}
		const transaction = createNBTCTxn(account.address, mistAmount, false, nbtcOTC);
		const label = `user tried to sell ${formatSUI(mistAmount)} SUI`;

		signAndExecuteTransaction(
			{
				transaction,
			},
			{
				onSuccess: () => {
					trackEvent(GA_EVENT_NAME.BUY_NBTC, {
						category: GA_CATEGORY.BUY_NBTC_SUCCESS,
						label,
					});
				},
				onError: () => {
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
	}, [
		account,
		mistAmount,
		nbtcOTC,
		signAndExecuteTransaction,
		toast,
		trackEvent,
		refetchSUIBalance,
		refetchNBTCBalance,
	]);

	const resetForm = useCallback(() => {
		resetMutation();
		reset({
			suiAmount: "",
		});
	}, [reset, resetMutation]);

	useEffect(() => {
		if (suiAmount) {
			trigger();
		}
	}, [isSuiWalletConnected, suiAmount, trigger]);

	return (
		<FormProvider {...buyNBTCForm}>
			<form onSubmit={handleSubmit(handleTransaction)} className="flex flex-col w-full gap-2">
				<FormNumericInput
					name="amountOfNBTC"
					className="h-16"
					value={NBTC_SELL_PRICE.toString()}
					allowNegative={false}
					readOnly
					rightAdornments={<NBTCIcon className="mr-5" />}
				/>
				<ArrowDown className="text-primary justify-center w-full flex p-0 m-0" />
				<FormNumericInput
					name="nBTCPrice"
					value="0.5"
					readOnly
					className="h-16"
					inputMode="decimal"
					allowNegative={false}
					rightAdornments={<SUIIcon className="mr-2" />}
				/>
				{isSuiWalletConnected ? (
					<Button type="submit" disabled={isPending} isLoading={isPending}>
						Sell nBTC
						<ChevronRight />
					</Button>
				) : (
					<SuiModal />
				)}
			</form>
			{(isSuccess || isError) && (
				<Modal title={"Buy nBTC Transaction Status"} open handleClose={resetForm}>
					<TransactionStatus
						isSuccess={data?.effects?.status?.status === "success"}
						handleRetry={resetForm}
						txnId={data?.digest}
					/>
				</Modal>
			)}
		</FormProvider>
	);
}

type Targets = {
	packageId: string;
	module: string;
	buyNBTCFunction: string;
	sellNBTCFunction: string;
	vaultId: string;
};

const createNBTCTxn = (
	senderAddress: string,
	suiAmountMist: bigint,
	shouldBuy: boolean,
	{ packageId, module, buyNBTCFunction, sellNBTCFunction, vaultId }: Targets,
): Transaction => {
	const txn = new Transaction();
	txn.setSender(senderAddress);
	const [coins] = txn.splitCoins(txn.gas, [txn.pure.u64(suiAmountMist)]);
	txn.moveCall({
		target: `${packageId}::${module}::${shouldBuy ? buyNBTCFunction : sellNBTCFunction}`,
		arguments: [txn.object(vaultId), coins],
	});
	return txn;
};
