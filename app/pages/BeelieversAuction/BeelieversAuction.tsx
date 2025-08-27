import { useFetcher } from "react-router";
import { useContext, useEffect, useRef, type ReactNode } from "react";
import { AuctionTable } from "./AuctionTable";
import { AuctionTotals } from "./AuctionTotals";
import { AuctionState } from "./types";
import type { AuctionInfo, Bidder } from "~/server/BeelieversAuction/types";
import { makeReq, type QueryRaffleResp, type QueryUserResp } from "~/server/BeelieversAuction/jsonrpc";
import { WalletContext } from "~/providers/ByieldWalletProvider";
import { removeDuplicates, sortAndCheckDuplicate } from "~/lib/batteries";
import { RaffleTable } from "./RaffleTable";
import { MintInfo } from "./MintInfo";
import { Info as AuctionsInfo } from "./Info";
import { RaffleStats } from "./RaffleStats";
import { FAQ } from "./FAQ";
import { Collapse } from "~/components/ui/collapse";

function getAuctionState(startMs: number, endMs: number, clearingPrice: number | null): AuctionState {
	const nowMs = new Date().getTime();
	if (nowMs < startMs) return AuctionState.WILL_START;
	if (nowMs < endMs) return AuctionState.STARTED;
	if (clearingPrice !== null) return AuctionState.RECONCILLED;
	return AuctionState.ENDED;
}

interface BeelieversAuctionProps {
	info: AuctionInfo;
	leaderboard: Bidder[];
}

export function BeelieversAuction({ info, leaderboard }: BeelieversAuctionProps) {
	const { suiAddr } = useContext(WalletContext);
	const lastCheckedAddress = useRef<string | null>(null);
	const userFetcher = useFetcher<QueryUserResp>();
	const raffleFetcher = useFetcher<QueryRaffleResp>();
	const user: QueryUserResp = userFetcher.data ?? null;
	const raffle: QueryRaffleResp = raffleFetcher.data ?? null;
	const auctionState = getAuctionState(info.startsAt, info.endsAt, info.clearingPrice);

	console.log(">>>> raffle", raffle);
	console.log(">>>> user", user);

	for (const l of leaderboard) {
		if (sortAndCheckDuplicate(l.badges)) {
			console.log(">>>> leader ", l);
			l.badges = removeDuplicates(l.badges);
		}
	}

	useEffect(() => {
		// query the user
		if (suiAddr && suiAddr !== lastCheckedAddress.current && userFetcher.state === "idle") {
			// Wallet connected or address changed - check eligibility
			lastCheckedAddress.current = suiAddr;
			makeReq<QueryUserResp>(userFetcher, { method: "queryUser", params: [suiAddr] });
		} else if (!suiAddr && lastCheckedAddress.current) {
			// Wallet disconnected - reset state
			lastCheckedAddress.current = null;
		}
	}, [userFetcher, userFetcher.state, suiAddr]);

	useEffect(() => {
		// query the raffle
		if (raffleFetcher.state === "idle" && !raffle && auctionState === AuctionState.RECONCILLED) {
			makeReq<QueryRaffleResp>(raffleFetcher, { method: "queryRaffle", params: [] });
		}
	}, [raffleFetcher, raffle, auctionState]);

	// TODO: get mint info
	const showMintInfo = true;

	return (
		<div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 w-full relative">
			<Header>
				<p>
					<span className="text-2xl text-primary md:text-3xl">🐝 BTCFi Beelievers</span> Mint
				</p>
				<p className="text-lg mt-3 text-muted-foreground">
					➡️{" "}
					<a
						className="link-raw"
						href="https://www.gonative.cc/beelievers"
						target="_blank"
						rel="noreferrer"
					>
						Landing page and FAQ
					</a>
				</p>
			</Header>

			<div className="animate-in slide-in-from-left-4 duration-1000 delay-400 w-full flex justify-center">
				{showMintInfo ? (
					<MintInfo user={user} auctionInfo={info} />
				) : (
					<AuctionsInfo auctionInfo={info} auctionState={auctionState} />
				)}
			</div>

			<Collapse title={<span className="text-2xl text-primary md:text-3xl">Raffle</span>}>
				<div className="space-y-6">
					{raffle && (
						<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-300 w-full flex justify-center">
							<RaffleStats totalRaffleInMist={raffle.totalAmount} />
						</div>
					)}

					{/* Leaderboard Table with Animation */}
					{raffle && (
						<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-600 w-full">
							<div className="flex flex-col-reverse lg:flex-row gap-6 w-full">
								<RaffleTable data={raffle?.winners} />
							</div>
						</div>
					)}
				</div>
			</Collapse>

			{/* Auction Stats with Staggered Animation */}
			{auctionState !== AuctionState.WILL_START && (
				<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-300 w-full flex justify-center">
					<AuctionTotals info={info} />
				</div>
			)}

			{/* Leaderboard Table with Animation */}
			{auctionState !== AuctionState.WILL_START && (
				<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-600 w-full">
					<div className="flex flex-col-reverse lg:flex-row gap-6 w-full">
						<AuctionTable data={leaderboard} user={user} suiAddr={suiAddr} />
					</div>
				</div>
			)}

			{/* Partners Section with Animation */}
			<div className="animate-in fade-in-0 duration-1000 delay-700 w-full">
				<img
					src="/assets/auction/partner/partners.webp"
					alt="partners"
					className="text-center mx-auto w-auto"
				/>
			</div>
			<FAQ />
		</div>
	);
}

function Header({ children }: { children: ReactNode }) {
	return (
		<h1 className="flex flex-col items-center md:text-3xl text-2xl font-semibold max-w-120">
			{children}
		</h1>
	);
}
