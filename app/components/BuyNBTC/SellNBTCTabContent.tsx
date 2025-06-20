import { useCallback } from "react";
import { ArrowDown, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { SuiModal } from "../Wallet/SuiWallet/SuiModal";
import { Modal } from "../ui/dialog";
import { TransactionStatus } from "./TransactionStatus";
import { NBTCIcon, SUIIcon } from "../icons";
import { useNBTC } from "./useNBTC";
import { formatNBTC, parseNBTC } from "~/lib/denoms";
import { PRICE_PER_NBTC_IN_SUI } from "~/lib/nbtc";
import { FormProvider, useForm } from "react-hook-form";
import { FormNumericInput } from "../form/FormNumericInput";

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
		nBTCBalance,
		data,
		isSuiWalletConnected,
	} = useNBTC({ variant: "SELL" });

	const sellNBTCForm = useForm<SellNBTCForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isPending || isSuccess || isError,
	});

	const { watch, handleSubmit, reset } = sellNBTCForm;
	const inputnBTCAmount = watch("nBTCAmount");
	const nBTCAmount = parseNBTC(
		inputnBTCAmount?.length > 0 && inputnBTCAmount !== "." ? inputnBTCAmount : "0",
	);
	const SUI_AMOUNT_RECEIVED_ON_SELL = nBTCAmount * (PRICE_PER_NBTC_IN_SUI / 2n);

	const resetForm = useCallback(() => {
		resetMutation();
		reset({
			nBTCAmount: "",
		});
	}, [reset, resetMutation]);

	const suiAmountInputRules = {
		validate: {
			isWalletConnected: () => isSuiWalletConnected || "Please connect SUI wallet",
			enoughBalance: (value: string) => {
				if (nBTCBalance?.totalBalance) {
					if (parseNBTC(value) <= BigInt(nBTCBalance.totalBalance)) {
						return true;
					}
					return `You don't have enough nBTC balance.`;
				}
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
				<div className="flex flex-col w-full gap-2">
					<FormNumericInput
						required
						name="nBTCAmount"
						placeholder="Enter nBTC amount"
						className="h-16"
						rightAdornments={<NBTCIcon className="mr-5" />}
						rules={suiAmountInputRules}
						createEmptySpace
					/>
					<span className="tracking-tighter text-gray-500 text-sm dark:text-gray-400">
						This is a fixed price sell. The nBTC will be sold at price 12,500.
					</span>
					<ArrowDown className="text-primary justify-center w-full flex p-0 m-0" />
					<FormNumericInput
						name="SUIAmountReceived"
						value={formatNBTC(SUI_AMOUNT_RECEIVED_ON_SELL)}
						readOnly
						className="h-16"
						rightAdornments={<SUIIcon className="mr-2" />}
					/>
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
				</div>
			</form>
		</FormProvider>
	);
}
