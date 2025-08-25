import { Info } from "lucide-react";
import { Tooltip } from "~/components/ui/tooltip";
import { formatSUI } from "~/lib/denoms";
import type { AuctionInfo } from "~/server/BeelieversAuction/types";
import { StatsCard } from "./StatsCard";

interface AuctionTotalsProps {
	info: AuctionInfo;
}

export function AuctionTotals({ info }: AuctionTotalsProps) {
	// Validate entryBidMist is within safe limits
	if (info.entryBidMist >= Number.MAX_SAFE_INTEGER / 4) {
		throw new Error(
			`entryBidMist (${info.entryBidMist}) exceeds maximum safe value (${Number.MAX_SAFE_INTEGER / 4})`,
		);
	}

	let priceTitle = "Minimum Bid";
	let price = info.entryBidMist;
	let tooltip = "Current minimum bid to enter the winning list";
	if (info.clearingPrice) {
		priceTitle = "Minting Price";
		price = info.clearingPrice;
		tooltip = "Final clearing price of the auction";
	}

	return (
		<div className="flex flex-col sm:flex-row gap-2 sm:gap-6 w-full max-w-3xl">
			<StatsCard title={info.uniqueBidders.toLocaleString()}>Unique Bidders</StatsCard>
			<StatsCard title={info.totalBids.toLocaleString()}>Total Bids</StatsCard>
			<StatsCard title={formatSUI(BigInt(price)) + " SUI"}>
				<Tooltip tooltip={tooltip}>
					<div className="text-muted-foreground flex items-center justify-center gap-1 group-hover:text-foreground/80 transition-colors">
						{priceTitle}
						<Info size="16" className="text-primary hover:text-orange-400 transition-colors" />
					</div>
				</Tooltip>
			</StatsCard>
		</div>
	);
}
