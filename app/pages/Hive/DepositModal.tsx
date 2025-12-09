import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Modal } from "~/components/ui/dialog";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { formatSUI, parseSUI, SUI } from "~/lib/denoms";
import { SUIIcon } from "~/components/icons";
import { classNames } from "~/util/tailwind";
import { useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { useCurrentAccount, useSignTransaction, useSuiClient } from "@mysten/dapp-kit";
import { toast } from "~/hooks/use-toast";
import { useNetworkVariables } from "~/networkConfig";
import { logger } from "~/lib/log";
import { signAndExecTx } from "~/lib/suienv";
import { createLockdropDepositTxn } from "./lockdrop-transactions";

const DEPOSIT_GAS = parseSUI("0.003");

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
	id: string;
	open: boolean;
	onClose: () => void;
}

export function DepositModal({ id, open, onClose }: DepositModalProps) {
	const suiBalanceRes = useCoinBalance("SUI");
	const { mutateAsync: signTransaction } = useSignTransaction();
	const account = useCurrentAccount();
	const client = useSuiClient();
	const { lockdrop, suiscan } = useNetworkVariables();
	const isSuiWalletConnected = !!account;
	const [isDepositing, setIsDepositing] = useState<boolean>(false);

	const handleDeposit = useCallback(
		async (amount: bigint) => {
			setIsDepositing(true);
			if (!account) {
				logger.error({
					msg: "Account is not available. Cannot proceed with the deposit",
					method: "DepositModal",
				});
				toast({
					title: "Deposit Assets",
					description: "Account is not available. Cannot proceed with the deposit.",
					variant: "destructive",
				});
				return;
			}

			try {
				// TODO: support multiple coins
				const transaction = createLockdropDepositTxn(account.address, amount, lockdrop);
				const result = await signAndExecTx(transaction, client, signTransaction, {
					showEffects: true,
				});
				logger.info({ msg: "Deposit tx:", method: "DepositModal", digest: result.digest });
				const txnLink = `${suiscan}/tx/${result.digest}`;
				if (result.effects?.status?.status === "success") {
					toast({
						title: "Deposit Successful",
						description: `Successfully deposited ${formatSUI(amount)} SUI to lockdrop. Txn: ${txnLink}`,
					});
				} else {
					logger.error({ msg: "Deposit FAILED", method: "DepositModal", errors: result.errors });
					toast({
						title: "Deposit Failed",
						description: `Transaction failed. Please try again. Txn: ${txnLink}`,
						variant: "destructive",
					});
				}
			} catch (error) {
				logger.error({ msg: "Error depositing", method: "DepositModal", errors: error });
				toast({
					title: "Deposit Failed",
					description: "Failed to deposit assets. Please try again.",
					variant: "destructive",
				});
			} finally {
				suiBalanceRes.refetch();
				onClose();
				setIsDepositing(false);
			}
		},
		[account, lockdrop, client, signTransaction, suiscan, suiBalanceRes, onClose],
	);

	const depositForm = useForm<DepositForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isDepositing,
	});
	const { watch, trigger, handleSubmit, reset, setValue } = depositForm;
	const suiAmount = watch("suiAmount");

	const mistAmount: bigint = parseSUI(suiAmount?.length > 0 && suiAmount !== "." ? suiAmount : "0");

	const resetForm = useCallback(() => {
		reset({
			suiAmount: "",
		});
	}, [reset]);

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
					return `Entered SUI is too big. Leave at least ${formatSUI(DEPOSIT_GAS)} SUI to cover the gas fee.`;
				}
			},
			atLeastOne: (value: string) => {
				if (parseSUI(value) >= 1_000_000_000n) {
					return true;
				}
				return "SUI amount must be greater than or equal to 1";
			},
		},
	};

	return (
		<Modal id={id} title="Deposit Assets to Lockdrop" open={open} handleClose={handleClose}>
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
					<button className="btn btn-primary" type="submit" disabled={isDepositing}>
						<LoadingSpinner isLoading={isDepositing} />
						Deposit Assets
					</button>
				</form>
			</FormProvider>
		</Modal>
	);
}
