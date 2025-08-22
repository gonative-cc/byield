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
		filename: "Sui_Logo_1stspot.webp",
		src: "/assets/auction/badges/Sui_Logo_1stspot.webp",
		description: "Achieved the #1 position in the auction",
	},
	{
		name: "Top 3",
		filename: "Crown_top_3.webp",
		src: "/assets/auction/badges/Crown_top_3.webp",
		description: "Secured a spot in the top 3 positions",
	},
	{
		name: "Top 10",
		filename: "Native_top10.webp",
		src: "/assets/auction/badges/Native_top10.webp",
		description: "Secured a spot in the top 10 positions",
	},
	{
		name: "Top 21",
		filename: "Bitcoin_top21.webp",
		src: "/assets/auction/badges/Bitcoin_top21.webp",
		description: "Secured a spot in the top 21 positions",
	},
	{
		name: "Top 100",
		filename: "Whale_for_top_100.webp",
		src: "/assets/auction/badges/Whale_for_top_100.webp",
		description: "Secured a spot in the top 100 positions",
	},
	// {
	// 	name: "Highest Bid",
	// 	filename: "highest_single_bid.webp",
	// 	src: "/assets/auction/badges/highest_single_bid.webp",
	// 	description: "Made the highest single bid",
	// },
	{
		name: "10+ $SUI Bid",
		filename: "Single_bid_over_10_Sui.webp",
		src: "/assets/auction/badges/Single_bid_over_10_Sui.webp",
		description: "Single bid over 10 $SUI",
	},
	{
		name: "5+ $SUI Bid",
		filename: "Single_bid_over_5_Sui.webp",
		src: "/assets/auction/badges/Single_bid_over_5_Sui.webp",
		description: "Single bid over 5 $SUI",
	},
	{
		name: "3+ $SUI Bid",
		filename: "Single_bid_over_3_Sui.webp",
		src: "/assets/auction/badges/Single_bid_over_3_Sui.webp",
		description: "Single bid over 3 $SUI",
	},
	{
		name: "10+ Bids",
		filename: "10_or_more_bids.webp",
		src: "/assets/auction/badges/10_or_more_bids.webp",
		description: "Made 10 or more bids",
	},
	{
		name: "20+ Bids",
		filename: "20_or_more_bids.webp",
		src: "/assets/auction/badges/20_or_more_bids.webp",
		description: "Made 20 or more bids",
	},
	{
		name: "5+ Bids",
		filename: "made_5_or_more_bids.webp",
		src: "/assets/auction/badges/made_5_or_more_bids.webp",
		description: "Made 5 or more bids",
	},
	{
		name: "Partner WL",
		filename: "Partner_WL_addresses_badge.webp",
		src: "/assets/auction/badges/Partner_WL_addresses_badge.webp",
		description: "Partner whitelist member",
	},
	{
		name: "First 500",
		filename: "first_500_bids.webp",
		src: "/assets/auction/badges/first_500_bids.webp",
		description: "Among first 500 bidders",
	},
	{
		name: "First 1000",
		filename: "first_1000_bids.webp",
		src: "/assets/auction/badges/first_1000_bids.webp",
		description: "Among first 1000 bidders",
	},
	{
		name: "Climb up 210 spots",
		filename: "anyone_climbs_more_than_210_positions_up.webp",
		src: "/assets/auction/badges/anyone_climbs_more_than_210_positions_up.webp",
		description: "Climb more than 210 spots",
	},
	{
		name: "Climb 10 spots",
		filename: "if_anyone_climbs_10_spots_in_a_single_bid.webp",
		src: "/assets/auction/badges/if_anyone_climbs_10_spots_in_a_single_bid.webp",
		description: "Climb 10 spots",
	},
	{
		name: "Last spot",
		filename: "Last_bid_in_Leaderboard.webp",
		src: "/assets/auction/badges/Last_bid_in_Leaderboard.webp",
		description: "Last spot in leaderboard",
	},
	{
		name: "Every 10th spot",
		filename: "Logo_Ika_red_every_10th_position.webp",
		src: "/assets/auction/badges/Logo_Ika_red_every_10th_position.webp",
		description: "Every 10th spot in the leaderboard",
	},
	{
		name: "nBTC every 21st spot",
		filename: "nbtc_every_21st_bidder.webp",
		src: "/assets/auction/badges/nbtc_every_21st_bidder.webp",
		description: "nBTC every 21st spot",
	},
	{
		name: "Dethrone",
		filename: "Who_dethrones_someone_and_gets_number_1_spot.webp",
		src: "/assets/auction/badges/Who_dethrones_someone_and_gets_number_1_spot.webp",
		description: "Dethrones someone and gets number 1 spot",
	},
	{
		name: "Made 4th bid",
		filename: "Made_4th_bid.webp",
		src: "/assets/auction/badges/Made_4th_bid.webp",
		description: "Made 4th bid",
	},
	{
		name: "Made 3rd bid",
		filename: "made_3rd_bid.webp",
		src: "/assets/auction/badges/made_3rd_bid.webp",
		description: "Made 3rd bid",
	},
	{
		name: "Made 2nd bid",
		filename: "Made_2nd_bid.webp",
		src: "/assets/auction/badges/Made_2nd_bid.webp",
		description: "Made 2nd bid",
	},
	{
		name: "Top 5810",
		filename: "Everyone_in_top_5810.webp",
		src: "/assets/auction/badges/Everyone_in_top_5810.webp",
		description: "Secured a spot in the top 5810 positions",
	},
];

export function BadgesModal({ msg = "View All Badges" }: { msg?: string }) {
	const [selectedBadge, setSelectedBadge] = useState<BadgeInfo | null>(null);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button type="button" variant="outline">
					🏆 {msg}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto w-[95vw] sm:w-full">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-primary">🏆 Auction Badges</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col lg:flex-row gap-6">
					{/* Left side - Badges grid */}
					<div className="flex-1">
						<div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-5 gap-2 sm:gap-3">
							{BADGES.map((badge) => (
								<button
									key={badge.filename}
									onClick={() => setSelectedBadge(badge)}
									className={`bg-orange-500/50 text-white flex flex-col items-center p-2 rounded-lg border transition-all duration-200 group ${
										selectedBadge?.filename === badge.filename
											? "border-primary bg-orange-500/70"
											: "border-primary/20 hover:border-primary/50 hover:bg-orange-500/60"
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
						<div className="lg:w-80 lg:border-l border-primary/20 lg:border-t-0 pt-4 lg:pt-0 flex justify-center">
							<div className="flex flex-col items-center space-y-3 sm:space-y-4">
								<img
									src={selectedBadge.src}
									alt={selectedBadge.name}
									className="bg-orange-500/50 rounded-lg text-white w-60 h-60 object-contain"
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
