import { Info } from "./Info";
import { AuctionTable } from "./AuctionTable";
import { AuctionTotals } from "./AuctionTotals";
import { BeelieversBid } from "./BeelieversBid";
import { Partners } from "~/components/Partners";
import { TweetEmbed } from "~/components/TweetEmbed";
import { AuctionState } from "./types";
import { BadgesModal } from "~/components/BadgesModal";
import type { AuctionDetails, Bidder } from "~/server/BeelieversAuction/types";
import { useFetcher } from "react-router";
import { useContext, useEffect, useRef } from "react";
import { WalletContext } from "~/providers/ByieldWalletProvider";

function getAuctionState(startMs: number, endMs: number): AuctionState {
	const nowMs = new Date().getTime();
	if (nowMs < startMs) return AuctionState.WILL_START;
	if (nowMs < endMs) return AuctionState.STARTED;
	return AuctionState.ENDED;
}

// import type { Route } from "./+types/";

export async function clientLoader(/*{ params }: Route.ClientLoaderArgs */) {
	// const res = await fetch(`/api/products/${params.pid}`);
	// const product = await res.json();
	// TODO: find how we can use loader here
	// https://reactrouter.com/start/framework/data-loading#client-data-loading
	// const ctrl = new Controller(context.cloudflare.env.BeelieversNFT);
	// return await ctrl.getUserData(suiAddr);
}

interface BeelieversAuctionProps {
	auctionDetails: AuctionDetails;
	leaderboard: Bidder[];
}

export function BeelieversAuction({
	auctionDetails: { uniqueBidders, totalBids, entryBidMist, startsAt, endsAt },
	leaderboard,
}: BeelieversAuctionProps) {
	// const queryUserEligibility = useFetcher();
	const { suiAddr } = useContext(WalletContext);
	// const lastCheckedAddress = useRef<string | null>(null);

	const fetcher = useFetcher();

	useEffect(() => {
		// example api
		// fetcher.submit({ method: "queryUser", params: [suiAddr] }, { method: "get" });
	}, [suiAddr, fetcher]);

	// TODO:
	// use client loader to load user data on suiAddr change

	// Check eligibility when wallet connects or address changes, reset when disconnected
	// useEffect(() => {
	// 	if (suiAddr && suiAddr !== lastCheckedAddress.current && queryUserEligibility.state === "idle") {
	// 		// Wallet connected or address changed - check eligibility
	// 		lastCheckedAddress.current = suiAddr;
	// 		const formData = new FormData();
	// 		formData.append("suiAddress", suiAddr);
	// 		queryUserEligibility.submit(formData, { method: "POST" });
	// 	} else if (!suiAddr && lastCheckedAddress.current) {
	// 		// Wallet disconnected - reset state
	// 		lastCheckedAddress.current = null;
	// 	}
	// }, [suiAddr, queryUserEligibility.state, queryUserEligibility]);

	// Reset eligibility data when wallet is disconnected
	// TODO: query user using the action
	// suiAddr ? queryUserEligibility.data : undefined;
	const eligibilityData = undefined;
	const twitterPost = "https://twitter.com/goNativeCC/status/1956370231191818263";
	const auctionState = getAuctionState(startsAt, endsAt);

	return (
		<div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 w-full relative">
			{/* Hero Title with Animation */}
			<div className="flex flex-col items-center gap-4">
				<p className="md:text-3xl text-2xl text-center font-semibold max-w-120">
					<span className="text-2xl text-primary md:text-3xl">🐝 BTCFi Beelievers</span> Auction
				</p>
				<BadgesModal />
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
					{...eligibilityData}
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
