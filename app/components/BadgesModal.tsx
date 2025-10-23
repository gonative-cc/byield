import { DialogTrigger } from "@radix-ui/react-dialog";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { primaryForegroundHalfOpacity, primaryHeadingClasses } from "~/util/tailwind";

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
				<button className="btn btn-primary btn-outline">🏆 {msg}</button>
			</DialogTrigger>
			<DialogContent className="max-h-[80vh] w-[95vw] max-w-4xl overflow-y-auto sm:w-full">
				<DialogHeader>
					<DialogTitle className={primaryHeadingClasses()}>🏆 Auction Badges</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-6 lg:flex-row">
					{/* Left side - Badges grid */}
					<div className="flex-1">
						<div className="grid grid-cols-4 gap-2 sm:grid-cols-6 sm:gap-3 lg:grid-cols-5">
							{BADGES.map((badge) => (
								<button
									key={badge.filename}
									onClick={() => setSelectedBadge(badge)}
									className={`group bg-primary border-primary flex flex-col items-center rounded-lg border p-2 text-white transition-all duration-200`}
								>
									<img
										src={badge.src}
										alt={badge.name}
										className="h-10 w-10 object-contain transition-transform duration-200 group-hover:scale-110 md:h-16 md:w-16"
									/>
									<span className="mt-1 text-center leading-tight font-medium">
										{badge.name}
									</span>
								</button>
							))}
						</div>
					</div>

					{/* Right side - Badge details */}
					{selectedBadge && (
						<div className="border-primary/20 flex justify-center pt-4 lg:w-80 lg:border-t-0 lg:border-l lg:pt-0">
							<div className="flex flex-col items-center space-y-3 sm:space-y-4">
								<img
									src={selectedBadge.src}
									alt={selectedBadge.name}
									className={`bg-primary h-60 w-60 rounded-lg object-contain text-white ${primaryForegroundHalfOpacity}`}
								/>
								<h3 className="text-primary text-center text-lg font-bold sm:text-xl">
									{selectedBadge.name}
								</h3>
								<p className="text-muted-foreground text-center text-sm sm:text-base">
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
