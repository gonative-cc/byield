import { Info } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Tooltip } from "~/components/ui/tooltip";

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

					<Tooltip tooltip="Current minimum bid to enter the winning list">
						<div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
							Entry Bid{" "}
							<Info
								size="16"
								className="text-primary hover:text-foreground transition-colors"
							/>
						</div>
					</Tooltip>
				</CardContent>
			</Card>
		</div>
	);
}
