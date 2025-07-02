import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Link } from "@remix-run/react";
import { AuctionInstructions } from "../../components/BeelieversAuction/AuctionInstructions";
import { AuctionTable } from "../../components/BeelieversAuction/AuctionTable";
import { CheckEligible } from "../../components/BeelieversAuction/CheckEligible";

function Instructions() {
	return (
		<Card className="w-full h-fit">
			<CardContent className="p-5 rounded-lg text-white flex flex-col gap-2 bg-azure-20">
				<span className="text-xl text-primary">How The Auction Works</span>
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
			</CardContent>
		</Card>
	);
}

interface BeelieversAuctionProps {
	leaderBoardData: {
		isError: boolean;
		leaders: {
			rank: number;
			bidder: string;
			time: number;
			amount: string;
		}[];
		bidders: number;
		highest_bid: number;
		entry_bid: number;
	};
	eligibilityData?: {
		isEligible: boolean;
		isError: boolean;
	};
}

export function BeelieversAuction({ leaderBoardData: { leaders }, eligibilityData }: BeelieversAuctionProps) {
	return (
		<div className="flex flex-col items-center gap-8 w-full">
			<p className="md:text-3xl text-2xl text-center font-semibold max-w-96">
				<span className="text-2xl text-primary md:text-3xl">Beelievers</span> Auction
			</p>
			<CheckEligible isEligible={eligibilityData?.isEligible} />
			<div className="flex flex-col-reverse md:flex-row gap-4 w-full">
				<AuctionTable data={leaders} />
				<Instructions />
			</div>
		</div>
	);
}
