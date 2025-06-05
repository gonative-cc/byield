import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { useContext, useCallback, useEffect } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { SuiModal } from "../Wallet/SuiWallet/SuiModal";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariables } from "~/networkConfig";
import { createBuyNBTCTxn } from "~/util/util";
import { BUY_NBTC_GAS_FEE_IN_SUI } from "~/constant";
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
import { SUIIcon } from "../icons";
import { YouReceive } from "./YouReceive";

interface SUIRightAdornmentProps {
	isSuiWalletConnected: boolean;
	gasFee: bigint;
	onMaxClick: (val: string) => void;
}

function SUIRightAdornment({ isSuiWalletConnected, gasFee, onMaxClick }: SUIRightAdornmentProps) {
	const { balance } = useSuiBalance();
	const totalBalance = BigInt(balance?.totalBalance || "0");
	const maxSUIAmount = balance?.totalBalance && totalBalance > 0 ? formatSUI(totalBalance - gasFee) : "0";
	const isValidMaxSUIAmount = balance?.totalBalance && maxSUIAmount !== "0";

	return (
		<div className="flex gap-1 items-center">
			{isValidMaxSUIAmount && (
				<p className="text-xs text-white w-[74px]">{maxSUIAmount.substring(0, 4)} SUI </p>
			)}
			{isValidMaxSUIAmount && (
				<Button
					variant="link"
					type="button"
					onClick={() => onMaxClick(maxSUIAmount)}
					className="text-xs w-fit p-0 pr-2"
				>
					Max
				</Button>
			)}
			<SUIIcon prefix={isSuiWalletConnected ? "" : " SUI"} className="flex justify-end mr-1" />
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
	const { watch, trigger, handleSubmit, reset, setValue } = buyNBTCForm;
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
		const transaction = createBuyNBTCTxn(account.address, mistAmount, nbtcOTC);
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

	const suiAmountInputRules = {
		validate: {
			isWalletConnected: () => isSuiWalletConnected || "Please connect SUI wallet",
			enoughBalance: (value: string) =>
				(balance?.totalBalance && parseSUI(value) + gasFee <= BigInt(balance.totalBalance)) ||
				`Entered SUI is too big. Leave at-least ${formatSUI(gasFee)} SUI to cover the gas fee.`,
		},
	};

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
							rightAdornments={
								<SUIRightAdornment
									gasFee={gasFee}
									isSuiWalletConnected={isSuiWalletConnected}
									onMaxClick={(val: string) => setValue("suiAmount", val)}
								/>
							}
							rules={suiAmountInputRules}
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
