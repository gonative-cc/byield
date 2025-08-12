import { FormProvider, useForm } from "react-hook-form";
import { useContext, useMemo } from "react";
import { SUI } from "~/lib/denoms";
import { Card, CardContent } from "~/components/ui/card";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { Button } from "~/components/ui/button";
import { FormInput } from "~/components/form/FormInput";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import type { Bid } from "./AuctionTable";

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

	const hasUserBidBefore = useMemo(
		() => (suiAddr ? leaderBoardData.some((bid) => bid.bidder === suiAddr) : false),
		[leaderBoardData, suiAddr],
	);

	const bidForm = useForm<BeelieversBidForm>({
		mode: "all",
		reValidateMode: "onChange",
		defaultValues: {
			bid: "",
			note: "",
		},
	});
	const { handleSubmit } = bidForm;

	return (
		<FormProvider {...bidForm}>
			<form
				onSubmit={handleSubmit((formData) => {
					// TODO: handle the bid form data
					console.log("Depositing with Sui Address:", formData);
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
							<span className="text-sm self-center">Auction ends in 00 : 23 :12</span>
						</div>
					</CardContent>
				</Card>
			</form>
		</FormProvider>
	);
}
