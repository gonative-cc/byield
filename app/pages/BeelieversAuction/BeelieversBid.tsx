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
import { makeReq } from "~/server/BeelieversAuction/jsonrpc";
import { AuctionState } from "./types";
import { useBid } from "./useBid";
import { useFetcher } from "react-router";

interface MyPositionProps {
	userBid?: Bidder;
	hasUserBidBefore: boolean;
}

function MyPosition({ userBid, hasUserBidBefore }: MyPositionProps) {
	if (!userBid) return;
	return (
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
								{hasUserBidBefore ? `Rank ${userBid.rank}` : "No bid placed"}
							</p>
						</div>
					</div>
					{hasUserBidBefore && (
						<div className="text-right">
							<p className="text-2xl font-bold text-primary">{userBid.amount} SUI</p>
							{userBid?.note && (
								<p className="text-sm text-muted-foreground">{userBid.note}&quot;</p>
							)}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function validateBidAmount(val: string, hasUserBidBefore: boolean) {
	const bidAmount = Number(val);
	if (!hasUserBidBefore && bidAmount < 1) {
		return "First-time bidders must bid at least 1 SUI";
	}
	if (bidAmount <= 0) {
		return "Additional bid amount must be greater than 0";
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
	const { handleTransaction, isPending, isSuccess, isError, data, txData } = useBid();
	// TODO: we can get the data here, but we should not use it here!
	console.log(">>>>> txData in component", txData);
	const fetcher = useFetcher();
	const userBid = useMemo(
		() => (suiAddr ? leaderBoardData.find((bid) => bid.bidder === suiAddr) : undefined),
		[leaderBoardData, suiAddr],
	);
	const hasUserBidBefore = (userBid && userBid.amount !== 0) || false;

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
	const onSubmit = handleSubmit(async ({ bid, note }) => {
		try {
			await handleTransaction(mistBidAmount);
			if (data?.digest && suiAddr)
				makeReq(fetcher, {
					method: "postBidTx",
					params: [data.digest, suiAddr, Number(bid), note || ""],
				});
		} catch (error) {
			console.error("Transaction failed:", error);
		}
	});

	return (
		<FormProvider {...bidForm}>
			<form onSubmit={onSubmit} className="flex justify-center w-full">
				<div className="w-full lg:w-2/3 xl:w-1/2 space-y-6">
					<MyPosition userBid={userBid} hasUserBidBefore={hasUserBidBefore} />

					<Card className="shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300 animate-in slide-in-from-bottom-2 duration-700">
						<CardContent className="p-6 lg:p-8 rounded-lg text-white flex flex-col w-full gap-6 bg-gradient-to-br from-azure-10 via-azure-15 to-azure-20">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-orange-400 flex items-center justify-center animate-pulse-glow">
										<span className="text-2xl">🐝</span>
									</div>
									<div>
										<h2 className="text-2xl lg:text-3xl font-bold text-primary">
											Place Your Bid
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
									<div className="text-sm font-medium text-foreground/80">
										<span className="text-lg">💰 </span>
										{hasUserBidBefore
											? "Enter SUI amount you want to add to your previous bid"
											: "First-time bidders: minimum bid is 1 SUI"}
									</div>
									<FormNumericInput
										required
										name="bid"
										placeholder={
											hasUserBidBefore
												? "Enter SUI amount you want to add"
												: "Minimum: 1 SUI for the first bid"
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
										Message to Beelievers (optional)
									</div>
									<FormInput
										name="note"
										placeholder="Add a personal note (max 30 characters)..."
										className="h-14 lg:h-16 border-primary/30 focus:border-primary hover:border-primary/50 transition-colors"
										createEmptySpace
										maxLength={30}
									/>
								</div>

								<Button
									disabled={isPending || isSuccess}
									className="h-14 lg:h-16 text-lg font-semibold bg-gradient-to-r from-primary to-orange-400 hover:from-orange-400 hover:to-primary transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<span className="flex items-center gap-2">
										<span className="text-xl">🚀</span>
										{hasUserBidBefore ? "Update Bid" : "Place Bid"}
									</span>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</form>
		</FormProvider>
	);
}
