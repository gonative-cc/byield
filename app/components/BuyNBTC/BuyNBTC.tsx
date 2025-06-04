import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useContext, useCallback, useActionState, useState } from "react";
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
import { Modal } from "../ui/dialog";
import { useSuiBalance } from "../Wallet/SuiWallet/useSuiBalance";
import { Instructions } from "./Instructions";
import { TransactionStatus } from "./TransactionStatus";
import { NBTCIcon, SUIIcon } from "../icons";
import { NumericInput } from "../ui/NumericInput";

const calculateYouReceive = (mistAmount: bigint): bigint => {
	return mistAmount / PRICE_PER_NBTC_IN_SUI;
};

interface YouReceiveProps {
	mistAmount: bigint;
}

function YouReceive({ mistAmount }: YouReceiveProps) {
	const youReceive = calculateYouReceive(mistAmount);

	return (
		<div className="flex flex-col gap-2">
			<NumericInput
				id="amountOfNBTC"
				name="amountOfNBTC"
				className="h-16"
				value={youReceive && youReceive > 0 ? formatSUI(youReceive) : "0.0"}
				allowNegative={false}
				placeholder={youReceive && youReceive <= 0 ? "0.0" : ""}
				readOnly
				rightAdornments={<NBTCIcon />}
			/>
			<span className="tracking-tighter text-gray-500 text-sm dark:text-gray-400">
				This is a fixed price buy. The price is 25,000 SUI / nBTC.
			</span>
		</div>
	);
}

export function BuyNBTC() {
	const [suiAmount, setSUIAmount] = useState<string>("");
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

	const gasFee = parseSUI(BUY_NBTC_GAS_FEE_IN_SUI);
	const mistAmount: bigint = parseSUI(suiAmount?.length > 0 && suiAmount !== "." ? suiAmount : "0");

	const validateTransaction = (mistAmount: bigint): { isValid: boolean; errorMessage?: string } => {
		// Check if account is available
		if (!account) {
			const errorMessage = "Account is not available. Cannot proceed with the transaction.";
			console.error(errorMessage);
			toast({
				title: "Buy nBTC",
				description: errorMessage,
				variant: "destructive",
			});
			return { isValid: false, errorMessage };
		}

		// Check if SUI amount is valid
		const isValidSUIAmount = suiAmount?.length > 0 && suiAmount !== ".";
		if (!isValidSUIAmount) {
			const errorMessage = "Invalid SUI amount";
			console.error(errorMessage);
			toast({
				title: "Buy nBTC",
				description: errorMessage,
				variant: "destructive",
			});
			return { isValid: false, errorMessage };
		}

		// Check if balance is sufficient

		const suiAmountWithFee = mistAmount + gasFee;
		const isEnoughBalance = balance?.totalBalance && suiAmountWithFee <= BigInt(balance.totalBalance);
		if (!isEnoughBalance) {
			const errorMessage = `Entered SUI is too big. Leave at-least ${formatSUI(gasFee)} SUI to cover the gas fee.`;
			console.error(errorMessage);
			toast({
				title: "Buy nBTC",
				description: errorMessage,
				variant: "destructive",
			});
			return { isValid: false, errorMessage };
		}

		return { isValid: true };
	};

	const handleTransaction = async (_: unknown, formData: FormData) => {
		const mistAmount = parseSUI(suiAmount);
		const { isValid } = validateTransaction(mistAmount);
		if (!isValid) return;
		const transaction = createBuyNBTCTxn(account!.address, mistAmount, nbtcOTC);
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
	};

	const [_, formAction] = useActionState<unknown, FormData>(handleTransaction, {
		suiAmount: "",
	});

	const resetForm = useCallback(() => {
		resetMutation();
		setSUIAmount("");
	}, [resetMutation]);

	return (
		<>
			<form action={formAction} className="flex flex-col gap-4 items-center" autoComplete="off">
				<span className="text-3xl font-semibold text-primary">Buy nBTC</span>
				<Card>
					<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
						{isSuiWalletConnected && nBTCBalance && (
							<NBTCBalance balance={BigInt(nBTCBalance.totalBalance)} />
						)}
						<Instructions />
						<NumericInput
							required
							id="suiAmount"
							name="suiAmount"
							placeholder="Enter SUI amount"
							className="h-16"
							inputMode="decimal"
							allowNegative={false}
							decimalScale={6}
							value={suiAmount}
							rightAdornments={<SUIIcon />}
							onChange={(e) => {
								e.preventDefault();
								e.stopPropagation();
								setSUIAmount(() => e.target.value);
							}}
						/>
						<ArrowDown className="text-primary justify-center w-full flex mb-2 p-0 m-0" />
						<YouReceive mistAmount={mistAmount} />
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
		</>
	);
}
