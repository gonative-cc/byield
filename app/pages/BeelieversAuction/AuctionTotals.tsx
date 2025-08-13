import { Info } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

interface AuctionTotalsProps {
	uniqueBidders: number;
	totalBids: number;
	entryBid: number;
}

export function AuctionTotals({ uniqueBidders, totalBids, entryBid }: AuctionTotalsProps) {
	return (
		<div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
			<Card className="flex-1">
				<CardContent className="p-4 text-center">
					<div className="text-2xl font-bold text-primary">{uniqueBidders.toLocaleString()}</div>
					<div className="text-sm text-muted-foreground">Unique Bidders</div>
				</CardContent>
			</Card>
			<Card className="flex-1">
				<CardContent className="p-4 text-center">
					<div className="text-2xl font-bold text-primary">{totalBids.toLocaleString()}</div>
					<div className="text-sm text-muted-foreground">Total Bids</div>
				</CardContent>
			</Card>
			<Card className="flex-1">
				<CardContent className="p-4 text-center">
					<div className="text-2xl font-bold text-primary">{entryBid} SUI</div>
					<div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
						Early Bid
						<TooltipTrigger asChild>
							<Info
								size={20}
								className="text-primary hover:text-foreground transition-colors"
							/>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<p>Current minimum bid to enter the winning list</p>
						</TooltipContent>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
