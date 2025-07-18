import { useCallback, useEffect } from "react";
import { ArrowDown } from "lucide-react";
import { Button } from "~/components/ui/button";
import { FormProvider, useForm } from "react-hook-form";
import { SuiModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { formatSUI, parseSUI, SUI } from "~/lib/denoms";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { Modal } from "~/components/ui/dialog";
import { TransactionStatus } from "./TransactionStatus";
import { YouReceive } from "./YouReceive";
import { classNames } from "~/util/tailwind";
import { SUIIcon } from "~/components/icons";
import { useNBTC } from "./useNBTC";

const BUY_NBTC_GAS = parseSUI("0.01");

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

export function BuyNBTCTabContent() {
	const {
		handleTransaction,
		resetMutation,
		isPending,
		isSuccess,
		isError,
		data,
		balance,
		isSuiWalletConnected,
	} = useNBTC({ variant: "BUY" });

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

	const totalBalance = BigInt(balance?.totalBalance || "0");
	const suiAmountAfterFee = totalBalance - BUY_NBTC_GAS;
	const isValidMaxSUIAmount = suiAmountAfterFee > 0;
	const maxSUIAmount = formatSUI(suiAmountAfterFee);

	const suiAmountInputRules = {
		validate: {
			isWalletConnected: () => isSuiWalletConnected || "Please connect SUI wallet",
			enoughBalance: (value: string) => {
				if (balance?.totalBalance) {
					if (parseSUI(value) + BUY_NBTC_GAS <= BigInt(balance.totalBalance)) {
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
