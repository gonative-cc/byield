import { useFetcher } from "react-router";
import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { AuctionTable } from "./AuctionTable";
import { AuctionTotals } from "./AuctionTotals";
import { AuctionState } from "./types";
import type { AuctionInfo, Bidder } from "~/server/BeelieversAuction/types";
import { makeReq, type QueryRaffleResp, type QueryUserResp } from "~/server/BeelieversAuction/jsonrpc";
import { removeDuplicates, sortAndCheckDuplicate } from "~/lib/batteries";
import { RaffleTable } from "./RaffleTable";
import { MintInfo } from "./MintInfo";
import { Info as AuctionInfoSection } from "./Info";
import { Collapse } from "~/components/ui/collapse";
import { NBTCRaw } from "~/components/icons";
import { formatSUI } from "~/lib/denoms";
import { FAQ } from "~/components/FAQ";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { heroTitle } from "~/util/tailwind";

const FAQS = [
	{
		id: "faq-1",
		question: "Can I trade Beelievers NFTs after the mint?",
		answer: "Yes. After mint, Beelievers NFTs will be available for secondary trading on Tradeport and other supported marketplaces.",
	},
	{
		id: "faq-2",
		question: "What's the total supply?",
		answer: "The Beelievers collection includes 6,021 NFTs.",
	},
];

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
	const currentAccount = useCurrentAccount();
	const suiAddr = currentAccount?.address || null;
	const lastCheckedAddress = useRef<string | null>(null);
	const userFetcher = useFetcher<QueryUserResp>();
	const raffleFetcher = useFetcher<QueryRaffleResp>();
	const user: QueryUserResp = userFetcher.data ?? null;
	const raffle: QueryRaffleResp = raffleFetcher.data ?? null;
	const auctionState = getAuctionState(info.startsAt, info.endsAt, info.clearingPrice);

	console.log(">>>> user", user);

	const processedLeaderboard = useMemo(
		() =>
			leaderboard.map((l) =>
				sortAndCheckDuplicate(l.badges) ? { ...l, badges: removeDuplicates(l.badges) } : l,
			),
		[leaderboard],
	);

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

	return (
		<div className="relative flex w-full flex-col items-center gap-6 sm:gap-8 lg:gap-10">
			<Header>
				<p>
					🐝 BTCFi Beelievers
					<span className="text-foreground"> Mint</span>
				</p>
				<p className="text-muted-foreground mt-3 text-lg">
					➡️{" "}
					<a
						href="https://www.gonative.cc/beelievers"
						target="_blank"
						rel="noreferrer"
						className="link link-primary"
					>
						Landing page and FAQ
					</a>
				</p>
			</Header>

			<div className="flex w-full justify-center">
				{auctionState === AuctionState.RECONCILLED ? (
					<MintInfo user={user} auctionInfo={info} />
				) : (
					<AuctionInfoSection auctionInfo={info} auctionState={auctionState} />
				)}
			</div>

			<Collapse
				className="w-full md:w-3/4"
				title={<span className="text-primary text-xl md:text-2xl">Raffle Results</span>}
			>
				<RaffleResults raffle={raffle} />
			</Collapse>

			{auctionState !== AuctionState.WILL_START && (
				<>
					<Header>
						<span className="text-primary"> 🔨 Auction</span>
					</Header>

					<div className="flex w-full justify-center">
						<AuctionTotals info={info} />
					</div>
					<div className="animate-in slide-in-from-bottom-4 w-full delay-600 duration-1000">
						<div className="flex w-full flex-col-reverse gap-6 lg:flex-row">
							<AuctionTable data={processedLeaderboard} user={user} suiAddr={suiAddr} />
						</div>
					</div>
				</>
			)}

			{/* Partners Section with Animation */}
			<img
				src="/assets/auction/partner/partners.webp"
				alt="partners"
				className="mx-auto w-auto text-center"
			/>
			<FAQ faqs={FAQS} description="Everything you need to know about Beelievers NFTs" />
		</div>
	);
}

function Header({ children }: { children: ReactNode }) {
	return <h1 className={heroTitle + " text-primary-foreground"}>{children}</h1>;
}

function RaffleResults({ raffle }: { raffle: QueryRaffleResp }) {
	if (!raffle) return;

	return (
		<>
			<section className="mb-6 w-full">
				<div className="text-primary group-hover:text-primary-foreground mb-2 text-xl font-bold transition-colors duration-300">
					<NBTCRaw className="mr-2 inline h-[1.1em] w-auto align-middle" /> Total winnings:{" "}
					{formatSUI(raffle.totalAmount)} nBTC
				</div>
				This represents 10% of the{" "}
				<a
					className="link"
					href="https://suivision.xyz/txblock/E6PBgp5jA6vMs3rzS32nRseUiEBkDxf7WXjdsU6pL6Rz?tab=Events"
					target="_blank"
					rel="noreferrer"
				>
					total NFT sale
				</a>{" "}
				exchanged to BTC on 2025-08-26. Winners will be able to claim nBTC once the mainnet is live.
			</section>

			<div className="flex w-full flex-col-reverse gap-6 lg:flex-row">
				<RaffleTable data={raffle?.winners} />
			</div>
		</>
	);
}
