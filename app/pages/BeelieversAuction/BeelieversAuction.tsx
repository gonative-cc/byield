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
import { Info as AuctionInfoSection } from "./Info";
import { FAQ } from "./FAQ";
import { Collapse } from "~/components/ui/collapse";
import { NBTCRaw } from "~/components/icons";
import { formatSUI } from "~/lib/denoms";

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

	return (
		<div className="flex flex-col items-center gap-6 sm:gap-8 lg:gap-10 w-full relative">
			<Header>
				<p>
					🐝 BTCFi Beelievers
					<span className="text-foreground"> Mint</span>
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

			<div className="w-full flex justify-center">
				{auctionState === AuctionState.RECONCILLED ? (
					<MintInfo user={user} auctionInfo={info} />
				) : (
					<AuctionInfoSection auctionInfo={info} auctionState={auctionState} />
				)}
			</div>

			<Collapse
				className="lg:w-[85%] xl:w-[75%]"
				title={<span className="text-xl text-primary md:text-2xl">Raffle Results</span>}
			>
				<RaffleResults raffle={raffle} />
			</Collapse>

			{auctionState !== AuctionState.WILL_START && (
				<>
					<Header>
						<span className="text-primary"> 🔨 Auction</span>
					</Header>

					<div className="w-full flex justify-center">
						<AuctionTotals info={info} />
					</div>
					<div className="animate-in slide-in-from-bottom-4 duration-1000 delay-600 w-full">
						<div className="flex flex-col-reverse lg:flex-row gap-6 w-full">
							<AuctionTable data={leaderboard} user={user} suiAddr={suiAddr} />
						</div>
					</div>
				</>
			)}

			{/* Partners Section with Animation */}
			<img
				src="/assets/auction/partner/partners.webp"
				alt="partners"
				className="text-center mx-auto w-auto"
			/>
			<FAQ />
		</div>
	);
}

function Header({ children }: { children: ReactNode }) {
	return (
		<h1 className="flex flex-col items-center md:text-3xl text-2xl text-primary font-semibold max-w-120">
			{children}
		</h1>
	);
}

function RaffleResults({ raffle }: { raffle: QueryRaffleResp }) {
	if (!raffle) return;

	return (
		<>
			<section className="w-full mb-6">
				<div className="text-xl font-bold text-primary group-hover:text-orange-400 transition-colors duration-300 mb-2">
					<NBTCRaw className="inline mr-2 h-[1.1em] w-auto align-middle" /> Total winnings:{" "}
					{formatSUI(BigInt(raffle.totalAmount))} nBTC
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

			<div className="flex flex-col-reverse lg:flex-row gap-6 w-full">
				<RaffleTable data={raffle?.winners} />
			</div>
		</>
	);
}
