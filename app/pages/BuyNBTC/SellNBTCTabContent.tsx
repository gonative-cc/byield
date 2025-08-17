import { useCallback } from "react";
import { ArrowDown, ChevronRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { SuiModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { Modal } from "~/components/ui/dialog";
import { TransactionStatus } from "./TransactionStatus";
import { NBTCIcon, SUIIcon } from "~/components/icons";
import { useBuySellNBTC } from "./useNBTC";
import { formatNBTC, NBTC, parseNBTC } from "~/lib/denoms";
import { FormProvider, useForm } from "react-hook-form";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { classNames } from "~/util/tailwind";
import { PRICE_PER_NBTC_IN_SUI } from "~/lib/nbtc";

interface NBTCRightAdornmentProps {
	maxNBTCAmount: bigint;
	onMaxClick: (val: string) => void;
}

function NBTCRightAdornment({ maxNBTCAmount, onMaxClick }: NBTCRightAdornmentProps) {
	const totalNBTCBalance = formatNBTC(maxNBTCAmount);

	return (
		<div className="flex flex-col items-center gap-2 py-2">
			{maxNBTCAmount > 0 && (
				<div className="flex items-center gap-2">
					<p className="text-xs whitespace-nowrap">Balance: {totalNBTCBalance} nBTC</p>
					<Button
						variant="link"
						type="button"
						onClick={() => onMaxClick(totalNBTCBalance)}
						className="text-xs w-fit p-0 pr-2 h-fit"
					>
						Max
					</Button>
				</div>
			)}
			<NBTCIcon
				prefix={"nBTC"}
				className="flex justify-end mr-1"
				containerClassName="w-full justify-end"
			/>
		</div>
	);
}

interface SellNBTCForm {
	nBTCAmount: string;
}

export function SellNBTCTabContent() {
	const {
		handleTransaction,
		resetMutation,
		isPending,
		isSuccess,
		isError,
		nbtcBalance,
		data,
		isSuiWalletConnected,
	} = useBuySellNBTC({ variant: "SELL" });

	const sellNBTCForm = useForm<SellNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isPending || isSuccess || isError,
	});

	const { watch, handleSubmit, reset, setValue } = sellNBTCForm;
	const inputNBTCAmount = watch("nBTCAmount");
	const nBTCAmount = parseNBTC(
		inputNBTCAmount?.length > 0 && inputNBTCAmount !== "." ? inputNBTCAmount : "0",
	);
	const SUIAmountReceived = nBTCAmount * (PRICE_PER_NBTC_IN_SUI / 2n);

	const resetForm = useCallback(() => {
		resetMutation();
		reset({
			nBTCAmount: "",
		});
	}, [reset, resetMutation]);

	const nBTCAmountInputRules = {
		validate: {
			isWalletConnected: () => isSuiWalletConnected || "Please connect SUI wallet",
			enoughBalance: (value: string) => {
				if (parseNBTC(value) <= nbtcBalance) {
					return true;
				}
				return "You don't have enough nBTC balance.";
			},
		},
	};

	return (
		<FormProvider {...sellNBTCForm}>
			<form
				onSubmit={(e) =>
					handleSubmit(() => {
						handleTransaction(nBTCAmount);
					})(e)
				}
				className="flex w-full flex-col gap-2"
			>
				<FormNumericInput
					required
					name="nBTCAmount"
					placeholder="Enter nBTC amount"
					className={classNames({
						"h-16": true,
						"pt-8": nbtcBalance > 0,
					})}
					rightAdornments={
						<NBTCRightAdornment
							onMaxClick={(val: string) => setValue("nBTCAmount", val)}
							maxNBTCAmount={nbtcBalance}
						/>
					}
					rules={nBTCAmountInputRules}
					createEmptySpace
					decimalScale={NBTC}
					allowNegative={false}
				/>
				<ArrowDown className="text-primary justify-center w-full flex p-0 m-0" />
				<FormNumericInput
					name="SUIAmountReceived"
					value={formatNBTC(SUIAmountReceived)}
					readOnly
					className="h-16"
					rightAdornments={<SUIIcon className="mr-2" />}
				/>
				<div className="flex flex-col gap-2">
					<span className="tracking-tighter text-gray-500 text-sm dark:text-gray-400">
						This is a fixed price sell. The nBTC will be sold at price 12,500.
					</span>
					<span className="tracking-tighter text-gray-500 text-sm dark:text-gray-400">
						<span className="font-bold">Testnet measure:</span>To reduce testnet bot spam, nBTC to
						SUI swaps have a 50% reduction.
					</span>
				</div>
				{isSuiWalletConnected ? (
					<Button type="submit" disabled={isPending} isLoading={isPending}>
						Sell nBTC
						<ChevronRight />
					</Button>
				) : (
					<SuiModal />
				)}
				{(isSuccess || isError) && (
					<Modal title={"Sell nBTC Transaction Status"} open handleClose={resetForm}>
						<TransactionStatus
							isSuccess={data?.effects?.status?.status === "success"}
							handleRetry={resetForm}
							txnId={data?.digest}
						/>
					</Modal>
				)}
			</form>
		</FormProvider>
	);
}
