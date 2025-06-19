import { useCallback } from "react";
import { ArrowDown, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { SuiModal } from "../Wallet/SuiWallet/SuiModal";
import { NBTC_SELL_PRICE } from "~/constant";
import { Modal } from "../ui/dialog";
import { TransactionStatus } from "./TransactionStatus";
import { NBTCIcon, SUIIcon } from "../icons";
import { NumericInput } from "../ui/NumericInput";
import { useNBTC } from "./useNBTC";

const SUI_AMOUNT_ON_SELL = 0.5;

export function SellNBTCTabContent() {
	const { handleTransaction, resetMutation, isPending, isSuccess, isError, data, isSuiWalletConnected } =
		useNBTC({ variant: "SELL" });

	const resetForm = useCallback(() => {
		resetMutation();
	}, [resetMutation]);

	return (
		<div className="flex flex-col w-full gap-2">
			<NumericInput
				className="h-16"
				value={Number(NBTC_SELL_PRICE)}
				readOnly
				rightAdornments={<NBTCIcon className="mr-5" />}
			/>
			<ArrowDown className="text-primary justify-center w-full flex p-0 m-0" />
			<NumericInput
				value={SUI_AMOUNT_ON_SELL}
				readOnly
				className="h-16"
				rightAdornments={<SUIIcon className="mr-2" />}
			/>
			{isSuiWalletConnected ? (
				<Button
					type="button"
					onClick={() => handleTransaction(0n)}
					disabled={isPending}
					isLoading={isPending}
				>
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
	);
}
