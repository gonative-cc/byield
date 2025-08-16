import { FormProvider, useForm } from "react-hook-form";
import { useCallback, useContext, useEffect, useMemo } from "react";
import { parseSUI, SUI } from "~/lib/denoms";
import { Card, CardContent } from "~/components/ui/card";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { Button } from "~/components/ui/button";
import { FormInput } from "~/components/form/FormInput";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import type { Bid } from "./AuctionTable";
import { SuiModal } from "~/components/Wallet/SuiWallet/SuiModal";
import { useSuiClient } from "@mysten/dapp-kit";
import { useBid } from "./useBid";

function validateBidAmount(val: string, hasUserBidBefore: boolean) {
	const bidAmount = Number(val);
	if (!hasUserBidBefore && bidAmount < 1) {
		return "First-time bidders must bid at least 1 SUI";
	}
	if (bidAmount <= 0) {
		return "Bid amount must be greater than 0";
	}
	return true;
}

interface BeelieversBidForm {
	bid: string;
	note: string;
}

interface BeelieversBidProps {
	leaderBoardData?: Bid[];
}

export function BeelieversBid({ leaderBoardData = [] }: BeelieversBidProps) {
	const { suiAddr } = useContext(WalletContext);
	const {
		handleTransaction,
		isPending,
		isSuccess,
		isError,
		data,
		resetMutation,
		balance,
		isSuiWalletConnected,
	} = useBid();
	const hasUserBidBefore = useMemo(
		() => (suiAddr ? leaderBoardData.some((bid) => bid.bidder === suiAddr) : false),
		[leaderBoardData, suiAddr],
	);

	const bidForm = useForm<BeelieversBidForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isPending || isSuccess || isError,
		defaultValues: {
			bid: "", // from SUI to MIST
			note: "",
		},
	});
	const { handleSubmit, watch, trigger, reset, setValue } = bidForm;

	if (suiAddr == null) return <SuiModal />;

	const suiBid = watch("bid");

	const mistBidAmount: bigint = parseSUI(suiBid?.length > 0 && suiBid !== "." ? suiBid : "0");

	// Why do we need this
	// const resetForm = useCallback(() => {
	// 	resetMutation();
	// 	reset({
	// 		bid: "",
	// 	});
	// }, [reset, resetMutation]);

	// useEffect(() => {
	// 	if (suiBid) {
	// 		trigger();
	// 	}
	// }, [isSuiWalletConnected, suiBid, trigger]);

	// TOOD:
	// * show your current bid
	// * show your current position

	return (
		<FormProvider {...bidForm}>
			<form
				onSubmit={handleSubmit((formData) => {
					// TODO: handle the bid form data
					handleTransaction(mistBidAmount);
					// TODO: show result of tx
				})}
				className="flex justify-center w-full"
			>
				<Card className="w-full md:w-1/2">
					<CardContent className="p-4 rounded-lg text-white flex flex-col w-full gap-4 bg-azure-10">
						<div className="flex justify-between">
							<span className="text-2xl font-bold">Beelievers Bid</span>
						</div>
						<div className="flex flex-col w-full">
							<FormNumericInput
								required
								name="bid"
								placeholder={hasUserBidBefore ? "Enter bid amount" : "Minimum Bid: 1 SUI"}
								className="h-14"
								allowNegative={false}
								decimalScale={SUI}
								createEmptySpace
								rules={{
									validate: {
										minVal: (val: string) => validateBidAmount(val, hasUserBidBefore),
									},
								}}
							/>
							<FormInput
								name="note"
								placeholder="Add note..."
								className="h-14"
								createEmptySpace
								maxLength={30}
							/>
							<Button>Bid Amount</Button>
						</div>
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
