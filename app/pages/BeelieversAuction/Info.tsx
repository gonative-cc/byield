import React from "react";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Countdown } from "~/components/ui/countdown";
import { AuctionAccountType } from "~/server/BeelieversAuction/types";
import { TwitterShareButton } from "~/components/TwitterShareButton";
import { AuctionState } from "./types";
import { cn } from "~/util/tailwind";

interface InfoProps {
	type?: AuctionAccountType;
	isError?: boolean;
	auction_start_ms: number;
	auction_end_ms: number;
	auctionState: AuctionState;
}

export function Info({ type, auction_start_ms, auction_end_ms, auctionState }: InfoProps) {
	const eligibilityMessage = getEligibilityMessage(type);
	const [showInfo, setShowInfo] = React.useState(false);

	let timeLabel, targetTime;
	if (auctionState === AuctionState.WILL_START) {
		timeLabel = "starts";
		targetTime = auction_start_ms;
	} else {
		timeLabel = "ends";
		targetTime = auction_end_ms;
	}

	const tweet = `Just placed my bid in the @goNativeCC BTCFi Beelievers NFT auction!

Securing my spot in the top 5810 at beelieversNFT.gonative.cc`;

	return (
		<Card className="w-full lg:w-[85%] xl:w-[75%] shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300">
			<CardContent className="p-4 lg:p-8 rounded-lg text-white flex flex-col lg:flex-row gap-6 lg:gap-8 bg-gradient-to-br from-azure-25 via-azure-20 to-azure-15">
				<div className="flex-shrink-0 flex justify-center lg:justify-start">
					<div className="animate-float">
						<img
							src="/assets/bee/bee-with-hammer.svg"
							alt="bee-with-hammer"
							className="hidden lg:block w-auto h-auto"
						/>
						<img
							src="/assets/bee/bee-with-face-only.svg"
							alt="bee-with-face-only"
							className="lg:hidden block w-auto h-auto"
						/>
					</div>
				</div>
				<div className="flex flex-col gap-4 lg:gap-6 py-0 w-full">
					<div className="flex flex-row justify-between items-center gap-4">
						<div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 font-semibold text-primary">
							<span className="text-2xl">⏰</span>
							{auctionState === AuctionState.ENDED ? (
								<span className="text">Auction ended</span>
							) : (
								<>
									<span className="text-sm"> Auction {timeLabel} in </span>
									<Countdown targetTime={targetTime} />
								</>
							)}
						</div>
						<TwitterShareButton shareContent={tweet} />
					</div>
					<EligibleStatusBadge type={type} />

					{eligibilityMessage && (
						<div className="p-4 bg-primary/10 rounded-lg border border-primary/20 animate-in slide-in-from-left-2 duration-500">
							<p className="text-sm lg:text-base leading-relaxed">{eligibilityMessage}</p>
						</div>
					)}

					<p className="text-sm lg:text-base leading-relaxed text-foreground/90">
						You bid your true value; winners pay the lowest winning bid. Any amount above the
						clearing price is refunded.
					</p>
					<Instructions showInfo={showInfo} onToggle={() => setShowInfo(!showInfo)} />
				</div>
			</CardContent>
		</Card>
	);
}

const Instructions = ({ showInfo, onToggle }: { showInfo: boolean; onToggle: () => void }) => {
	return (
		<div className="backdrop-blur-sm shadow-lg border border-primary/20 rounded-2xl overflow-hidden">
			<button
				onClick={onToggle}
				className="flex items-center justify-between w-full p-4 lg:p-6 text-left bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 text-primary hover:text-orange-400 text-lg lg:text-xl transition-all duration-300 group"
			>
				<div className="flex items-center gap-3">
					<span className="text-2xl">🐝</span>
					<span className="font-bold">BTCFi Beelievers NFT Auction – How It Works?</span>
				</div>
				<div className={`transform transition-transform duration-300 group-hover:scale-110`}>
					{showInfo ? <ChevronsUp size={24} /> : <ChevronsDown size={24} />}
				</div>
			</button>
			<div
				className={`transition-all duration-500 ease-in-out ${showInfo ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"} overflow-hidden`}
			>
				{showInfo && <InstructionDetails />}
			</div>
		</div>
	);
};

function InstructionDetails() {
	const listStyle = "list-disc list-outside ml-6 space-y-2";
	const headerStyle = "py-4 text-primary font-semibold text-lg flex items-center gap-2";
	return (
		<div className="px-4 lg:px-6 pb-6 text-foreground leading-7 animate-in slide-in-from-top-2 duration-500">
			<div className="space-y-6 pt-4">
				<h3 className={cn(headerStyle, "py-0 gap-0 mb-0 pb-2")}>
					<span className="text-2xl">💰</span>
					Auction Format: Fair & Transparent
				</h3>
				<p className="text-sm lg:text-base mb-4 text-foreground/90">
					We’re letting the community set the price through a price auction.
				</p>

				<h3 className={headerStyle}>
					<span className="text-2xl">❓</span>
					How it works:
				</h3>
				<ul className={listStyle}>
					<li className="text-sm lg:text-base">
						<strong>Place your bid</strong> – You can raise your bid anytime before the auction
						ends to improve your chances.
					</li>
					<li className="text-sm lg:text-base">
						<strong>Top 5,810 bidders win</strong> – Only the highest 5,810 bids will have chance
						to mint NFT.
					</li>
					<li className="text-sm lg:text-base">
						<strong>Fair clearing price</strong> – All winners pay <b>the same final price</b>,
						which is the generalized &ldquo;N+1 price&rdquo;. This is a form of &nbsp;
						<a href="https://en.wikipedia.org/wiki/Vickrey_auction" className="link">
							Vickrey auction
						</a>{" "}
						- where everyone pays highest bid that didn&apos;t make it to the winning list.
					</li>
					<li className="text-sm lg:text-base">
						<strong>Get refunds automatically</strong> – If you bid higher than the clearing
						price, the difference is refunded.
					</li>
				</ul>

				<h3 className={headerStyle}>
					<span className="text-2xl">📊</span>
					Simple Example
				</h3>
				<p className="text-sm lg:text-base text-foreground/90">
					Top 5,810 bids range from 12 SUI to 6.2 SUI. Everyone in the top 5,810 pays 6.2 SUI, and
					extra amounts are refunded.
				</p>

				<h3 className={headerStyle}>
					<span className="text-2xl">🫵</span>
					Key Points
				</h3>
				<ul className={listStyle}>
					<li className="text-sm lg:text-base">
						You can increase your bid any time until the auction closes.
					</li>
					<li className="text-sm lg:text-base">
						Being in the top 5,810 at the close guarantees you a chance to mint NFT.
					</li>
					<li className="text-sm lg:text-base">
						User deposits money on chain to make a bid, everything else is off chain. This way, we
						can do all UI features more user friendly.
					</li>
				</ul>
			</div>
		</div>
	);
}

const EligibleStatusBadge = ({ type }: { type?: AuctionAccountType }) => {
	// TODO
	// type = AuctionAccountType.PARTNER_WHITELIST;

	const statusMesg = () => {
		switch (type) {
			case AuctionAccountType.TESTNET_WHITELIST:
				return {
					text: "Congrats! You have Testnet WL tier",
					gradient: "from-blue-500/20 to-cyan-500/20",
					border: "border-blue-400/40",
					textColor: "text-blue-300",
					outerGradient: "from-blue-500/10 via-cyan-500/5 to-transparent",
				};
			case AuctionAccountType.PARTNER_WHITELIST:
				return {
					text: "Congrats! You are verified Partner WL",
					gradient: "from-purple-500/20 to-pink-500/20",
					border: "border-purple-400/40",
					textColor: "text-purple-300",
					outerGradient: "from-purple-500/10 via-pink-500/5 to-transparent",
				};
			default:
				return null;
		}
	};

	const config = statusMesg();
	if (!config) return null;

	return (
		<div
			className={`p-1 bg-gradient-to-r ${config.outerGradient} rounded-full animate-in slide-in-from-right-2 duration-700 animate-flash`}
		>
			<div
				className={`flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${config.gradient} rounded-full border ${config.border}`}
			>
				<span className="text-lg">🤝</span>
				<p className={`text-sm font-semibold ${config.textColor}`}>{config.text}</p>
				<span className="text-lg animate-bounce">✨</span>
			</div>
		</div>
	);
};

function getEligibilityMessage(type?: AuctionAccountType) {
	switch (type) {
		case AuctionAccountType.PARTNER_WHITELIST:
			return "Congratulations!! you are part of our partners activation program and you get a 5% boost to your price + stand a chance to win 1 out 10 Mythic collections and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		case AuctionAccountType.TESTNET_WHITELIST:
			return "Congratulations!! Thanks to your testnet participation, you're eligible for a 5% boost to your bid price and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		case AuctionAccountType.DEFAULT:
			return "Participate in auction to buy NFT and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		default:
			return "";
	}
}
