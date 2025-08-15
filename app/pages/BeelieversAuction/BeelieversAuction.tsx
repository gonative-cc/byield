import { Info } from "./Info";
import { AuctionTable } from "./AuctionTable";
import { AuctionTotals } from "./AuctionTotals";
import { BeelieversBid } from "./BeelieversBid";
import { Partners } from "~/components/Partners";
import type { LeaderboardResponse, EligibilityData } from "./types";

interface BeelieversAuctionProps {
	leaderBoardData: LeaderboardResponse;
	eligibilityData?: EligibilityData;
}

export function BeelieversAuction({
	leaderBoardData: { leaders, unique_bidders, total_bids, entry_bid, auction_start_ms, auction_end_ms },
	eligibilityData,
}: BeelieversAuctionProps) {
	return (
		<div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 w-full relative">
			{/* Hero Title with Animation */}
			<p className="md:text-3xl text-2xl text-center font-semibold max-w-120">
				<span className="text-2xl text-primary md:text-3xl">🐝 BTCFi Beelievers</span> Auction
			</p>

			{/* Auction Stats with Staggered Animation */}
			<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-300 w-full flex justify-center">
				<AuctionTotals uniqueBidders={unique_bidders} totalBids={total_bids} entryBid={entry_bid} />
			</div>

			{/* Info Section with Animation */}
			<div className="animate-in slide-in-from-left-4 duration-1000 delay-400 w-full flex justify-center">
				<Info
					{...eligibilityData}
					auction_start_ms={auction_start_ms}
					auction_end_ms={auction_end_ms}
				/>
			</div>

			{/* Bid Section with Animation */}
			<div className="animate-in slide-in-from-right-4 duration-1000 delay-500 w-full flex justify-center">
				<BeelieversBid leaderBoardData={leaders} />
			</div>

			{/* Leaderboard Table with Animation */}
			<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-600 w-full">
				<div className="flex flex-col-reverse lg:flex-row gap-6 w-full">
					<AuctionTable data={leaders} />
				</div>
			</div>

			{/* Partners Section with Animation */}
			<div className="animate-in fade-in-0 duration-1000 delay-700 w-full">
				<Partners />
			</div>
		</div>
	);
}
