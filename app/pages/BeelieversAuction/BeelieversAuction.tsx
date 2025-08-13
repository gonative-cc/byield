import { Info } from "./Info";
import { AuctionTable } from "./AuctionTable";
import { AuctionTotals } from "./AuctionTotals";
import type { AuctionAccountType } from "./types";
import { BeelieversBid } from "./BeelieversBid";
import { TwitterShareButton } from "~/components/TwitterShareButton";

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
		auction_end_timestamp: number;
	};
	eligibilityData?: {
		type?: AuctionAccountType;
		isError?: boolean;
	};
	isCheckingEligibility?: boolean;
}

export function BeelieversAuction({
	leaderBoardData: { leaders, unique_bidders, total_bids, entry_bid, auction_end_timestamp },
	eligibilityData,
}: BeelieversAuctionProps) {
	const tweet = `Just placed my bid in the @goNativeCC BTCFi Beelievers NFT auction!
Securing my spot in the top 5810 at beelieversNFT.gonative.cc`;

	return (
		<div className="flex flex-col items-center gap-8 w-full relative">
			<p className="md:text-3xl text-2xl text-center font-semibold max-w-120">
				<span className="text-2xl text-primary md:text-3xl">🐝 BTCFi Beelievers</span> Auction
			</p>
			<AuctionTotals uniqueBidders={unique_bidders} totalBids={total_bids} entryBid={entry_bid} />
			<TwitterShareButton shareContent="Just placed my bid in the @goNativeCC BTCFi Beelievers NFT auction! \n\nSecuring my spot in the top 5810 at beelieversNFT.gonative.cc" />
			<Info {...eligibilityData} auction_end_timestamp={auction_end_timestamp} />
			<BeelieversBid leaderBoardData={leaders} />
			<div className="flex flex-col-reverse md:flex-row gap-4 w-full">
				<AuctionTable data={leaders} />
			</div>
		</div>
	);
}
