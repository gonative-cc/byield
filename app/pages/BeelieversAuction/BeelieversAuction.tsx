import { Info } from "./Info";
import { AuctionTable } from "./AuctionTable";
import { AuctionTotals } from "./AuctionTotals";
import { BeelieversBid } from "./BeelieversBid";
import { Partners } from "~/components/Partners";
import { TweetEmbed } from "~/components/TweetEmbed";
import { AuctionState } from "./types";
import type { AuctionDetails, Bidder, User } from "~/server/BeelieversAuction/types";
import { useFetcher } from "react-router";
import { useContext, useEffect, useRef } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";

function getAuctionState(startMs: number, endMs: number): AuctionState {
	const nowMs = new Date().getTime();
	if (nowMs < startMs) return AuctionState.WILL_START;
	if (nowMs < endMs) return AuctionState.STARTED;
	return AuctionState.ENDED;
}

interface BeelieversAuctionProps {
	auctionDetails: AuctionDetails;
	leaderboard: Bidder[];
	user?: User;
}

export function BeelieversAuction({
	auctionDetails: { uniqueBidders, totalBids, entryBidMist, startsAt, endsAt },
	leaderboard,
	user,
}: BeelieversAuctionProps) {
	const { suiAddr } = useContext(WalletContext);
	const lastCheckedAddress = useRef<string | null>(null);
	const fetcher = useFetcher();

	useEffect(() => {
		if (suiAddr && suiAddr !== lastCheckedAddress.current && fetcher.state === "idle") {
			// Wallet connected or address changed - check eligibility
			lastCheckedAddress.current = suiAddr;
			fetcher.submit(
				{ method: "queryUser", params: [suiAddr] },
				{ method: "POST", encType: "application/json" },
			);
		} else if (!suiAddr && lastCheckedAddress.current) {
			// Wallet disconnected - reset state
			lastCheckedAddress.current = null;
		}
	}, [fetcher, fetcher.state, suiAddr]);

	const userAccountType = user?.wlStatus;
	const twitterPost = "https://twitter.com/goNativeCC/status/1956370231191818263";
	const auctionState = getAuctionState(startsAt, endsAt);

	return (
		<div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 w-full relative">
			{/* Hero Title with Animation */}
			<div className="flex flex-col items-center gap-4">
				<p className="md:text-3xl text-2xl text-center font-semibold max-w-120">
					<span className="text-2xl text-primary md:text-3xl">🐝 BTCFi Beelievers</span> Auction
				</p>
			</div>
			{/* Auction Stats with Staggered Animation */}
			{auctionState !== AuctionState.WILL_START && (
				<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-300 w-full flex justify-center">
					<AuctionTotals
						uniqueBidders={uniqueBidders}
						totalBids={totalBids}
						entryBidMist={entryBidMist}
					/>
				</div>
			)}

			{/* Info Section with Animation */}
			<div className="animate-in slide-in-from-left-4 duration-1000 delay-400 w-full flex justify-center">
				<Info
					userAccountType={userAccountType}
					auction_start_ms={startsAt}
					auction_end_ms={endsAt}
					auctionState={auctionState}
				/>
			</div>

			{/* Bid Section with Animation */}
			<div className="animate-in slide-in-from-right-4 duration-1000 delay-500 w-full flex justify-center">
				<BeelieversBid leaderBoardData={leaderboard} auctionState={auctionState} />
			</div>

			{/* Leaderboard Table with Animation */}
			{auctionState !== AuctionState.WILL_START && (
				<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-600 w-full">
					<div className="flex flex-col-reverse lg:flex-row gap-6 w-full">
						<AuctionTable data={leaderboard} />
					</div>
				</div>
			)}
			{/* Twitter post */}
			<TweetEmbed src={twitterPost} />

			{/* Partners Section with Animation */}
			<div className="animate-in fade-in-0 duration-1000 delay-700 w-full">
				<Partners />
			</div>
		</div>
	);
}
