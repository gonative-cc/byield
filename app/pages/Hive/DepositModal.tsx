import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Modal } from "~/components/ui/dialog";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { LoadingSpinner } from "~/components/LoadingSpinner";
import { formatUSDC, parseUSDC, USDC } from "~/lib/denoms";
import { USDCIcon } from "~/components/icons";
import { handleBalanceChanges, useCoinBalance } from "~/components/Wallet/SuiWallet/useBalance";
import { useCurrentAccount, useSignTransaction, useSuiClient } from "@mysten/dapp-kit";
import { useNetworkVariables } from "~/networkConfig";
import { logger } from "~/lib/log";
import { signAndExecTx } from "~/lib/suienv";
import { createLockdropDepositTxn } from "./lockdrop-transactions";
import { Check, CircleX, Info } from "lucide-react";
import { Link } from "react-router";
import { toast } from "~/hooks/use-toast";

interface CoinRightAdornmentProps {
	maxAmount: string;
	onMaxClick: (val: string) => void;
}

function CoinRightAdornment({ maxAmount, onMaxClick }: CoinRightAdornmentProps) {
	return (
		<div className="flex flex-col items-center gap-2 py-2">
			{maxAmount && (
				<div className="flex items-center gap-2">
					<p className="text-xs whitespace-nowrap">Balance: {maxAmount.substring(0, 8)} USDC</p>
					<button
						type="button"
						onClick={() => onMaxClick(maxAmount)}
						className="btn btn-primary btn-link h-fit w-fit p-0 pr-2 text-xs"
					>
						Max
					</button>
				</div>
			)}
			<USDCIcon className="mr-1 flex justify-end" containerClassName="w-full justify-end" />
		</div>
	);
}

interface DepositForm {
	amount: string;
}

interface DepositModalProps {
	id: string;
	open: boolean;
	onClose: () => void;
	updateDeposit: (newDeposit: bigint) => void;
	addTransaction: (txnId: string, amount: bigint) => void;
}

export function DepositModal({ id, open, onClose, updateDeposit, addTransaction }: DepositModalProps) {
	const { mutateAsync: signTransaction } = useSignTransaction();
	const account = useCurrentAccount();
	const client = useSuiClient();
	const { lockdrop, suiscan, usdc } = useNetworkVariables();
	const isSuiWalletConnected = !!account;
	const [isDepositing, setIsDepositing] = useState<boolean>(false);
	const [txStatus, setTxStatus] = useState<{ success: boolean; digest?: string } | null>(null);

	const usdcBalanceRes = useCoinBalance(usdc.type);
	const suiBalanceRes = useCoinBalance("SUI");

	const handleDeposit = useCallback(
		async (amount: bigint) => {
			setIsDepositing(true);
			if (!account) {
				logger.error({
					msg: "Account is not available. Cannot proceed with the deposit",
					method: "DepositModal",
				});
				toast({
					title: "Deposit USDC",
					description: "Account is not available. Cannot proceed with the deposit.",
					variant: "destructive",
				});
				return;
			}

			try {
				const transaction = createLockdropDepositTxn(account.address, amount, lockdrop, usdc);
				const result = await signAndExecTx(transaction, client, signTransaction, {
					showEffects: true,
					showBalanceChanges: true,
				});
				logger.info({ msg: "Deposit tx:", method: "DepositModal", digest: result.digest });
				const success = result.effects?.status?.status === "success";
				setTxStatus({ success, digest: result.digest });
				if (success) {
					updateDeposit(amount);
					addTransaction(result.digest, amount);
					if (result.balanceChanges) {
						handleBalanceChanges(result.balanceChanges, [
							// USDC
							{
								coinType: usdc.type,
								currentBalance: usdcBalanceRes.balance,
								updateCoinBalanceInCache: usdcBalanceRes.updateCoinBalanceInCache,
							},
							// SUI
							...(suiBalanceRes?.coinType
								? [
										{
											coinType: suiBalanceRes.coinType!,
											currentBalance: suiBalanceRes.balance,
											updateCoinBalanceInCache: suiBalanceRes.updateCoinBalanceInCache,
										},
									]
								: []),
						]);
					}
				} else {
					logger.error({ msg: "Deposit FAILED", method: "DepositModal", errors: result.errors });
				}
			} catch (error) {
				logger.error({ msg: "Error depositing", method: "DepositModal", errors: error });
				setTxStatus({ success: false });
			} finally {
				setIsDepositing(false);
			}
		},
		[
			account,
			lockdrop,
			usdc,
			client,
			signTransaction,
			updateDeposit,
			addTransaction,
			usdcBalanceRes.balance,
			usdcBalanceRes.updateCoinBalanceInCache,
			suiBalanceRes.coinType,
			suiBalanceRes.balance,
			suiBalanceRes.updateCoinBalanceInCache,
		],
	);

	const depositForm = useForm<DepositForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isDepositing,
	});
	const { watch, trigger, handleSubmit, reset, setValue } = depositForm;
	const amount = watch("amount");

	const parsedAmount: bigint = parseUSDC(amount?.length > 0 && amount !== "." ? amount : "0");

	const resetForm = useCallback(() => {
		reset({
			amount: "",
		});
	}, [reset]);

	const handleClose = useCallback(() => {
		resetForm();
		setTxStatus(null);
		onClose();
	}, [resetForm, onClose]);

	useEffect(() => {
		if (amount) {
			trigger();
		}
	}, [isSuiWalletConnected, amount, trigger]);

	const coinBalance = usdcBalanceRes.balance;
	const maxAmount = coinBalance > 0 ? formatUSDC(coinBalance) : "";

	const amountInputRules = {
		validate: {
			isWalletConnected: () => isSuiWalletConnected || "Please connect SUI wallet",
			enoughBalance: (value: string) => {
				if (coinBalance > 0n) {
					const inputAmount = parseUSDC(value);
					if (inputAmount <= coinBalance) {
						return true;
					}
				}
				return "Insufficient USDC balance";
			},
			atLeastOne: (value: string) => {
				if (parseUSDC(value) >= parseUSDC("1")) {
					return true;
				}
				return "USDC amount must be greater than or equal to 1";
			},
		},
	};

	return (
		<Modal id={id} title="Deposit USDC to Lockdrop" open={open} handleClose={handleClose}>
			{txStatus ? (
				<div className="flex flex-col gap-4 rounded-lg p-4 text-white">
					<div className="flex flex-col items-center gap-2">
						{txStatus.success ? (
							<Check className="text-success" size={30} />
						) : (
							<CircleX className="text-error" size={30} />
						)}
						{txStatus.success ? "Success" : "Failed"}
					</div>
					<div className="flex flex-col items-center gap-2">
						{txStatus.digest && (
							<Link
								target="_blank"
								to={`${suiscan}/tx/${txStatus.digest}`}
								rel="noreferrer"
								className="text-primary m-0 flex w-full max-w-fit justify-center p-0 text-sm"
							>
								Check Transaction Details
							</Link>
						)}
					</div>
					<button onClick={handleClose} className="btn btn-primary">
						Ok
					</button>
				</div>
			) : (
				<FormProvider {...depositForm}>
					<form
						onSubmit={(e) => handleSubmit(() => handleDeposit(parsedAmount))(e)}
						className="flex w-full flex-col gap-4"
					>
						<FormNumericInput
							required
							name="amount"
							placeholder="Enter USDC amount"
							className={coinBalance > 0 ? "h-16 pt-8" : "h-16"}
							inputMode="decimal"
							decimalScale={USDC}
							allowNegative={false}
							rightAdornments={
								<CoinRightAdornment
									onMaxClick={(val: string) => setValue("amount", val)}
									maxAmount={maxAmount}
								/>
							}
							rules={amountInputRules}
						/>
						<a
							target="_blank"
							className="btn btn-info py-6 underline"
							href="https://www.gonative.cc/hive-faq"
							rel="noopener noreferrer"
						>
							<Info />
							Your USDC will be locked in the lockdrop escrow until the lockdrop period ends.
						</a>
						<button
							className="btn btn-primary"
							type="submit"
							disabled={isDepositing}
							data-testid="submit-usdc-btn"
						>
							<LoadingSpinner isLoading={isDepositing} />
							Deposit USDC
						</button>
					</form>
				</FormProvider>
			)}
		</Modal>
	);
}
