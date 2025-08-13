import { AuctionInstructions } from "./AuctionInstructions";
import { CheckEligible } from "./CheckEligible";
import { AuctionTable } from "./AuctionTable";
import { AuctionTotals } from "./AuctionTotals";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "~/components/ui/accordion";
import type { EligibilityEnum } from "./types";

function InstructionsAccordion() {
	return (
		<Accordion className="w-full max-w-5xl" type="single" collapsible>
			<AccordionItem value="item-1">
				<AccordionTrigger className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
					🐝 BTCFi Beelievers NFT Auction – How It Works
				</AccordionTrigger>
				<AccordionContent>
					<div className="space-y-6">
						<div>
							<div className="flex items-center gap-2 mb-2">
								<span className="text-2xl">💰</span>
								<span className="font-semibold text-lg text-primary">
									Auction Format: Fair & Transparent
								</span>
							</div>
							<p className="text-foreground/90">
								We&apos;re letting the community set the price through a secondary-price
								auction.
							</p>
						</div>
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
						<div>
							<h3 className="font-semibold text-lg text-primary/90 mb-2 flex items-center gap-2">
								<span className="text-xl">📊</span>
								Simple example:
							</h3>
							<p className="text-foreground/80">
								Top 5,810 bids range from 12 SUI to 6.2 SUI. Everyone in the top 5,810 pays
								6.2 SUI, and extra amounts are refunded.
							</p>
						</div>
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
										"User deposits money on chain to make a bid, everything else is off chain. This way, we can do all UI features more user friendly.",
								},
							]}
						/>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
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
			<p className="md:text-3xl text-2xl text-center font-semibold max-w-96">
				<span className="text-2xl text-primary md:text-3xl">Beelievers</span> Auction
			</p>
			<InstructionsAccordion />
			<AuctionTotals uniqueBidders={unique_bidders} totalBids={total_bids} />
			<CheckEligible {...eligibilityData} leaderBoardData={leaders} />
			<div className="flex flex-col-reverse md:flex-row gap-4 w-full">
				<AuctionTable data={leaders} />
			</div>
		</div>
	);
}
