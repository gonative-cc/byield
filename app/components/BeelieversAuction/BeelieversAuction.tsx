import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Wallet } from "lucide-react";
import { Link } from "@remix-run/react";
import { AuctionInstructions } from "./AuctionInstructions";
import { AuctionTable, Bid } from "./AuctionTable";
import { Avatar } from "./Avatar";
import { BeelieversBid } from "./BeelieversBid";

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
								<li>
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
	data: {
		leaders: Bid[];
		bidders: number;
		highest_bid: number;
		entry_bid: number;
	};
}

export function BeelieversAuction({ data: { leaders } }: BeelieversAuctionProps) {
	// TODO: fetch from the API
	const isEligible = true;

	return (
		<div className="flex flex-col items-center gap-8 w-full">
			<p className="md:text-3xl text-2xl text-center font-semibold max-w-96">
				<span className="text-2xl text-primary md:text-3xl">Beelievers</span> Auction
			</p>
			{isEligible && (
				<Card className="w-1/2">
					<CardContent className="p-5 rounded-lg text-white flex gap-8 bg-azure-25">
						<img src="/assets/bee/bee-with-hammer.svg" alt="bee-with-hammer" />
						<div className="flex flex-col gap-2 justify-between py-4">
							<span className="text-2xl font-bold leading-10">
								Participate in <br /> Beelievers Auction
							</span>
							<span className="text-sm">
								You bid your true value; winners pay the lowest winning bid. Any amount above the
								clearing price is refunded.
							</span>
							<Button className="flex w-[163px]">
								<Wallet />
								Check Eligibility
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
			{isEligible && <Avatar />}
			<BeelieversBid />
			<div className="flex gap-4 w-full">
				<AuctionTable data={leaders} />
				<Instructions />
			</div>
		</div>
	);
}
