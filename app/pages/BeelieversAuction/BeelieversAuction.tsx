import { useState } from "react";
import { Info } from "./Info";
import { AuctionTable } from "./AuctionTable";
import { AuctionTotals } from "./AuctionTotals";
import { BeelieversBid } from "./BeelieversBid";
import { Partners } from "~/components/Partners";
import type { LeaderboardResponse, EligibilityData } from "./types";
import { TweetEmbed } from "~/components/TweetEmbed";
import { AuctionState } from "./types";
import moment from "moment";
import { BadgesModal } from "~/components/BadgesModal";
import { Button } from "~/components/ui/button";

function getAuctionState(startMs: number, endMs: number): AuctionState {
	const now = moment();
	if (now.isBefore(moment(startMs))) return AuctionState.WILL_START;
	if (now.isBefore(moment(endMs))) return AuctionState.STARTED;
	return AuctionState.ENDED;
}

interface BeelieversAuctionProps {
	leaderBoardData: LeaderboardResponse;
	eligibilityData?: EligibilityData;
}

export function BeelieversAuction({
	leaderBoardData: { leaders, unique_bidders, total_bids, entry_bid, auction_start_ms, auction_end_ms },
	eligibilityData,
}: BeelieversAuctionProps) {
	const twitterPost = "https://twitter.com/goNativeCC/status/1956370231191818263";
	const auctionState = getAuctionState(auction_start_ms, auction_end_ms);

	return (
		<div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 w-full relative">
			{/* Hero Title with Animation */}
			<div className="flex flex-col items-center gap-4">
				<p className="md:text-3xl text-2xl text-center font-semibold max-w-120">
					<span className="text-2xl text-primary md:text-3xl">🐝 BTCFi Beelievers</span> Auction
				</p>
				<Button
					onClick={() => setShowBadgesModal(true)}
					variant="outline"
					className="border-primary/30 hover:border-primary hover:bg-primary/10 transition-all duration-200"
				>
					🏆 View All Badges
				</Button>
			</div>
			{/* Auction Stats with Staggered Animation */}
			{auctionState !== AuctionState.WILL_START && (
				<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-300 w-full flex justify-center">
					<AuctionTotals
						uniqueBidders={unique_bidders}
						totalBids={total_bids}
						entryBid={entry_bid}
					/>
				</div>
			)}

			{/* Info Section with Animation */}
			<div className="animate-in slide-in-from-left-4 duration-1000 delay-400 w-full flex justify-center">
				<Info
					{...eligibilityData}
					auction_start_ms={auction_start_ms}
					auction_end_ms={auction_end_ms}
					auctionState={auctionState}
				/>
			</div>

			{/* Bid Section with Animation */}
			<div className="animate-in slide-in-from-right-4 duration-1000 delay-500 w-full flex justify-center">
				<BeelieversBid leaderBoardData={leaders} auctionState={auctionState} />
			</div>

			{/* Leaderboard Table with Animation */}
			{auctionState !== AuctionState.WILL_START && (
				<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-600 w-full">
					<div className="flex flex-col-reverse lg:flex-row gap-6 w-full">
						<AuctionTable data={leaders} />
					</div>
				</div>
			)}
			{/* Twitter post */}
			<TweetEmbed src={twitterPost} />

			{/* Partners Section with Animation */}
			<div className="animate-in fade-in-0 duration-1000 delay-700 w-full">
				<Partners />
			</div>

			{/* Badges Modal */}
			<BadgesModal />
		</div>
	);
}
