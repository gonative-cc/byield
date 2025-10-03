import React from 'react';
import { Countdown } from '~/components/ui/countdown';
import { primaryBadgeClasses } from '~/util/tailwind';
import { BadgesModal } from '~/components/BadgesModal';
import { AuctionAccountType } from '~/server/BeelieversAuction/types';
import { TwitterShareButton } from '~/components/TwitterShareButton';
import { AuctionState } from './types';
import type { User, AuctionInfo } from '~/server/BeelieversAuction/types';
import { Collapse } from '~/components/ui/collapse';

interface InfoProps {
	user?: User;
	auctionInfo: AuctionInfo;
	isError?: boolean;
	auctionState: AuctionState;
}

export function Info({ user, auctionInfo, auctionState }: InfoProps) {
	const userAccountType = user?.wlStatus;
	const eligibilityMessage = getEligibilityMessage(user?.wlStatus);

	let timeLabel, targetTime;
	if (auctionState === AuctionState.WILL_START) {
		timeLabel = 'starts';
		targetTime = auctionInfo.startsAt;
	} else {
		timeLabel = 'ends';
		targetTime = auctionInfo.endsAt;
	}

	const tweet = `Just placed my bid in the @goNativeCC BTCFi Beelievers NFT auction!

Securing my spot in the top 5810 at https://byield.gonative.cc/beelievers-auction`;

	return (
		<div className="card card-border w-full border shadow-2xl transition-all duration-300 lg:w-[85%] xl:w-[75%]">
			<div className="card-body from-azure-25 via-azure-20 to-azure-15 flex flex-col gap-6 rounded-lg bg-gradient-to-br p-4 text-white lg:flex-row lg:gap-8 lg:p-8">
				<div className="flex flex-shrink-0 justify-center lg:justify-start">
					<div className="animate-float">
						<img
							src="/assets/bee/bee-with-hammer.webp"
							alt="bee-with-hammer"
							className="hidden h-auto w-auto lg:inline"
						/>
						<img
							src="/assets/bee/bee-with-face-only.webp"
							alt="bee-with-face-only"
							className="h-auto w-auto lg:hidden"
						/>
					</div>
				</div>
				<div className="flex w-full flex-col gap-4 py-0 leading-relaxed lg:gap-6 lg:text-base">
					<div className="flex gap-4">
						{[AuctionState.WILL_START, AuctionState.STARTED].includes(auctionState) && (
							<div className={primaryBadgeClasses()}>
								<span className="text-2xl">⏰</span>
								<span className="text-sm"> Auction {timeLabel} in </span>
								<Countdown targetTime={targetTime} />
							</div>
						)}
						<div className="ml-auto">
							<TwitterShareButton shareContent={tweet} />
						</div>
					</div>
					<FinalizedNotifier
						user={user}
						auctionSize={auctionInfo.auctionSize}
						state={auctionState}
					/>
					{auctionState === AuctionState.STARTED && (
						<NotAWinnerNotifier user={user} auctionSize={auctionInfo.auctionSize} />
					)}
					<EligibleStatusBadge userAccountType={userAccountType} />
					{eligibilityMessage && <p>{eligibilityMessage}</p>}

					{auctionState === AuctionState.WILL_START && (
						<div>
							<BadgesModal msg="List of badges that you can score when you bid" />
						</div>
					)}

					<Instructions />
				</div>
			</div>
		</div>
	);
}

const Instructions = () => {
	return (
		<Collapse
			title={
				<div className="flex items-center gap-3">
					<span className="text-2xl">🐝</span>
					<span className="font-bold">BTCFi Beelievers NFT Auction – How It Works?</span>
				</div>
			}
		>
			<InstructionDetails />
		</Collapse>
	);
};

function InstructionDetails() {
	const listStyle = 'list-disc list-outside ml-6 space-y-2';
	const headerStyle = 'text-primary font-semibold text-lg flex items-center gap-2';
	return (
		<div className="text-foreground animate-in slide-in-from-top-2 leading-7 duration-500">
			<div className="space-y-6">
				<h3 className={headerStyle}>
					<span className="text-2xl">💰</span>
					Auction Format: Fair & Transparent
				</h3>
				<p className="text-foreground/90 mb-4 text-sm lg:text-base">
					We’re letting the community set the price through a price auction.
				</p>
				<ul className={listStyle}>
					<li className="text-sm lg:text-base">
						<strong>Place your bid</strong> – You can raise your bid anytime before the auction ends
						to improve your chances.
					</li>
					<li className="text-sm lg:text-base">
						<strong>Top 5,810 bidders win</strong> – Only the highest 5,810 bids will have chance to
						mint NFT.
					</li>
					<li className="text-sm lg:text-base">
						<strong>Fair clearing price</strong> – All winners pay <b>the same final price</b>,
						which is the generalized &ldquo;N+1 price&rdquo;. This is a form of &nbsp;
						<a href="https://en.wikipedia.org/wiki/Vickrey_auction" className="link">
							Vickrey auction
						</a>{' '}
						- where everyone pays highest bid that didn&apos;t make it to the winning list. In case
						of draw in the last postion, it is first in first served.
					</li>
					<li className="text-sm lg:text-base">
						<strong>Get refunds </strong> – If you bid higher than the clearing price, you can claim
						the excess amount. If you don&apos;t win you can claim all the amount you bid.
					</li>
				</ul>

				<h3 className={headerStyle}>
					<span className="text-2xl">📊</span>
					Simple Example
				</h3>
				<p className="text-foreground/90 text-sm lg:text-base">
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

function auctionAccountTypeMsg(userAccountType?: AuctionAccountType) {
	switch (userAccountType) {
		case AuctionAccountType.TESTNET_WHITELIST:
			return 'Congrats! You have Testnet WL tier';
		case AuctionAccountType.PARTNER_WHITELIST:
			return 'Congrats! You are verified Partner WL';
		default:
			return null;
	}
}

const EligibleStatusBadge = ({ userAccountType }: { userAccountType?: AuctionAccountType }) => {
	const msg = auctionAccountTypeMsg(userAccountType);
	if (!msg) return null;

	return (
		<div className="rounded-lg border border-purple-400/40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-2">
			<span className="text-lg">🤝 </span>
			<span className="text-sm font-semibold">{msg}</span>
			<span className="animate-bounce text-lg">✨</span>
		</div>
	);
};

const FinalizedNotifier = ({
	user,
	auctionSize,
	state,
}: {
	user?: User;
	auctionSize: number;
	state: AuctionState;
}) => {
	let msg: string = '';
	switch (state) {
		case AuctionState.ENDED: {
			msg = 'Confirming results';
			break;
		}
		case AuctionState.RECONCILLED: {
			if (!user) break;
			msg = "😒 Unfortunately, you didn't win the auction.";
			if ((user.rank || 0) <= auctionSize) msg = '🏆 You made it to the winning list!';
			break;
		}
		default:
			return;
	}

	return (
		<div className="p-2 text-lg">
			<span className="text-xlg">🔨</span> Auction ended. Minting will be availabled in the next few
			days.
			<p className="mt-4">{msg}</p>
		</div>
	);
};

const NotAWinnerNotifier = ({ user, auctionSize }: { user?: User; auctionSize: number }) => {
	if (!user || user.amount === 0 || user.rank === null || user.rank < auctionSize) return null;

	return (
		<div className="rounded-lg border border-orange-500/70 bg-gradient-to-r from-orange-700/50 to-orange-700/40 p-2">
			<span className="text-lg">🔨</span> You slipped from the auction winning list (top 5810
			spots). Bid more to save your spot!
		</div>
	);
};

function getEligibilityMessage(type?: AuctionAccountType): React.ReactNode | string {
	const listStyle = 'list-disc list-outside ml-10 space-y-2';
	const listHeaderStyle = 'text-sm lg:text-base text-foreground/90 pb-4';

	const partnerBulletPoints = () => (
		<ul className={listStyle}>
			<li className="text-sm lg:text-base">5% Bid Boost to your price</li>
			<li className="text-sm lg:text-base">The chance to win 1 out of 10 Mythic NFT</li>
			<li className="text-sm lg:text-base">
				You&apos;ll win the on-chain badges & you&apos;ll get rewarded in the future for them
			</li>
			<li className="text-sm lg:text-base">
				You&apos;ll get a chance to split 10% of the total auction primary sale revenue, distributed
				to 21 winners (in nBTC)
			</li>
		</ul>
	);

	switch (type) {
		case AuctionAccountType.PARTNER_WHITELIST:
			return (
				<>
					<p className={listHeaderStyle}>
						Congratulations, you&apos;re part of the partner activation program WhiteList, and you
						get:
					</p>
					{partnerBulletPoints()}
				</>
			);
		case AuctionAccountType.TESTNET_WHITELIST:
			return (
				<>
					<p className={listHeaderStyle}>
						Congratulations, you&apos;re part of the Form program WhiteList, and you get:
					</p>
					{partnerBulletPoints()}
				</>
			);
		case AuctionAccountType.DEFAULT:
			return 'Participate in auction to buy NFT and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.';
		default:
			return '';
	}
}
