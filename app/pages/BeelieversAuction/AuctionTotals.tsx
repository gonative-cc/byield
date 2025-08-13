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
		<Card className="flex-1">
			<CardContent className="p-4 text-center">
				<div className="text-2xl font-bold text-primary">{title}</div>
				<div className="text-muted-foreground">{body}</div>
			</CardContent>
		</Card>
	);

	return (
		<div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
			{createCard(uniqueBidders.toLocaleString(), "Unique Bidders")}
			{createCard(totalBids.toLocaleString(), "Total Bids")}
			{createCard(
				entryBid + " SUI",
				<Tooltip tooltip="Current minimum bid to enter the winning list">
					<div className="text text-muted-foreground flex items-center justify-center gap-1">
						Minimum Bid
						<Info size="16" className="text-primary hover:text-foreground transition-colors" />
					</div>
				</Tooltip>,
			)}
		</div>
	);
}
