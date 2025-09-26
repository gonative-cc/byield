import { useCallback, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { SuiModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { formatSUI, parseSUI, SUI } from "~/lib/denoms";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { Modal } from "~/components/ui/dialog";
import { TransactionStatus } from "./TransactionStatus";
import { YouReceive } from "./YouReceive";
import { classNames } from "~/util/tailwind";
import { SUIIcon } from "~/components/icons";
import { useBuySellNBTC } from "./useNBTC";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import type { BalanceProps } from "~/types/balance";

const BUY_NBTC_GAS = parseSUI("0.01");

interface SUIRightAdornmentProps {
	maxSUIAmount: string;
	onMaxClick: (val: string) => void;
}

function SUIRightAdornment({ maxSUIAmount, onMaxClick }: SUIRightAdornmentProps) {
	return (
		<div className="flex flex-col items-center gap-2 py-2">
			{maxSUIAmount && (
				<div className="flex items-center gap-2">
					<p className="text-xs whitespace-nowrap">Balance: {maxSUIAmount.substring(0, 4)} SUI</p>
					<button
						onClick={() => onMaxClick(maxSUIAmount)}
						className="btn btn-primary btn-link text-xs w-fit p-0 pr-2 h-fit"
					>
						Max
					</button>
				</div>
			)}
			<SUIIcon
				prefix={"SUI"}
				className="flex justify-end mr-1"
				containerClassName="w-full justify-end"
			/>
		</div>
	);
}

interface BuyNBTCForm {
	suiAmount: string;
}

type BuyNBTCTabContentProps = BalanceProps;

export function BuyNBTCTabContent({ nbtcBalanceRes, suiBalanceRes, nbtcCoin }: BuyNBTCTabContentProps) {
	const {
		handleTransaction,
		resetMutation,
		isPending,
		isSuccess,
		isError,
		data,
		suiBalance,
		isSuiWalletConnected,
	} = useBuySellNBTC({
		variant: "BUY",
		nbtcBalanceRes,
		suiBalanceRes,
		nbtcCoin,
	});

	const buyNBTCForm = useForm<BuyNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isPending || isSuccess || isError,
	});
	const { watch, trigger, handleSubmit, reset, setValue } = buyNBTCForm;
	const suiAmount = watch("suiAmount");

	const mistAmount: bigint = parseSUI(suiAmount?.length > 0 && suiAmount !== "." ? suiAmount : "0");

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

	const suiAmountAfterFee = suiBalance - BUY_NBTC_GAS;
	const maxSUIAmount = suiAmountAfterFee > 0 ? formatSUI(suiAmountAfterFee) : "";

	const suiAmountInputRules = {
		validate: {
			isWalletConnected: () => isSuiWalletConnected || "Please connect SUI wallet",
			enoughBalance: (value: string) => {
				if (suiBalance > 0n) {
					if (parseSUI(value) + BUY_NBTC_GAS <= suiBalance) {
						return true;
					}
					return `Entered SUI is too big. Leave at-least ${formatSUI(BUY_NBTC_GAS)} SUI to cover the gas fee.`;
				}
			},
		},
	};

	return (
		<FormProvider {...buyNBTCForm}>
			<form
				onSubmit={(e) => handleSubmit(() => handleTransaction(mistAmount))(e)}
				className="flex w-full flex-col gap-2"
			>
				<FormNumericInput
					required
					name="suiAmount"
					placeholder="Enter SUI amount"
					className={classNames({
						"h-16": true,
						"pt-8": suiAmountAfterFee > 0,
					})}
					inputMode="decimal"
					decimalScale={SUI}
					allowNegative={false}
					createEmptySpace
					rightAdornments={
						<SUIRightAdornment
							onMaxClick={(val: string) => setValue("suiAmount", val)}
							maxSUIAmount={maxSUIAmount}
						/>
					}
					rules={suiAmountInputRules}
				/>
				<ArrowDown className="text-primary justify-center w-full flex mb-2 p-0 m-0" />
				<YouReceive isSuiWalletConnected={isSuiWalletConnected} mistAmount={mistAmount} />
				{isSuiWalletConnected ? (
					<button className="btn btn-primary" type="submit" disabled={isPending}>
						<LoadingSpinner isLoading={isPending} />
						Buy
					</button>
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
