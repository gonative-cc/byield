import { AttemptAuction } from "./AttemptAuction";
import { Card, CardContent } from "~/components/ui/card";
import { EligibilityTypeEnum } from "./whitelist.server";

function getEligibilityMessage(type?: EligibilityTypeEnum) {
	switch (type) {
		case EligibilityTypeEnum.PARTNER_WHITELIST:
			return "Congratulations!! You're eligible to participate in auction and get 5% boost for your price + stand a chance to win 1 out 10 Mythic collections and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		case EligibilityTypeEnum.TESTNET_WHITELIST_ADDRESS:
			return "Congratulations!! You're eligible to participate in auction and get 5% boost for your bid price and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		case EligibilityTypeEnum.NON_WHITELIST_ADDRESS:
			return "You're not in white list but you can still particiapte in auction and stand a chance to win 10% of NFT sale amount in Bitcoin (nBTC) given to 21 lucky winners.";
		default:
			return "";
	}
}

interface NotEligibleProps {
	type?: EligibilityTypeEnum;
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
					<div className="flex flex-col gap-4 justify-between">
						<div className="flex justify-between gap-2">
							<span className="text-xl md:text-2xl font-bold leading-8 md:leading-10">
								Participate in Beelievers Auction
							</span>
							<div className="flex flex-col justify-between shrink-0 md:hidden">
								<AttemptAuction className="pt-2 self-start md:self-auto" />
							</div>
						</div>
						<span className="text-sm">{eligibilityMessage}</span>
						<span className="text-sm"></span>
					</div>
					<div className="md:flex flex-col justify-between shrink-0 hidden">
						<AttemptAuction className="pt-2 self-start md:self-auto" />
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
