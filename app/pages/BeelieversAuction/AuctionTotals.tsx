import { Info } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Tooltip } from "~/components/ui/tooltip";

interface AuctionTotalsProps {
	uniqueBidders: number;
	totalBids: number;
	entryBid: number;
}

export function AuctionTotals({ uniqueBidders, totalBids, entryBid }: AuctionTotalsProps) {
	const createCard = (title: string, body: React.ReactNode | string) => (
		<Card
			className={`flex-1 group hover:scale-105 transition-all duration-300 animate-in slide-in-from-bottom-2 delay-50`}
		>
			<CardContent className="p-4 sm:p-6 text-center bg-gradient-to-br from-azure-15 to-azure-25 border border-primary/20 hover:border-primary/40 transition-colors">
				<div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary group-hover:text-orange-400 transition-colors duration-300 mb-2">
					{title}
				</div>
				<div className="text-sm sm:text-base text-muted-foreground group-hover:text-foreground/80 transition-colors">
					{body}
				</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-4xl">
			{createCard(uniqueBidders.toLocaleString(), "Unique Bidders")}
			{createCard(totalBids.toLocaleString(), "Total Bids")}
			{createCard(
				entryBid + " SUI",
				<Tooltip tooltip="Current minimum bid to enter the winning list">
					<div className="text-sm sm:text-base text-muted-foreground flex items-center justify-center gap-1 group-hover:text-foreground/80 transition-colors">
						Minimum Bid
						<Info size="16" className="text-primary hover:text-orange-400 transition-colors" />
					</div>
				</Tooltip>,
			)}
		</div>
	);
}
