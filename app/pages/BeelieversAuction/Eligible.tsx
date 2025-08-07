import { AttemptAuction } from "./AttemptAuction";
import { Card, CardContent } from "~/components/ui/card";
import { EligibilityEnum } from "./types";

function getEligibilityMessage(type?: EligibilityEnum) {
	switch (type) {
		case EligibilityEnum.PARTNER_WHITELIST:
			return "Congratulations!! you are part of our partners activation program and you get a 5% boost to your price + stand a chance to win 1 out 10 Mythic collections and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		case EligibilityEnum.TESTNET_WHITELIST_ADDRESS:
			return "Congratulations!! Due to your testnet participation, you're eligible for a 5% boost to your bid price and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		case EligibilityEnum.DEFAULT:
			return "Participate in auction to buy NFT and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		default:
			return "Connect Sui wallet to continue";
	}
}

interface NotEligibleProps {
	type?: EligibilityEnum;
}

export function Eligible({ type }: NotEligibleProps) {
	const eligibilityMessage = getEligibilityMessage(type);

	return (
		<Card className="w-full md:w-[72%]">
			<CardContent className="p-4 rounded-lg text-white flex flex-col md:flex-row gap-4 md:gap-8 bg-azure-25">
				<img
					src="/assets/bee/bee-looking-right.svg"
					alt="bee-with-hammer"
					className="hidden md:block"
				/>
				<img
					src="/assets/bee/bee-with-face-only.svg"
					alt="bee-with-hammer"
					className="md:hidden block"
				/>
				<div className="flex flex-col md:flex-row gap-2 md:gap-8 py-0 md:py-4 w-full">
					<div className="flex flex-col gap-12">
						<div className="flex justify-between gap-2">
							<span className="text-xl md:text-2xl font-bold leading-8 md:leading-10">
								Participate in Beelievers Auction
							</span>
							<div className="flex flex-col justify-between shrink-0 md:hidden">
								<AttemptAuction className="pt-2 self-start md:self-auto" />
							</div>
						</div>
						<span className="text-sm">{eligibilityMessage}</span>
					</div>
					<div className="md:flex flex-col justify-between shrink-0 hidden">
						<AttemptAuction className="pt-2 self-start md:self-auto" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
