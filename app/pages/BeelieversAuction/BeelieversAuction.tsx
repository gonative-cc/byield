import { Info } from "./Info";
import { AuctionTable } from "./AuctionTable";
import { AuctionTotals } from "./AuctionTotals";
import type { AuctionAccountType } from "./types";
import { BeelieversBid } from "./BeelieversBid";

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
		type?: AuctionAccountType;
		isError?: boolean;
	};
	isCheckingEligibility?: boolean;
}

export function BeelieversAuction({
	leaderBoardData: { leaders, unique_bidders, total_bids, entry_bid },
	eligibilityData,
}: BeelieversAuctionProps) {
	return (
		<div className="flex flex-col items-center gap-8 w-full relative">
			<p className="md:text-3xl text-2xl text-center font-semibold max-w-120">
				<span className="text-2xl text-primary md:text-3xl">🐝 BTCFi Beelievers</span> Auction
			</p>
			<AuctionTotals uniqueBidders={unique_bidders} totalBids={total_bids} entryBid={entry_bid} />
			<Info {...eligibilityData}></Info>
			<BeelieversBid leaderBoardData={leaders} />
			<div className="flex flex-col-reverse md:flex-row gap-4 w-full">
				<AuctionTable data={leaders} />
			</div>
		</div>
	);
}
