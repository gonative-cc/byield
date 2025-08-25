import { Card, CardContent } from "~/components/ui/card";
import { type User } from "~/server/BeelieversAuction/types";
import { formatSUI } from "~/lib/denoms";
import { Button } from "~/components/ui/button";

interface MintInfoProps {
	user?: User;
}

export function MintInfo({ user }: MintInfoProps) {
	const currentBidInMist = BigInt(user?.amount || 0);

	// TODO: get it from server
	const mintPrice = BigInt(5 * 1e9);
	const wonRaffle = false;
	const refund = mintPrice - currentBidInMist;

	return (
		<Card className="w-full lg:w-[85%] xl:w-[75%] shadow-2xl border-primary/20 hover:border-primary/40 transition-all duration-300">
			<CardContent className="p-4 lg:p-8 rounded-lg text-white flex flex-col lg:flex-row gap-6 lg:gap-8 bg-gradient-to-br from-azure-25 via-azure-20 to-azure-15">
				<div className="flex-shrink-0 flex justify-center lg:justify-start">
					<div className="animate-float">
						<img
							src="/assets/bee/bee-with-gonative.webp"
							alt="bee-with-gonative"
							className="rounded-xl w-60 h-60"
						/>
					</div>
				</div>
				<div className="flex flex-col w-full justify-between">
					<div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
						<div className="flex justify-between items-center mb-2 w-full">
							<span className="text-sm text-muted-foreground">Mint Price:</span>
							<div className="text-lg font-semibold text-primary">
								{formatSUI(String(mintPrice))} SUI
							</div>
						</div>
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm text-muted-foreground">Your bid:</span>
							<div className="text-lg font-semibold text-primary">
								{formatSUI(String(currentBidInMist))} SUI
							</div>
						</div>
						{user && (
							<div className="flex justify-between items-center mb-2">
								<span className="text-sm text-muted-foreground">Status</span>
								<div className="text-lg font-semibold text-primary">
									{user.rank && user?.rank <= 5810
										? "Winner"
										: "Couldn't get into top 5810"}
								</div>
							</div>
						)}
						<div className="flex justify-between items-center mb-2">
							<span className="text-sm text-muted-foreground">Raffle:</span>
							<div className="text-lg font-semibold text-primary">
								{wonRaffle ? "Won" : "Not Won"}
							</div>
						</div>
					</div>
					{user && (
						<div className="flex gap-4">
							<Button
								type="button"
								onClick={() => {
									// TODO: handle mint
								}}
							>
								Mint
							</Button>
							<Button
								type="button"
								onClick={() => {
									// TODO: handle refund
								}}
							>
								Refund {formatSUI(refund)} SUI
							</Button>
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
