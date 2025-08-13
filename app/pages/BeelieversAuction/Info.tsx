import { Card, CardContent } from "~/components/ui/card";
import { AuctionAccountType } from "./types";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import React from "react";

interface InfoProps {
	type?: AuctionAccountType;
	isError?: boolean;
}

export function Info({ type }: InfoProps) {
	const eligibilityMessage = getEligibilityMessage(type);
	const [showInfo, setShowInfo] = React.useState(false);

	return (
		<>
			<Card className="w-full md:w-[72%]">
				<CardContent className="p-4 rounded-lg text-white flex flex-col md:flex-row gap-4 md:gap-8 bg-azure-25">
					<img
						src="/assets/bee/bee-with-hammer.svg"
						alt="bee-with-hammer"
						className="hidden md:block"
					/>
					{/*TODO image shold not move when we open info*/}
					<img
						src="/assets/bee/bee-with-face-only.svg"
						alt="bee-with-face-only"
						className="md:hidden block"
					/>
					<div className="flex flex-col gap-2 md:gap-4 py-0 md:py-4 w-full">
						{/*TODO auction start and auction end should come from the server*/}
						<p className="text-sm mb-1 text-foreground/80">Auction ends in 00 : 23 :12</p>
						<p>{eligibilityMessage}</p>
						<p>
							You bid your true value; winners pay the lowest winning bid. Any amount above the
							clearing price is refunded.
						</p>

						<div className="flex gap-2 justify-between w-full items-end"></div>
						<Instructions showInfo={showInfo} onToggle={() => setShowInfo(!showInfo)} />
					</div>
				</CardContent>
			</Card>
		</>
	);
}

const Instructions = ({ showInfo, onToggle }: { showInfo: boolean; onToggle: () => void }) => {
	return (
		<div className="backdrop-blur-sm rounded-2xl shadow-lg mb-6">
			<button
				onClick={onToggle}
				className="flex items-center justify-between w-full p-4 text-left border text-primary hover:text-primary/80 text-xl"
			>
				<span className="font-bold">How It Works?</span>
				{showInfo ? <ChevronsUp /> : <ChevronsDown />}
			</button>
			{showInfo && InstructionDetails()}
		</div>
	);
};

function InstructionDetails() {
	return (
		<div className="px-4 pt-2 text-foreground leading-7">
			<div className="py-4 text-primary font-semibold">💰 Auction Format: Fair & Transparent</div>
			<p>We&apos;re letting the community set the price through a secondary-price auction.</p>
			<ul className="list-disc list-outside ml-6">
				<li>
					Place your bid – You can raise your bid anytime before the auction ends to improve your
					chances.
				</li>
				<li>Top 5,810 bidders win – Only the highest 5,810 bids will have chance to mint NFT.</li>
				<li>
					Pay the clearing price – All winners pay the same final price, which is the generalized
					&ldquo;second price&rdquo; - highest bid that didn&apos;t make it to the winning list.
				</li>
				<li>
					Get refunds automatically – If you bid higher than the clearing price, the difference is
					refunded.
				</li>
			</ul>

			<div className="py-4 text-primary font-semibold">📊 Simple example</div>
			<p>
				Top 5,810 bids range from 12 SUI to 6.2 SUI. Everyone in the top 5,810 pays 6.2 SUI, and extra
				amounts are refunded.
			</p>

			<div className="py-4 text-primary font-semibold">🫵 Key Points</div>
			<ul className="list-disc list-inside">
				<li>You can increase your bid any time until the auction closes.</li>
				<li>Being in the top 5,810 at the close guarantees you a chance to mint NFT.</li>
				<li>
					User deposits money on chain to make a bid, everything else is off chain. This way, we can
					do all UI features more user friendly.
				</li>
			</ul>
		</div>
	);
}

function getEligibilityMessage(type?: AuctionAccountType) {
	switch (type) {
		case AuctionAccountType.PARTNER_WHITELIST:
			return "Congratulations!! you are part of our partners activation program and you get a 5% boost to your price + stand a chance to win 1 out 10 Mythic collections and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		case AuctionAccountType.TESTNET_WHITELIST:
			return "Congratulations!! Due to your testnet participation, you're eligible for a 5% boost to your bid price and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		case AuctionAccountType.DEFAULT:
			return "Participate in auction to buy NFT and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		default:
			return "";
	}
}
