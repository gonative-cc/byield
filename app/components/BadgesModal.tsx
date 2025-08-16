import { DialogTrigger } from "@radix-ui/react-dialog";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { Button } from "./ui/button";

interface BadgeInfo {
	name: string;
	filename: string;
	src: string;
	description: string;
}

const BADGES: BadgeInfo[] = [
	{
		name: "First Place",
		filename: "Sui_Logo_1stspot.svg",
		src: "/assets/auction/badges/Sui_Logo_1stspot.svg",
		description: "Achieved the #1 position in the auction",
	},
	{
		name: "Top 3",
		filename: "Crown_top_3.svg",
		src: "/assets/auction/badges/Crown_top_3.svg",
		description: "Secured a spot in the top 3 positions",
	},
	{
		name: "Top 10",
		filename: "Native_top10.svg",
		src: "/assets/auction/badges/Native_top10.svg",
		description: "Made it to the top 10 leaderboard",
	},
	{
		name: "Top 21",
		filename: "Bitcoin_top21.svg",
		src: "/assets/auction/badges/Bitcoin_top21.svg",
		description: "Ranked in the top 21 bidders",
	},
	{
		name: "Top 100",
		filename: "Whale_for_top_100.svg",
		src: "/assets/auction/badges/Whale_for_top_100.svg",
		description: "Whale status - top 100 position",
	},
	{
		name: "Top 5810",
		filename: "Everyone_in_top_5810_positions.svg",
		src: "/assets/auction/badges/Everyone_in_top_5810_positions.svg",
		description: "Qualified for NFT minting - top 5810",
	},
	{
		name: "Highest Bid",
		filename: "highest_single_bid.svg",
		src: "/assets/auction/badges/highest_single_bid.svg",
		description: "Made the highest single bid",
	},
	{
		name: "10+ SUI Bid",
		filename: "Single_bid_over_10_Sui.svg",
		src: "/assets/auction/badges/Single_bid_over_10_Sui.svg",
		description: "Single bid over 10 SUI",
	},
	{
		name: "5+ SUI Bid",
		filename: "Single_bid_over_5_Sui.svg",
		src: "/assets/auction/badges/Single_bid_over_5_Sui.svg",
		description: "Single bid over 5 SUI",
	},
	{
		name: "3+ SUI Bid",
		filename: "Single_bid_over_3_Sui.svg",
		src: "/assets/auction/badges/Single_bid_over_3_Sui.svg",
		description: "Single bid over 3 SUI",
	},
	{
		name: "10+ Bids",
		filename: "10_or_more_bids.svg",
		src: "/assets/auction/badges/10_or_more_bids.svg",
		description: "Made 10 or more bids",
	},
	{
		name: "20+ Bids",
		filename: "20_or_more_bids.svg",
		src: "/assets/auction/badges/20_or_more_bids.svg",
		description: "Made 20 or more bids",
	},
	{
		name: "5+ Bids",
		filename: "made_5_or_more_bids.svg",
		src: "/assets/auction/badges/made_5_or_more_bids.svg",
		description: "Made 5 or more bids",
	},
	{
		name: "Partner WL",
		filename: "Partner_WL_addresses_badge.svg",
		src: "/assets/auction/badges/Partner_WL_addresses_badge.svg",
		description: "Partner whitelist member",
	},
	{
		name: "First 500",
		filename: "first_500_bids.svg",
		src: "/assets/auction/badges/first_500_bids.svg",
		description: "Among first 500 bidders",
	},
	{
		name: "First 1000",
		filename: "first_1000_bids.svg",
		src: "/assets/auction/badges/first_1000_bids.svg",
		description: "Among first 1000 bidders",
	},
];

export function BadgesModal() {
	const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-200"
				>
					🏆 View All Badges
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto w-[95vw] sm:w-full">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-primary">🏆 Auction Badges</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col lg:flex-row gap-6">
					{/* Left side - Badges grid */}
					<div className="flex-1">
						<div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2 sm:gap-3">
							{BADGES.map((badge) => (
								<button
									key={badge.filename}
									onClick={() => setSelectedBadge(badge)}
									className={`flex flex-col items-center p-2 rounded-lg border transition-all duration-200 group ${
										selectedBadge?.filename === badge.filename
											? "border-primary bg-primary/10"
											: "border-primary/20 hover:border-primary/50 hover:bg-primary/5"
									}`}
								>
									<img
										src={badge.src}
										alt={badge.name}
										className="md:w-16 md:h-16 w-10 h-10 object-contain group-hover:scale-110 transition-transform duration-200"
									/>
									<span className="mt-1 text-center font-medium leading-tight">
										{badge.name}
									</span>
								</button>
							))}
						</div>
					</div>

					{/* Right side - Badge details */}
					{selectedBadge && (
						<div className="lg:w-80 lg:border-l border-primary/20 lg:border-t-0 pt-4 lg:pt-0 flex items-center justify-center">
							<div className="flex flex-col items-center space-y-3 sm:space-y-4">
								<img
									src={selectedBadge.src}
									alt={selectedBadge.name}
									className="text-white w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 object-contain"
								/>
								<h3 className="text-lg sm:text-xl font-bold text-primary text-center">
									{selectedBadge.name}
								</h3>
								<p className="text-sm sm:text-base text-center text-muted-foreground">
									{selectedBadge.description}
								</p>
							</div>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
