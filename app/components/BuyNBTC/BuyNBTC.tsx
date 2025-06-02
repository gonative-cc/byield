import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { useContext, useCallback, useEffect, useMemo } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { SuiModal } from "../Wallet/SuiWallet/SuiModal";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariables } from "~/networkConfig";
import { createBuyNBTCTxn } from "~/util/util";
import { BUY_NBTC_GAS_FEE_IN_SUI, PRICE_PER_NBTC_IN_SUI } from "~/constant";
import { ArrowDown } from "lucide-react";
import { formatSUI, parseSUI } from "~/lib/denoms";
import { useToast } from "~/hooks/use-toast";
import { useNBTCBalance } from "../Wallet/SuiWallet/useNBTCBalance";
import { NBTCBalance } from "./NBTCBalance";
import { FormNumericInput } from "../form/FormNumericInput";
import { Modal } from "../ui/dialog";
import { useSuiBalance } from "../Wallet/SuiWallet/useSuiBalance";
import { Instructions } from "./Instructions";
import { TransactionStatus } from "./TransactionStatus";

const calculateYouReceive = (_mistAmount: bigint, _gasFee: bigint): number => {
	const mistAmountAfterFee = _mistAmount - _gasFee;
	return Number(formatSUI(mistAmountAfterFee)) / PRICE_PER_NBTC_IN_SUI;
};

function SUIIcon() {
	return (
		<div className="flex gap-2 items-center mr-2">
			SUI
			<img
				src="https://cdn.prod.website-files.com/6425f546844727ce5fb9e5ab/65690e5e73e9e2a416e3502f_sui-mark.svg"
				loading="lazy"
				alt="SUI"
				className="w-7 h-7"
			/>
		</div>
	);
}

function NBTCIcon() {
	return (
		<div className="flex gap-2 items-center mr-2">
			nBTC
			<img src="/nbtc.svg" alt="Bitcoin" className="w-7 h-7 mr-2" />
		</div>
	);
}

interface YouReceiveProps {
	mistAmount: bigint;
	isSuiWalletConnected: boolean;
}

function YouReceive({ mistAmount, isSuiWalletConnected }: YouReceiveProps) {
	const youReceive = calculateYouReceive(mistAmount, parseSUI(BUY_NBTC_GAS_FEE_IN_SUI));

	return (
		<div className="flex flex-col gap-2">
			<FormNumericInput
				name="amountOfNBTC"
				className="h-16"
				value={isSuiWalletConnected && youReceive && youReceive > 0 ? youReceive : "0.0"}
				allowNegative={false}
				placeholder={isSuiWalletConnected && youReceive && youReceive <= 0 ? "0.0" : ""}
				readOnly
				rightAdornments={<NBTCIcon />}
			/>
			<span className="tracking-tighter text-gray-500 text-sm dark:text-gray-400">
				This is a fixed price buy. The price is 25,000 SUI / nBTC.
			</span>
		</div>
	);
}

interface BuyNBTCForm {
	suiAmount: string;
}

export function BuyNBTC() {
	const { toast } = useToast();
	const client = useSuiClient();
	const account = useCurrentAccount();
	const { connectedWallet } = useContext(WalletContext);
	const isSuiWalletConnected = connectedWallet === ByieldWallet.SuiWallet;
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

	const buyNBTCForm = useForm<BuyNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isPending || isSuccess || isError,
	});
	const { watch, trigger, handleSubmit, reset } = buyNBTCForm;
	const suiAmount = watch("suiAmount");
	const gasFee = parseSUI(BUY_NBTC_GAS_FEE_IN_SUI);

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
		const suiAmountMistAfterFee = mistAmount - gasFee;
		const transaction = createBuyNBTCTxn(account.address, suiAmountMistAfterFee, nbtcOTC);
		signAndExecuteTransaction(
			{
				transaction,
			},
			{
				onSettled: () => {
					refetchSUIBalance();
					refetchNBTCBalance();
				},
			},
		);
	}, [
		gasFee,
		account,
		mistAmount,
		nbtcOTC,
		signAndExecuteTransaction,
		toast,
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
			<form onSubmit={handleSubmit(handleTransaction)} className="flex flex-col gap-4 items-center">
				<span className="text-3xl font-semibold text-primary">Buy nBTC</span>
				<Card>
					<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
						{isSuiWalletConnected && nBTCBalance && (
							<NBTCBalance balance={BigInt(nBTCBalance.totalBalance)} />
						)}
						<Instructions />
						<FormNumericInput
							required
							name="suiAmount"
							placeholder="Enter SUI amount"
							className="h-16"
							inputMode="decimal"
							allowNegative={false}
							decimalScale={6}
							createEmptySpace
							rightAdornments={<SUIIcon />}
							rules={{
								validate: {
									isWalletConnected: () => isSuiWalletConnected || "Please connect SUI wallet",
									enoughBalance: (value: string) =>
										(balance?.totalBalance &&
											parseSUI(value) + gasFee <= BigInt(balance.totalBalance)) ||
										`Entered SUI is too big. Leave at-least ${formatSUI(gasFee)} SUI to cover the gas fee.`,
									smallAmount: async (value: string) => {
										// balance and address should be there
										if (!balance?.totalBalance || !account?.address) return true;
										const currentSUIAmount = parseSUI(value);
										const amountToBeReceived = calculateYouReceive(currentSUIAmount, gasFee);
										if (amountToBeReceived > 0) return true;
										return "Not enough SUI to cover gas payment";
									},
								},
							}}
						/>
						<ArrowDown className="text-primary justify-center w-full flex mb-2 p-0 m-0" />
						<YouReceive isSuiWalletConnected={isSuiWalletConnected} mistAmount={mistAmount} />
						{isSuiWalletConnected ? (
							<Button type="submit" disabled={isPending} isLoading={isPending}>
								Buy
							</Button>
						) : (
							<SuiModal />
						)}
					</CardContent>
				</Card>
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
