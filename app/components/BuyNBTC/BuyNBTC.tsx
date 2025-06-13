import { Transaction } from "@mysten/sui/transactions";
import { useContext, useCallback, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { ByieldWallet } from "~/types";
import { SuiModal } from "../Wallet/SuiWallet/SuiModal";
import { useNetworkVariables } from "~/networkConfig";
import { BUY_NBTC_GAS_FEE_IN_SUI } from "~/constant";
import { formatSUI, parseSUI, SUI } from "~/lib/denoms";
import { useToast } from "~/hooks/use-toast";
import { useNBTCBalance } from "../Wallet/SuiWallet/useNBTCBalance";
import { NBTCBalance } from "./NBTCBalance";
import { FormNumericInput } from "../form/FormNumericInput";
import { Modal } from "../ui/dialog";
import { useSuiBalance } from "../Wallet/SuiWallet/useSuiBalance";
import { Instructions } from "./Instructions";
import { TransactionStatus } from "./TransactionStatus";
import { YouReceive } from "./YouReceive";
import { GA_CATEGORY, GA_EVENT_NAME, useGoogleAnalytics } from "~/lib/googleAnalytics";
import { classNames } from "~/util/tailwind";
import { SUIIcon } from "../icons";

interface SUIRightAdornmentProps {
	maxSUIAmount: string;
	isValidMaxSUIAmount: boolean;
	onMaxClick: (val: string) => void;
}

function SUIRightAdornment({ isValidMaxSUIAmount, maxSUIAmount, onMaxClick }: SUIRightAdornmentProps) {
	return (
		<div className="flex flex-col items-center gap-2 py-2">
			{isValidMaxSUIAmount && (
				<div className="flex items-center gap-2">
					<p className="text-xs whitespace-nowrap">Balance: {maxSUIAmount.substring(0, 4)} SUI</p>
					<Button
						variant="link"
						type="button"
						onClick={() => onMaxClick(maxSUIAmount)}
						className="text-xs w-fit p-0 pr-2 h-fit"
					>
						Max
					</Button>
				</div>
			)}
			<SUIIcon prefix={"SUI"} className="flex justify-end mr-1" containerClassName="w-full justify-end" />
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
	const { trackEvent } = useGoogleAnalytics();
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
		const label = `user tried to buy ${formatSUI(mistAmount)} SUI`;

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

	const totalBalance = BigInt(balance?.totalBalance || "0");
	const suiAmountAfterFee = totalBalance - gasFee
	const isValidMaxSUIAmount = suiAmountAfterFee > 0;
	const maxSUIAmount = formatSUI(suiAmountAfterFee);

	const suiAmountInputRules = {
		validate: {
			isWalletConnected: () => isSuiWalletConnected || "Please connect SUI wallet",
			enoughBalance: (value: string) => {
				if (balance?.totalBalance) {
					if (parseSUI(value) + gasFee <= BigInt(balance.totalBalance)) {
						return true;
					}
					return `Entered SUI is too big. Leave at-least ${formatSUI(gasFee)} SUI to cover the gas fee.`;
				}
			},
		},
	};

	return (
		<FormProvider {...buyNBTCForm}>
			<form onSubmit={handleSubmit(handleTransaction)} className="flex flex-col items-center gap-8">
				<p className="md:text-3xl text-2xl text-center font-semibold max-w-96">
					Native enables <span className="text-2xl text-primary md:text-3xl">BTCFi</span> in the{" "}
					<span className="text-2xl text-primary md:text-3xl">Web3 native</span> way!
				</p>
				<Card>
					<CardContent className="p-6 rounded-lg text-white flex flex-col gap-4 bg-azure-10">
						<span className="text-3xl font-semibold text-primary text-center">Buy nBTC</span>
						{isSuiWalletConnected && nBTCBalance && (
							<NBTCBalance balance={BigInt(nBTCBalance.totalBalance)} />
						)}
						<Instructions />
						<FormNumericInput
							required
							name="suiAmount"
							placeholder="Enter SUI amount"
							className={classNames({
								"h-16": true,
								"pt-8": isValidMaxSUIAmount,
							})}
							inputMode="decimal"
							decimalScale={SUI}
							allowNegative={false}
							createEmptySpace
							rightAdornments={
								<SUIRightAdornment
									onMaxClick={(val: string) => setValue("suiAmount", val)}
									maxSUIAmount={maxSUIAmount}
									isValidMaxSUIAmount={isValidMaxSUIAmount}
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

type Targets = { packageId: string; module: string; swapFunction: string; vaultId: string };

const createBuyNBTCTxn = (
	senderAddress: string,
	suiAmountMist: bigint,
	{ packageId, module, swapFunction, vaultId }: Targets,
): Transaction => {
	const txn = new Transaction();
	txn.setSender(senderAddress);
	const [coins] = txn.splitCoins(txn.gas, [txn.pure.u64(suiAmountMist)]);
	txn.moveCall({
		target: `${packageId}::${module}::${swapFunction}`,
		arguments: [txn.object(vaultId), coins],
	});
	return txn;
};
