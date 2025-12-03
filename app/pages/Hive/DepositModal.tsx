import { useCallback, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Modal } from "~/components/ui/dialog";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { TransactionStatus } from "../BuyNBTC/TransactionStatus";
import { formatSUI, parseSUI, SUI } from "~/lib/denoms";
import { SUIIcon } from "~/components/icons";
import { classNames } from "~/util/tailwind";
import { useLockdropDeposit } from "./useLockdropDeposit";
import { useCoinBalance, type UseCoinBalanceResult } from "~/components/Wallet/SuiWallet/useBalance";

const DEPOSIT_GAS = parseSUI("0.01");

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
						type="button"
						onClick={() => onMaxClick(maxSUIAmount)}
						className="btn btn-primary btn-link h-fit w-fit p-0 pr-2 text-xs"
					>
						Max
					</button>
				</div>
			)}
			<SUIIcon
				prefix={"SUI"}
				className="mr-1 flex justify-end"
				containerClassName="w-full justify-end"
			/>
		</div>
	);
}

interface DepositForm {
	suiAmount: string;
}

interface DepositModalProps {
	open: boolean;
	onClose: () => void;
}

export function DepositModal({ open, onClose }: DepositModalProps) {
	const suiBalanceRes: UseCoinBalanceResult = useCoinBalance("SUI");
	const { handleDeposit, resetMutation, isPending, isSuccess, isError, data, isSuiWalletConnected } =
		useLockdropDeposit();

	const depositForm = useForm<DepositForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isPending || isSuccess || isError,
	});
	const { watch, trigger, handleSubmit, reset, setValue } = depositForm;
	const suiAmount = watch("suiAmount");

	const mistAmount: bigint = parseSUI(suiAmount?.length > 0 && suiAmount !== "." ? suiAmount : "0");

	const resetForm = useCallback(() => {
		resetMutation();
		reset({
			suiAmount: "",
		});
	}, [reset, resetMutation]);

	const handleClose = useCallback(() => {
		resetForm();
		onClose();
	}, [resetForm, onClose]);

	useEffect(() => {
		if (suiAmount) {
			trigger();
		}
	}, [isSuiWalletConnected, suiAmount, trigger]);

	const suiBalance = suiBalanceRes.balance;
	const suiAmountAfterFee = suiBalance - DEPOSIT_GAS;
	const maxSUIAmount = suiAmountAfterFee > 0 ? formatSUI(suiAmountAfterFee) : "";

	const suiAmountInputRules = {
		validate: {
			isWalletConnected: () => isSuiWalletConnected || "Please connect SUI wallet",
			enoughBalance: (value: string) => {
				if (suiBalance > 0n) {
					if (parseSUI(value) + DEPOSIT_GAS <= suiBalance) {
						return true;
					}
					return `Entered SUI is too big. Leave at-least ${formatSUI(DEPOSIT_GAS)} SUI to cover the gas fee.`;
				}
			},
		},
	};

	return (
		<Modal
			id="deposit-assets-modal"
			title="Deposit Assets to Lockdrop"
			open={open}
			handleClose={handleClose}
		>
			{isSuccess || isError ? (
				<TransactionStatus
					isSuccess={data?.effects?.status?.status === "success"}
					handleRetry={resetForm}
					txnId={data?.digest}
				/>
			) : (
				<FormProvider {...depositForm}>
					<form
						onSubmit={(e) => handleSubmit(() => handleDeposit(mistAmount))(e)}
						className="flex w-full flex-col gap-4"
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
							rightAdornments={
								<SUIRightAdornment
									onMaxClick={(val: string) => setValue("suiAmount", val)}
									maxSUIAmount={maxSUIAmount}
								/>
							}
							rules={suiAmountInputRules}
						/>
						<div className="text-base-content/70 text-sm">
							Your SUI will be locked in the lockdrop escrow until the lockdrop period ends.
						</div>
						<button className="btn btn-primary" type="submit" disabled={isPending}>
							<LoadingSpinner isLoading={isPending} />
							Deposit Assets
						</button>
					</form>
				</FormProvider>
			)}
		</Modal>
	);
}
