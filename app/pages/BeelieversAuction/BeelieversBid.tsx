import { FormProvider, useForm } from "react-hook-form";
import { useContext, useMemo } from "react";
import { parseSUI, SUI } from "~/lib/denoms";
import { Card, CardContent } from "~/components/ui/card";
import { FormNumericInput } from "~/components/form/FormNumericInput";
import { Button } from "~/components/ui/button";
import { FormInput } from "~/components/form/FormInput";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { SuiModal } from "~/components/Wallet/SuiWallet/SuiModal";
import type { Bidder } from "~/server/BeelieversAuction/types";
import { AuctionState } from "./types";
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
	leaderBoardData?: Bidder[];
	auctionState?: AuctionState;
}

export function BeelieversBid({ leaderBoardData = [], auctionState }: BeelieversBidProps) {
	const { suiAddr } = useContext(WalletContext);
	const { handleTransaction, isPending, isSuccess, isError } = useBid();
	const hasUserBidBefore = useMemo(
		() => (suiAddr ? leaderBoardData.some((bid) => bid.bidder === suiAddr) : false),
		[leaderBoardData, suiAddr],
	);

	const userBid = useMemo(
		() => (suiAddr ? leaderBoardData.find((bid) => bid.bidder === suiAddr) : null),
		[leaderBoardData, suiAddr],
	);

	const bidForm = useForm<BeelieversBidForm>({
		mode: "all",
		reValidateMode: "onChange",
		disabled: isPending || isSuccess || isError,
		defaultValues: {
			bid: "", // value is in SUI, but later we need to convert to MIST.
			note: "",
		},
	});
	const { handleSubmit, watch } = bidForm;

	if (suiAddr == null) return <SuiModal />;
	if (auctionState !== AuctionState.STARTED) return null;

	const suiBid = watch("bid");

	const mistBidAmount = parseSUI(suiBid?.length > 0 && suiBid !== "." ? suiBid : "0");

	return (
		<FormProvider {...bidForm}>
			<form
				onSubmit={handleSubmit((_formData) => {
					handleTransaction(mistBidAmount);
					// TODO: Ravindra: create action to call controller postBidTx
					// TODO: Vu: show result of tx
				})}
				className="flex justify-center w-full"
			>
				<div className="w-full lg:w-2/3 xl:w-1/2 space-y-6">
					{/* Current Bid Status */}
					{userBid && (
						<Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 animate-in slide-in-from-top-2 duration-500">
							<CardContent className="p-4 lg:p-6">
								<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
											<span className="text-xl">🎯</span>
										</div>
										<div>
											<h3 className="font-semibold text-primary">Your Current Bid</h3>
											<p className="text-sm text-muted-foreground">
												Rank #{userBid.rank}
											</p>
										</div>
									</div>
									<div className="text-right">
										<p className="text-2xl font-bold text-primary">
											{userBid.amount} SUI
										</p>
										{userBid.note && (
											<p className="text-sm text-muted-foreground">
												{userBid.note}&quot;
											</p>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					)}

					{/* Bid Form */}
					<Card className="shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300 animate-in slide-in-from-bottom-2 duration-700">
						<CardContent className="p-6 lg:p-8 rounded-lg text-white flex flex-col w-full gap-6 bg-gradient-to-br from-azure-10 via-azure-15 to-azure-20">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center animate-pulse-glow">
										<span className="text-2xl">🐝</span>
									</div>
									<div>
										<h2 className="text-2xl lg:text-3xl font-bold text-primary">
											{hasUserBidBefore ? "Update Your Bid" : "Place Your Bid"}
										</h2>
										<p className="text-sm text-muted-foreground">
											{hasUserBidBefore
												? "Increase your bid to improve your rank"
												: "Join the auction and secure your NFT"}
										</p>
									</div>
								</div>
							</div>

							<div className="flex flex-col w-full space-y-4">
								<div className="space-y-2">
									<div className="text-sm font-medium text-foreground/80 flex items-center gap-2">
										<span className="text-lg">💰</span>
										Bid Amount (SUI)
									</div>
									<FormNumericInput
										required
										name="bid"
										placeholder={
											hasUserBidBefore ? "Enter new bid amount" : "Minimum: 1 SUI"
										}
										className="h-14 lg:h-16 text-lg border-primary/30 focus:border-primary hover:border-primary/50 transition-colors"
										allowNegative={false}
										decimalScale={SUI}
										createEmptySpace
										rules={{
											validate: {
												minVal: (val: string) =>
													validateBidAmount(val, hasUserBidBefore),
											},
										}}
									/>
								</div>

								<div className="space-y-2">
									<div className="text-sm font-medium text-foreground/80 flex items-center gap-2">
										<span className="text-lg">📝</span>
										Note (Optional)
									</div>
									<FormInput
										name="note"
										placeholder="Add a personal note (max 30 characters)..."
										className="h-14 lg:h-16 border-primary/30 focus:border-primary hover:border-primary/50 transition-colors"
										createEmptySpace
										maxLength={30}
									/>
								</div>

								<Button className="h-14 lg:h-16 text-lg font-semibold bg-gradient-to-r from-primary to-orange-400 hover:from-orange-400 hover:to-primary transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
									<span className="flex items-center gap-2">
										<span className="text-xl">🚀</span>
										{hasUserBidBefore ? "Update Bid" : "Place Bid"}
									</span>
								</Button>
							</div>

							{!hasUserBidBefore && (
								<div className="p-4 bg-primary/10 rounded-lg border border-primary/20 animate-in slide-in-from-bottom-1 duration-1000">
									<p className="text-sm text-center text-foreground/80">
										💡 <strong>First-time bidders:</strong> Minimum bid is 1 SUI to
										participate in the auction
									</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</form>
		</FormProvider>
	);
}
