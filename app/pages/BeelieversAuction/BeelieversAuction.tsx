import { Info } from "./Info";
import { AuctionTable } from "./AuctionTable";
import { AuctionTotals } from "./AuctionTotals";
import { BeelieversBid } from "./BeelieversBid";
import { Partners } from "~/components/Partners";
import type { LeaderboardResponse, EligibilityData } from "./types";

interface BeelieversAuctionProps {
	leaderBoardData: LeaderboardResponse;
	eligibilityData?: EligibilityData;
	isCheckingEligibility?: boolean;
}

export function BeelieversAuction({
	leaderBoardData: { leaders, unique_bidders, total_bids, entry_bid, auction_end_ms },
	eligibilityData,
}: BeelieversAuctionProps) {
	return (
		<div className="flex flex-col items-center gap-8 w-full relative">
			<p className="md:text-3xl text-2xl text-center font-semibold max-w-120">
				<span className="text-2xl text-primary md:text-3xl">🐝 BTCFi Beelievers</span> Auction
			</p>
			<AuctionTotals uniqueBidders={unique_bidders} totalBids={total_bids} entryBid={entry_bid} />
			<Info {...eligibilityData} auction_end_ms={auction_end_ms} />
			<BeelieversBid leaderBoardData={leaders} />
			<div className="flex flex-col-reverse md:flex-row gap-4 w-full">
				<AuctionTable
					data={leaders}
					leaderboardData={{
						unique_bidders,
						total_bids,
						highest_bid: Math.max(...leaders.map((l) => parseFloat(l.amount))),
						entry_bid,
						auction_end_ms,
					}}
				/>
			</div>
			<Partners />
		</div>
	);
}
