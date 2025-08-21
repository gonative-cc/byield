import { Card, CardContent } from "~/components/ui/card";
import { formatSUI } from "~/lib/denoms";
import type { User } from "~/server/BeelieversAuction/types";
import { toBadgeRecord } from "~/lib/badgeSystem";

interface MyPositionProps {
	user: User;
}

export function MyPosition({ user }: MyPositionProps) {
	const userBadges = user.badges?.map(toBadgeRecord).filter(Boolean) || [];
	const hasUserBidBefore = (user && user.amount !== 0) || false;

	return (
		<div className="flex justify-center w-full">
			<div className="w-full lg:w-2/3 xl:w-1/2">
				<Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 animate-in slide-in-from-top-2 duration-500">
					<CardContent className="p-4 lg:p-6">
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
									<span className="text-xl">🎯</span>
								</div>
								<div>
									<h3 className="font-semibold text-primary">Your Current Bid</h3>
									<p className="text-sm text-muted-foreground">
										{hasUserBidBefore ? `Rank #${user.rank}` : "No bid placed"}
									</p>
								</div>
							</div>
							{hasUserBidBefore && (
								<div className="text-right">
									<p className="text-2xl font-bold text-primary">
										{formatSUI(String(user.amount))} SUI
									</p>
									{user?.note && (
										<p className="text-sm text-muted-foreground">{user.note}</p>
									)}
								</div>
							)}
						</div>
						{userBadges.length > 0 && (
							<div className="mt-4 pt-4 border-t border-primary/20">
								<div className="flex items-center gap-2 mb-2">
									<span className=" text-xl font-semibold text-primary">
										🏆 Your Badges
									</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{userBadges.length > 0 ? (
										userBadges?.map((badge, index) => (
											<img
												key={index}
												src={badge!.src}
												alt={String(badge!.name)}
												className={`bg-orange-500/60 w-8 h-8 hover:scale-110 transition-transform cursor-help`}
											/>
										))
									) : (
										<span className="text-muted-foreground text-sm">
											You have no badges
										</span>
									)}
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
