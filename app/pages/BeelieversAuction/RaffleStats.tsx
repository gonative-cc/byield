import { formatSUI } from "~/lib/denoms";
import { StatsCard } from "./StatsCard";

interface RaffleStatsProps {
	totalRaffleInMist: number;
}

export function RaffleStats({ totalRaffleInMist }: RaffleStatsProps) {
	return (
		<div className="flex flex-col sm:flex-row gap-2 sm:gap-6 w-full max-w-3xl">
			<StatsCard title={formatSUI(BigInt(totalRaffleInMist)) + " nBTC"}>
				Total Raffle amount. Winners will be able to claim nBTC once the mainnet is live.
			</StatsCard>
		</div>
	);
}
