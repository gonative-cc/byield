import { Button } from "~/components/ui/button";
import { AuctionInstructions } from "./AuctionInstructions";
import { CheckEligible } from "./CheckEligible";
import { AuctionTable } from "./AuctionTable";
import { AuctionTotals } from "./AuctionTotals";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Info } from "lucide-react";
import type { EligibilityEnum } from "./types";

function InstructionsModal() {
	return (
		<DialogContent className="max-w-2xl">
			<DialogHeader>
				<DialogTitle className="text-xl text-primary">
					🐝 BTCFi Beelievers NFT Auction – How It Works
				</DialogTitle>
			</DialogHeader>
			<div className="flex flex-col gap-4">
				<span>💰 Auction Format: Fair & Transparent</span>
				<span>We’re letting the community set the price through a secondary-price auction.</span>
				<AuctionInstructions
					key="auction-mechanism"
					heading="How it works"
					instructions={[
						{
							id: "inst-1",
							content:
								"Place your bid – You can raise your bid anytime before the auction ends to improve your chances.",
						},
						{
							id: "inst-2",
							content:
								"Top 5,810 bidders win – Only the highest 5,810 bids will have chance to mint NFT.",
						},
						{
							id: "inst-3",
							content: `Pay the clearing price – All winners pay the same final price, which is the generalized "second price" - highest bid that didn't make it to the winning list.`,
						},
						{
							id: "inst-4",
							content:
								"Get refunds automatically – If you bid higher than the clearing price, the difference is refunded.",
						},
					]}
				/>
				<h2 className="font-semibold text-gray-900 dark:text-white">Simple example:</h2>
				<span className="text-gray-500">
					Top 5,810 bids range from 12 SUI to 6.2 SUI. Everyone in the top 5,810 pays 6.2 SUI, and
					extra amounts are refunded.
				</span>
				<AuctionInstructions
					key="mint-distribution"
					heading="Key Points"
					instructions={[
						{
							id: "inst-4",
							content: "You can increase your bid any time until the auction closes.",
						},
						{
							id: "inst-5",
							content:
								"Being in the top 5,810 at the close guarantees you a chance to mint NFT.",
						},
						{
							id: "inst-6",
							content:
								"User deposits money on chain to make a bid, everything else is off chain.This way, we can do the all UI features more user friendly.",
						},
					]}
				/>
			</div>
		</DialogContent>
	);
}

interface BeelieversAuctionProps {
	leaderBoardData: {
		isError: boolean;
		leaders: {
			rank: number;
			bidder: string;
			amount: string;
		}[];
		unique_bidders: number;
		total_bids: number;
		highest_bid: number;
		entry_bid: number;
	};
	eligibilityData?: {
		type?: EligibilityEnum;
		isError?: boolean;
	};
	isCheckingEligibility?: boolean;
}

export function BeelieversAuction({
	leaderBoardData: { leaders, unique_bidders, total_bids },
	eligibilityData,
}: BeelieversAuctionProps) {
	return (
		<div className="flex flex-col items-center gap-8 w-full relative">
			<Dialog>
				<DialogTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="absolute top-0 left-0 p-2 hover:bg-gray-100 rounded-full"
						aria-label="View auction instructions"
					>
						<Info className="h-5 w-5 text-primary" /> Info
					</Button>
				</DialogTrigger>
				<InstructionsModal />
			</Dialog>
			<p className="md:text-3xl text-2xl text-center font-semibold max-w-96">
				<span className="text-2xl text-primary md:text-3xl">Beelievers</span> Auction
			</p>
			<AuctionTotals uniqueBidders={unique_bidders} totalBids={total_bids} />
			<CheckEligible {...eligibilityData} />
			<div className="flex flex-col-reverse md:flex-row gap-4 w-full">
				<AuctionTable data={leaders} />
			</div>
		</div>
	);
}
