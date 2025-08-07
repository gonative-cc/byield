import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { AuctionInstructions } from "./AuctionInstructions";
import { CheckEligible } from "./CheckEligible";
import { AuctionTable } from "./AuctionTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Info } from "lucide-react";

function InstructionsModal() {
	return (
		<DialogContent className="max-w-2xl">
			<DialogHeader>
				<DialogTitle className="text-xl text-primary">How The Auction Works</DialogTitle>
			</DialogHeader>
			<div className="flex flex-col gap-4">
				<AuctionInstructions
					key="auction-mechanism"
					heading="Auction Mechanism"
					instructions={[
						{
							id: "inst-1",
							content: "You bid what you're willing to pay.",
						},
						{
							id: "inst-2",
							content: "Everyone who wins pays the lowest winning bid.",
						},
						{
							id: "inst-3",
							content: "If you bid higher than the clearing price, the extra is refunded.",
						},
					]}
				/>
				<AuctionInstructions
					key="mint-distribution"
					heading="Mint Distribution"
					instructions={[
						{
							id: "inst-4",
							content: "600 NFTs per day will be auctioned across 10 days.",
						},
						{
							id: "inst-5",
							content: "NFTs will be airdropped to winning bidders.",
						},
						{
							id: "inst-6",
							content: (
								<li key="inst-6">
									Secondary sales will take place on
									<Link
										target="_blank"
										to="https://docs.sui.io/guides/developer/getting-started/get-coins"
										rel="noreferrer"
									>
										<Button type="button" variant="link" className="p-0 pl-1 text-base">
											TradePort.
										</Button>
									</Link>
								</li>
							),
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
		bidders: number;
		highest_bid: number;
		entry_bid: number;
	};
	eligibilityData?: {
		isEligible?: boolean;
		type?: EligibilityTypeEnum;
		isError?: boolean;
	};
	isCheckingEligibility?: boolean;
	onCheckEligibility?: () => void;
}

export function BeelieversAuction({
	leaderBoardData: { leaders },
	eligibilityData,
	isCheckingEligibility,
	onCheckEligibility,
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
			<CheckEligible
				{...eligibilityData}
				isCheckingEligibility={isCheckingEligibility}
				onCheckEligibility={onCheckEligibility}
			/>
			<div className="flex flex-col-reverse md:flex-row gap-4 w-full">
				<AuctionTable data={leaders} />
			</div>
		</div>
	);
}
