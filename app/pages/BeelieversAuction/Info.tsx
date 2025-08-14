import React from "react";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { AuctionAccountType } from "./types";
import moment from "moment";
import { TwitterShareButton } from "~/components/TwitterShareButton";

interface InfoProps {
	type?: AuctionAccountType;
	isError?: boolean;
	auction_end_ms?: number;
}

export function Info({ type, auction_end_ms }: InfoProps) {
	const eligibilityMessage = getEligibilityMessage(type);
	const [showInfo, setShowInfo] = React.useState(false);

	const endTime = moment
		.utc(moment.duration(moment(auction_end_ms).diff(moment())).asMilliseconds())
		.format("HH:mm:ss");

	return (
		<Card className="w-full md:w-[72%]">
			<CardContent className="p-4 rounded-lg text-white flex flex-col md:flex-row gap-4 md:gap-8 bg-azure-25">
				<div className="flex-shrink-0">
					<img
						src="/assets/bee/bee-with-hammer.svg"
						alt="bee-with-hammer"
						className="hidden md:block"
					/>
					<img
						src="/assets/bee/bee-with-face-only.svg"
						alt="bee-with-face-only"
						className="md:hidden block"
					/>
				</div>
				<div className="flex flex-col gap-2 md:gap-4 py-0 md:py-4 w-full">
					{endTime && <p className="text-sm mb-1 text-foreground/80">Auction ends in {endTime}</p>}
					<p>{eligibilityMessage}</p>
					<p>
						You bid your true value; winners pay the lowest winning bid. Any amount above the
						clearing price is refunded.
					</p>
					<TwitterShareButton
						shareContent={`Just placed my bid in the @goNativeCC BTCFi Beelievers NFT auction!

Securing my spot in the top 5810 at beelieversNFT.gonative.cc`}
						className="max-w-fit"
					/>
					<Instructions showInfo={showInfo} onToggle={() => setShowInfo(!showInfo)} />
				</div>
			</CardContent>
		</Card>
	);
}

const Instructions = ({ showInfo, onToggle }: { showInfo: boolean; onToggle: () => void }) => {
	return (
		<div className="backdrop-blur-sm  shadow-lg mb-6">
			<button
				onClick={onToggle}
				className="rounded-2xl flex items-center justify-between w-full p-4 text-left border text-primary hover:text-primary/80 text-xl"
			>
				<span className="font-bold">How It Works?</span>
				{showInfo ? <ChevronsUp /> : <ChevronsDown />}
			</button>
			{showInfo && <InstructionDetails />}
		</div>
	);
};

function InstructionDetails() {
	const listStyle = "list-disc list-outside ml-6";
	const headerStyle = "py-4 text-primary font-semibold";
	return (
		<div className="px-4 pt-2 text-foreground leading-7">
			<h3 className="py-4 text-primary font-semibold">💰 Auction Format: Fair & Transparent</h3>
			<p>We&apos;re letting the community set the price through a secondary-price auction.</p>
			<ul className={listStyle}>
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

			<h3 className={headerStyle}>📊 Simple example</h3>
			<p>
				Top 5,810 bids range from 12 SUI to 6.2 SUI. Everyone in the top 5,810 pays 6.2 SUI, and extra
				amounts are refunded.
			</p>

			<h3 className={headerStyle}>🫵 Key Points</h3>
			<ul className={listStyle}>
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
